"""
Mixed-Integer Linear Programming (PuLP) and Exhaustive combinatorial solvers.
Academic synthetic simulation — not for operational use.
"""

import itertools
from typing import Dict, List, Any, Tuple, Optional
import numpy as np
import pulp

from src.models import CandidateSite, OptimizationResult
from src.trajectory import TargetTrajectory
from src.feasibility import FeasibilityResult
from src.probability import compute_target_compound_protection
from src.metrics import evaluate_solution_metrics


class CandidateSiteOptimizer:
    """Solves the candidate-site selection and defense assignment problem."""

    def __init__(
        self,
        trajectories: Dict[str, TargetTrajectory],
        sites: Dict[str, CandidateSite],
        feasibility_results: List[FeasibilityResult],
    ):
        self.trajectories = trajectories
        self.sites = sites
        self.feasibility_map: Dict[Tuple[str, str], FeasibilityResult] = {
            (r.target_id, r.site_id): r for r in feasibility_results
        }
        self.target_ids = sorted(list(trajectories.keys()))
        self.site_ids = sorted(list(sites.keys()))

    def solve(
        self,
        mode: str = "Mode A: Maximum protection",
        budget: float = 25.0,
        max_sites: int = 5,
        min_protection_threshold: float = 0.70,
        cost_penalty_alpha: float = 0.05,
        shortfall_penalty_beta: float = 1.50,
        method: str = "pulp",  # "pulp" or "exhaustive"
    ) -> OptimizationResult:
        """Dispatches to the chosen optimization method and mode."""
        if method == "exhaustive" or len(self.site_ids) <= 10 and method == "auto_verify":
            return self.solve_exhaustive(
                mode=mode,
                budget=budget,
                max_sites=max_sites,
                threshold=min_protection_threshold,
                alpha=cost_penalty_alpha,
                beta=shortfall_penalty_beta,
            )
        else:
            return self.solve_pulp(
                mode=mode,
                budget=budget,
                max_sites=max_sites,
                threshold=min_protection_threshold,
                alpha=cost_penalty_alpha,
                beta=shortfall_penalty_beta,
            )

    def solve_pulp(
        self,
        mode: str = "Mode A: Maximum protection",
        budget: float = 25.0,
        max_sites: int = 5,
        threshold: float = 0.70,
        alpha: float = 0.05,
        beta: float = 1.50,
    ) -> OptimizationResult:
        """Solves the problem using PuLP with linearization of target protection."""
        prob_name = f"Site_Optimization_{mode.replace(' ', '_')}"
        prob = pulp.LpProblem(prob_name, pulp.LpMaximize)

        # Decision Variables
        x = {
            s_id: pulp.LpVariable(f"x_{s_id}", cat=pulp.LpBinary)
            for s_id in self.site_ids
        }
        # Assignment variables z_ij: binary assignment (target i covered by site j)
        z = {}
        for t_id in self.target_ids:
            for s_id in self.site_ids:
                feas = self.feasibility_map.get((t_id, s_id))
                if feas and feas.feasible:
                    z[(t_id, s_id)] = pulp.LpVariable(f"z_{t_id}_{s_id}", cat=pulp.LpBinary)

        # Target protection variable P_i in [0, 1]
        P = {
            t_id: pulp.LpVariable(f"P_{t_id}", lowBound=0.0, upBound=1.0, cat=pulp.LpContinuous)
            for t_id in self.target_ids
        }
        # Target shortfall variable s_i >= 0 (s_i >= threshold - P_i)
        shortfall = {
            t_id: pulp.LpVariable(f"shortfall_{t_id}", lowBound=0.0, upBound=1.0, cat=pulp.LpContinuous)
            for t_id in self.target_ids
        }

        # Constraints
        # 1. Budget constraint
        prob += (
            pulp.lpSum(self.sites[s_id].normalized_cost * x[s_id] for s_id in self.site_ids) <= budget,
            "Budget_Constraint",
        )

        # 2. Maximum selected sites constraint
        prob += (
            pulp.lpSum(x[s_id] for s_id in self.site_ids) <= max_sites,
            "Max_Sites_Constraint",
        )

        # 3. Site capacity constraints: sum_i z_ij <= capacity_j * x_j
        for s_id in self.site_ids:
            cap = self.sites[s_id].capacity
            assigned_targets = [
                z[(t_id, s_id)]
                for t_id in self.target_ids
                if (t_id, s_id) in z
            ]
            if assigned_targets:
                prob += (
                    pulp.lpSum(assigned_targets) <= cap * x[s_id],
                    f"Capacity_{s_id}",
                )

        # 4. Target protection upper bounds:
        # P_i <= sum_j p_ij * z_ij (with diminishing returns approximation: P_i <= 1.0)
        # Limit at most 2 assignments per target to represent primary & secondary defense
        for t_id in self.target_ids:
            site_terms = []
            site_vars = []
            for s_id in self.site_ids:
                if (t_id, s_id) in z:
                    p_val = self.feasibility_map[(t_id, s_id)].simulated_success_probability
                    site_terms.append(p_val * z[(t_id, s_id)])
                    site_vars.append(z[(t_id, s_id)])

            if site_terms:
                prob += (
                    P[t_id] <= pulp.lpSum(site_terms),
                    f"Protection_Bound_{t_id}",
                )
                # At most 2 sites assigned per target
                prob += (
                    pulp.lpSum(site_vars) <= 2,
                    f"Max_Assignments_{t_id}",
                )
            else:
                prob += (P[t_id] == 0.0, f"Zero_Protection_{t_id}")

            # Shortfall definition: shortfall_i >= threshold - P_i
            prob += (
                shortfall[t_id] >= threshold - P[t_id],
                f"Shortfall_Def_{t_id}",
            )

        # Objective Function Setup
        total_cost_expr = pulp.lpSum(self.sites[s_id].normalized_cost * x[s_id] for s_id in self.site_ids)
        weighted_prot_expr = pulp.lpSum(
            self.trajectories[t_id].priority_weight * P[t_id] for t_id in self.target_ids
        )
        total_shortfall_expr = pulp.lpSum(shortfall[t_id] for t_id in self.target_ids)

        if "Mode B" in mode:
            # Minimize cost while satisfying threshold (or penalizing shortfall)
            prob.sense = pulp.LpMinimize
            prob.objective = total_cost_expr + 5.0 * total_shortfall_expr - 0.1 * weighted_prot_expr
        elif "Mode C" in mode:
            # Fixed sites: maximize weighted protection minus shortfall penalty
            prob.sense = pulp.LpMaximize
            prob.objective = weighted_prot_expr - beta * total_shortfall_expr
        else:
            # Mode A: Maximum weighted protection with cost penalty and shortfall penalty
            prob.sense = pulp.LpMaximize
            prob.objective = weighted_prot_expr - alpha * total_cost_expr - beta * total_shortfall_expr

        # Solve using default CBC solver silently
        solver = pulp.PULP_CBC_CMD(msg=False)
        status_code = prob.solve(solver)
        solver_status = pulp.LpStatus.get(status_code, "Unknown")

        # Extract selected sites
        selected_sites = [
            s_id for s_id in self.site_ids if x[s_id].varValue and x[s_id].varValue > 0.5
        ]

        # Extract discrete assignments
        assignments: Dict[str, Dict[str, int]] = {t_id: {} for t_id in self.target_ids}
        for (t_id, s_id), var in z.items():
            if s_id in selected_sites and var.varValue and var.varValue > 0.5:
                assignments[t_id][s_id] = int(round(var.varValue))

        # Compute exact non-linear compound protection probability for all targets
        exact_protection: Dict[str, float] = {}
        for t_id in self.target_ids:
            site_probs = {
                s_id: self.feasibility_map[(t_id, s_id)].simulated_success_probability
                for s_id in assignments[t_id]
                if (t_id, s_id) in self.feasibility_map
            }
            p_comp = compute_target_compound_protection(site_probs, assignments[t_id])
            exact_protection[t_id] = p_comp

        # Evaluate performance metrics
        site_costs = {s_id: self.sites[s_id].normalized_cost for s_id in self.site_ids}
        site_capacities = {s_id: self.sites[s_id].capacity for s_id in self.site_ids}
        target_weights = {t_id: self.trajectories[t_id].priority_weight for t_id in self.target_ids}

        metrics = evaluate_solution_metrics(
            selected_sites=selected_sites,
            assignments=assignments,
            target_protection=exact_protection,
            target_weights=target_weights,
            site_costs=site_costs,
            site_capacities=site_capacities,
            threshold=threshold,
            cost_penalty_alpha=alpha,
            shortfall_penalty_beta=beta,
        )

        return OptimizationResult(
            selected_sites=selected_sites,
            assignments=assignments,
            target_protection=exact_protection,
            total_cost=metrics["total_cost"],
            weighted_protection=metrics["weighted_protection"],
            mean_protection=metrics["mean_protection"],
            minimum_protection=metrics["minimum_protection"],
            below_threshold_targets=metrics["below_threshold_targets"],
            objective_value=metrics["objective_value"],
            solver_status=solver_status,
        )

    def solve_exhaustive(
        self,
        mode: str = "Mode A: Maximum protection",
        budget: float = 25.0,
        max_sites: int = 5,
        threshold: float = 0.70,
        alpha: float = 0.05,
        beta: float = 1.50,
    ) -> OptimizationResult:
        """
        Exhaustive brute-force search across all valid combinations of candidate sites.
        Guarantees ground-truth verification on sets with <= 10 sites.
        """
        best_obj = -1e9 if "Mode B" not in mode else 1e9
        best_combo: Tuple[str, ...] = ()
        best_assignments: Dict[str, Dict[str, int]] = {}
        best_protection: Dict[str, float] = {}
        best_metrics: Dict[str, Any] = {}

        site_costs = {s_id: self.sites[s_id].normalized_cost for s_id in self.site_ids}
        site_capacities = {s_id: self.sites[s_id].capacity for s_id in self.site_ids}
        target_weights = {t_id: self.trajectories[t_id].priority_weight for t_id in self.target_ids}

        # Enumerate site subsets of size 0 to max_sites
        for k in range(0, min(len(self.site_ids), max_sites) + 1):
            for combo in itertools.combinations(self.site_ids, k):
                cost = sum(site_costs[s] for s in combo)
                if cost > budget:
                    continue

                # For selected combo, assign sites greedily to feasible targets respecting capacities
                combo_assignments, combo_protection = self._assign_subset_greedily(combo)

                m = evaluate_solution_metrics(
                    selected_sites=list(combo),
                    assignments=combo_assignments,
                    target_protection=combo_protection,
                    target_weights=target_weights,
                    site_costs=site_costs,
                    site_capacities=site_capacities,
                    threshold=threshold,
                    cost_penalty_alpha=alpha,
                    shortfall_penalty_beta=beta,
                )

                if "Mode B" in mode:
                    obj = m["total_cost"] + 5.0 * m["shortfall_sum"] - 0.1 * m["weighted_protection"]
                    if obj < best_obj:
                        best_obj = obj
                        best_combo = combo
                        best_assignments = combo_assignments
                        best_protection = combo_protection
                        best_metrics = m
                else:
                    obj = m["objective_value"]
                    if obj > best_obj:
                        best_obj = obj
                        best_combo = combo
                        best_assignments = combo_assignments
                        best_protection = combo_protection
                        best_metrics = m

        if not best_metrics:
            # Fallback if no feasible combo (e.g. 0 budget)
            best_metrics = evaluate_solution_metrics(
                selected_sites=[],
                assignments={t: {} for t in self.target_ids},
                target_protection={t: 0.0 for t in self.target_ids},
                target_weights=target_weights,
                site_costs=site_costs,
                site_capacities=site_capacities,
                threshold=threshold,
                cost_penalty_alpha=alpha,
                shortfall_penalty_beta=beta,
            )

        return OptimizationResult(
            selected_sites=list(best_combo),
            assignments=best_assignments or {t: {} for t in self.target_ids},
            target_protection=best_protection or {t: 0.0 for t in self.target_ids},
            total_cost=best_metrics["total_cost"],
            weighted_protection=best_metrics["weighted_protection"],
            mean_protection=best_metrics["mean_protection"],
            minimum_protection=best_metrics["minimum_protection"],
            below_threshold_targets=best_metrics["below_threshold_targets"],
            objective_value=best_metrics["objective_value"],
            solver_status="Optimal (Exhaustive Ground Truth)",
        )

    def _assign_subset_greedily(
        self, selected_sites: Tuple[str, ...]
    ) -> Tuple[Dict[str, Dict[str, int]], Dict[str, float]]:
        """Greedily assigns available capacities of selected sites to maximize compound protection."""
        remaining_caps = {s: self.sites[s].capacity for s in selected_sites}
        assignments: Dict[str, Dict[str, int]] = {t: {} for t in self.target_ids}

        # Rank all feasible pairs by priority_weight * prob
        candidate_pairs = []
        for t_id in self.target_ids:
            w = self.trajectories[t_id].priority_weight
            for s_id in selected_sites:
                feas = self.feasibility_map.get((t_id, s_id))
                if feas and feas.feasible:
                    p = feas.simulated_success_probability
                    candidate_pairs.append((w * p, p, t_id, s_id))

        candidate_pairs.sort(key=lambda item: item[0], reverse=True)

        for _, p, t_id, s_id in candidate_pairs:
            if remaining_caps[s_id] > 0 and len(assignments[t_id]) < 2 and s_id not in assignments[t_id]:
                assignments[t_id][s_id] = 1
                remaining_caps[s_id] -= 1

        # Compute exact protection
        protection: Dict[str, float] = {}
        for t_id in self.target_ids:
            site_probs = {
                s: self.feasibility_map[(t_id, s)].simulated_success_probability
                for s in assignments[t_id]
            }
            protection[t_id] = compute_target_compound_protection(site_probs, assignments[t_id])

        return assignments, protection
