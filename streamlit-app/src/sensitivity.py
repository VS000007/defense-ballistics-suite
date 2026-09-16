"""
Automated parametric sensitivity analysis module.
Academic synthetic simulation — not for operational use.
"""

from typing import Dict, List, Any
import copy
import pandas as pd

from src.models import CandidateSite, OptimizationResult
from src.trajectory import TargetTrajectory
from src.feasibility import FeasibilityResult
from src.optimizer import CandidateSiteOptimizer


class SensitivityEngine:
    """Evaluates solution stability across budget, probability, capacity, and weight variations."""

    def __init__(
        self,
        trajectories: Dict[str, TargetTrajectory],
        sites: Dict[str, CandidateSite],
        feasibility_results: List[FeasibilityResult],
    ):
        self.trajectories = trajectories
        self.sites = sites
        self.feasibility_results = feasibility_results

    def run_full_sensitivity(
        self,
        base_mode: str = "Mode A: Maximum protection",
        base_budget: float = 25.0,
        base_max_sites: int = 5,
        base_threshold: float = 0.70,
        alpha: float = 0.05,
        beta: float = 1.50,
    ) -> pd.DataFrame:
        """Runs sensitivity variations and compiles standardized comparative table."""
        records = []

        def record_run(param_name: str, param_val: Any, res: OptimizationResult):
            records.append({
                "parameter_changed": param_name,
                "parameter_value": str(param_val),
                "selected_site_count": len(res.selected_sites),
                "total_cost": res.total_cost,
                "weighted_protection": res.weighted_protection,
                "mean_protection": res.mean_protection,
                "minimum_protection": res.minimum_protection,
                "below_threshold_count": len(res.below_threshold_targets),
            })

        # Baseline run
        base_opt = CandidateSiteOptimizer(self.trajectories, self.sites, self.feasibility_results)
        res_baseline = base_opt.solve(
            mode=base_mode, budget=base_budget, max_sites=base_max_sites,
            min_protection_threshold=base_threshold, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
        )
        record_run("Baseline", "Nominal", res_baseline)

        # 1. Budget Variations: -20%, +20%
        for factor, label in [(0.80, "-20% (Budget)"), (1.20, "+20% (Budget)")]:
            b_val = round(base_budget * factor, 1)
            res = base_opt.solve(
                mode=base_mode, budget=b_val, max_sites=base_max_sites,
                min_protection_threshold=base_threshold, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
            )
            record_run("Budget", f"{b_val:.1f} ({label})", res)

        # 2. Maximum Sites Variations: -1, +1
        for s_delta in [-1, 1]:
            s_val = max(1, base_max_sites + s_delta)
            res = base_opt.solve(
                mode=base_mode, budget=base_budget, max_sites=s_val,
                min_protection_threshold=base_threshold, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
            )
            record_run("Max Sites", f"{s_val}", res)

        # 3. Capacity Variations: -1, +1
        for cap_delta in [-1, 1]:
            mod_sites = {}
            for s_id, s_obj in self.sites.items():
                s_copy = copy.deepcopy(s_obj)
                s_copy.capacity = max(1, s_obj.capacity + cap_delta)
                mod_sites[s_id] = s_copy
            cap_opt = CandidateSiteOptimizer(self.trajectories, mod_sites, self.feasibility_results)
            res = cap_opt.solve(
                mode=base_mode, budget=base_budget, max_sites=base_max_sites,
                min_protection_threshold=base_threshold, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
            )
            label = f"{cap_delta:+d} unit"
            record_run("Site Capacity", label, res)

        # 4. Probability Variations: -10%, +10%
        for p_factor, p_label in [(0.90, "-10%"), (1.10, "+10%")]:
            mod_feas = []
            for fr in self.feasibility_results:
                fr_copy = copy.deepcopy(fr)
                fr_copy.simulated_success_probability = round(
                    max(0.0, min(1.0, fr.simulated_success_probability * p_factor)), 4
                )
                mod_feas.append(fr_copy)
            prob_opt = CandidateSiteOptimizer(self.trajectories, self.sites, mod_feas)
            res = prob_opt.solve(
                mode=base_mode, budget=base_budget, max_sites=base_max_sites,
                min_protection_threshold=base_threshold, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
            )
            record_run("Simulated Probability", p_label, res)

        # 5. Threshold Variation: 0.50 vs 0.85
        for t_val in [0.50, 0.85]:
            res = base_opt.solve(
                mode=base_mode, budget=base_budget, max_sites=base_max_sites,
                min_protection_threshold=t_val, cost_penalty_alpha=alpha, shortfall_penalty_beta=beta
            )
            record_run("Threshold (R_i)", f"{t_val:.2f}", res)

        return pd.DataFrame(records)
