"""
Performance and evaluation metrics for candidate site selection solutions.
Academic synthetic simulation — not for operational use.
"""

from typing import Dict, List, Any
import numpy as np


def evaluate_solution_metrics(
    selected_sites: List[str],
    assignments: Dict[str, Dict[str, int]],  # {target_id: {site_id: units}}
    target_protection: Dict[str, float],     # {target_id: P_i}
    target_weights: Dict[str, float],        # {target_id: w_i}
    site_costs: Dict[str, float],            # {site_id: c_j}
    site_capacities: Dict[str, int],         # {site_id: n_j}
    threshold: float = 0.70,
    cost_penalty_alpha: float = 0.05,
    shortfall_penalty_beta: float = 1.50,
) -> Dict[str, Any]:
    """Computes full mathematical metrics suite for a deployment assignment."""
    total_cost = sum(site_costs.get(s, 0.0) for s in selected_sites)

    protection_vals = list(target_protection.values())
    if protection_vals:
        mean_prot = float(np.mean(protection_vals))
        min_prot = float(np.min(protection_vals))
    else:
        mean_prot = 0.0
        min_prot = 0.0

    weighted_prot = sum(
        target_weights.get(t_id, 1.0) * p for t_id, p in target_protection.items()
    )

    shortfall = sum(
        max(0.0, threshold - p) for p in protection_vals
    )

    below_threshold = [
        t_id for t_id, p in target_protection.items() if p < threshold
    ]

    objective_value = (
        weighted_prot
        - cost_penalty_alpha * total_cost
        - shortfall_penalty_beta * shortfall
    )

    # Capacity utilization per site
    utilization = {}
    for s in selected_sites:
        cap = site_capacities.get(s, 1)
        used = sum(
            target_allocs.get(s, 0)
            for target_allocs in assignments.values()
        )
        utilization[s] = {
            "used": used,
            "capacity": cap,
            "percent": round(100.0 * used / max(1, cap), 1),
        }

    return {
        "total_cost": round(total_cost, 2),
        "weighted_protection": round(weighted_prot, 3),
        "mean_protection": round(mean_prot, 3),
        "minimum_protection": round(min_prot, 3),
        "shortfall_sum": round(shortfall, 3),
        "below_threshold_targets": below_threshold,
        "below_threshold_count": len(below_threshold),
        "objective_value": round(objective_value, 3),
        "capacity_utilization": utilization,
    }
