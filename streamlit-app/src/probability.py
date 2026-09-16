"""
Probabilistic modeling of simulated engagement success and compound protection.
Academic synthetic simulation — not for operational use.
"""

import math
from typing import Dict, List, Tuple


def compute_component_probabilities(
    min_distance_km: float,
    max_distance_km: float,
    time_window_s: float,
    min_time_window_s: float,
    mean_speed_km_s: float,
    site_quality_score: float,
    sensor_score: float,
    comm_score: float,
    base_success: float = 0.85,
) -> Dict[str, float]:
    """
    Computes individual simulated probability factors for an abstract target-site interaction:
    p_detect, p_track, p_timing, p_compatibility, p_success.
    All values strictly bounded in [0.0, 1.0].
    """
    # 1. Detection probability: decays linearly with distance, boosted by sensor score
    norm_dist = min(1.0, max(0.0, min_distance_km / max(1.0, max_distance_km)))
    p_detect = max(0.05, min(1.0, (1.0 - 0.70 * norm_dist) * sensor_score))

    # 2. Tracking probability: scales with tracking duration, boosted by comm score
    norm_time = min(2.0, max(0.0, time_window_s / max(1.0, min_time_window_s)))
    p_track = max(0.05, min(1.0, (norm_time / 2.0) * comm_score))

    # 3. Timing probability: influenced by target speed relative to simulated window
    p_timing = max(0.10, min(1.0, 0.50 + 0.50 * math.exp(-mean_speed_km_s / 2.5)))

    # 4. Compatibility factor: determined by synthetic site quality
    p_compat = max(0.10, min(1.0, 0.40 + 0.60 * site_quality_score))

    # 5. Simulated component success: baseline abstract reliability
    p_success = max(0.0, min(1.0, base_success))

    # Compound simulated single-attempt success probability
    p_ij = p_detect * p_track * p_timing * p_compat * p_success
    p_ij = max(0.0, min(1.0, p_ij))

    return {
        "p_detect": round(p_detect, 4),
        "p_track": round(p_track, 4),
        "p_timing": round(p_timing, 4),
        "p_compatibility": round(p_compat, 4),
        "p_success": round(p_success, 4),
        "simulated_success_probability": round(p_ij, 4),
    }


def compute_target_compound_protection(
    single_probabilities: Dict[str, float],
    assignments: Dict[str, int],
) -> float:
    """
    Computes compound target protection probability:
    P_i = 1 - prod_j (1 - p_ij)^(z_ij)
    Assumes independent simulated attempts.
    """
    survival_prob = 1.0
    for site_id, count in assignments.items():
        if count <= 0:
            continue
        p_ij = single_probabilities.get(site_id, 0.0)
        p_ij = max(0.0, min(1.0, p_ij))
        survival_prob *= (1.0 - p_ij) ** count

    protection = 1.0 - survival_prob
    return round(max(0.0, min(1.0, protection)), 4)
