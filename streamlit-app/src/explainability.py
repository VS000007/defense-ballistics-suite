"""
Plain-language explainability and contribution engine for site selection decisions.
Academic synthetic simulation — not for operational use.
"""

from typing import Dict, List, Any
import copy

from src.models import CandidateSite, OptimizationResult
from src.trajectory import TargetTrajectory
from src.feasibility import FeasibilityResult


class ExplainabilityEngine:
    """Generates accessible, transparent audit explanations for optimization outcomes."""

    def __init__(
        self,
        trajectories: Dict[str, TargetTrajectory],
        sites: Dict[str, CandidateSite],
        feasibility_results: List[FeasibilityResult],
    ):
        self.trajectories = trajectories
        self.sites = sites
        self.feasibility_map = {
            (r.target_id, r.site_id): r for r in feasibility_results
        }

    def generate_explanations(
        self, result: OptimizationResult, budget: float
    ) -> Dict[str, Any]:
        """Produces detailed breakdown for both selected and unselected candidate sites."""
        selected_explanations = []
        unselected_explanations = []

        # Map which targets are protected by which sites
        site_to_targets = {s: [] for s in self.sites}
        for t_id, allocs in result.assignments.items():
            for s_id, units in allocs.items():
                if units > 0:
                    site_to_targets[s_id].append(t_id)

        # 1. Explain Selected Sites
        for s_id in result.selected_sites:
            site = self.sites[s_id]
            protected = site_to_targets.get(s_id, [])
            target_list_str = ", ".join(protected) if protected else "None (Reserve standby)"

            # Estimate marginal contribution by removing this site
            marginal_gain = sum(
                self.feasibility_map[(t, s_id)].simulated_success_probability * self.trajectories[t].priority_weight
                for t in protected
                if (t, s_id) in self.feasibility_map
            )

            explanation = {
                "site_id": s_id,
                "status": "Selected",
                "normalized_cost": site.normalized_cost,
                "capacity": site.capacity,
                "quality_score": site.quality_score,
                "protected_targets": protected,
                "target_count": len(protected),
                "estimated_marginal_gain": round(marginal_gain, 3),
                "plain_language_summary": (
                    f"Candidate Site {s_id} is recommended for deployment with quality rating {site.quality_score:.2f}. "
                    f"Provides primary geometric coverage across {len(protected)} priority vector(s) [{target_list_str}]. "
                    f"Delivers an estimated marginal system protection contribution of +{marginal_gain:.2f} at a normalized deployment cost of ${site.normalized_cost:.1f}."
                ),
            }
            selected_explanations.append(explanation)

        # 2. Explain Unselected Sites
        selected_costs = sum(self.sites[s].normalized_cost for s in result.selected_sites)
        remaining_budget = budget - selected_costs

        for s_id in sorted(self.sites.keys()):
            if s_id in result.selected_sites:
                continue
            site = self.sites[s_id]

            # Feasible target count
            feasible_targets = [
                t_id for t_id in self.trajectories
                if self.feasibility_map.get((t_id, s_id)) and self.feasibility_map[(t_id, s_id)].feasible
            ]

            reasons = []
            if site.normalized_cost > remaining_budget:
                reasons.append(f"Allocation cost (${site.normalized_cost:.1f}) exceeds remaining budget cap (${remaining_budget:.1f})")

            if len(feasible_targets) == 0:
                reasons.append("Zero geometric coverage overlap with active scenario vectors")
            elif len(feasible_targets) <= 2:
                reasons.append(f"Sub-optimal spatial reach (only {len(feasible_targets)} vector(s) in range)")

            if site.quality_score < 0.60:
                reasons.append(f"Composite site index ({site.quality_score:.2f}) ranks below deployed alternatives")

            # Check if dominated by another site
            better_sites = [
                s2 for s2 in result.selected_sites
                if self.sites[s2].quality_score >= site.quality_score and self.sites[s2].normalized_cost <= site.normalized_cost
            ]
            if better_sites:
                reasons.append(f"Cost-efficiency dominated by active site(s) {', '.join(better_sites)}")

            if not reasons:
                reasons.append("Marginal gain threshold was surpassed by higher-ranked candidate sites under the maximum facility ceiling")

            unselected_explanations.append({
                "site_id": s_id,
                "status": "Not Selected",
                "normalized_cost": site.normalized_cost,
                "capacity": site.capacity,
                "quality_score": site.quality_score,
                "feasible_targets": feasible_targets,
                "feasible_count": len(feasible_targets),
                "primary_reason": "; ".join(reasons),
                "plain_language_summary": (
                    f"Candidate Site {s_id} remains in reserve. Primary factor: {reasons[0]}. "
                    f"Selecting this facility would diminish overall portfolio cost-effectiveness."
                ),
            })

        return {
            "selected_explanations": selected_explanations,
            "unselected_explanations": unselected_explanations,
        }
