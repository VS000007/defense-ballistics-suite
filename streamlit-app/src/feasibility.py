"""
Feasibility and compatibility evaluation engine for target-site pairs.
Academic synthetic simulation — not for operational use.
"""

from typing import Dict, List, Any, Tuple
import pandas as pd

from src.models import CandidateSite, FeasibilityResult
from src.trajectory import TargetTrajectory
from src.probability import compute_component_probabilities


class FeasibilityEngine:
    """Evaluates geometric and capability feasibility between synthetic targets and candidate sites."""

    def __init__(self, parameters: Dict[str, Any]):
        thresholds = parameters.get("feasibility_thresholds", {})
        self.max_distance_km = float(thresholds.get("max_simulated_distance_km", 80.0))
        self.min_altitude_km = float(thresholds.get("min_simulated_altitude_km", 5.0))
        self.max_altitude_km = float(thresholds.get("max_simulated_altitude_km", 120.0))
        self.min_time_window_s = float(thresholds.get("minimum_time_window_s", 8.0))
        self.required_quality = float(thresholds.get("required_quality_score", 0.45))
        self.base_success = float(parameters.get("probability_factors", {}).get("base_component_success", 0.85))

    def evaluate_pair(
        self, trajectory: TargetTrajectory, site: CandidateSite
    ) -> FeasibilityResult:
        """Evaluates a single target trajectory against a candidate site polygon."""
        min_dist, time_window = trajectory.compute_window_and_min_distance(
            site.polygon_coordinates, self.max_distance_km
        )

        mean_alt = trajectory.mean_altitude_km
        mean_spd = trajectory.mean_speed_km_s

        # Abstract checks
        reasons = []
        is_feasible = True

        if min_dist > self.max_distance_km:
            is_feasible = False
            reasons.append(f"Outside synthetic distance limit ({min_dist:.1f} km > {self.max_distance_km} km)")

        if not (self.min_altitude_km <= mean_alt <= self.max_altitude_km):
            is_feasible = False
            reasons.append(f"Altitude category incompatible ({mean_alt:.1f} km not in [{self.min_altitude_km}, {self.max_altitude_km}] km)")

        if time_window < self.min_time_window_s:
            is_feasible = False
            reasons.append(f"Insufficient synthetic time window ({time_window:.1f}s < {self.min_time_window_s}s)")

        if site.quality_score < self.required_quality:
            is_feasible = False
            reasons.append(f"Below quality threshold ({site.quality_score:.2f} < {self.required_quality:.2f})")

        # Scores normalized between 0 and 1
        distance_score = round(max(0.0, min(1.0, 1.0 - (min_dist / max(1.0, self.max_distance_km)))), 3)
        timing_score = round(max(0.0, min(1.0, time_window / max(1.0, self.min_time_window_s * 2.0))), 3)
        quality_score = round(site.quality_score, 3)

        if is_feasible:
            reason_str = "Simulated feasibility criteria satisfied"
            prob_dict = compute_component_probabilities(
                min_distance_km=min_dist,
                max_distance_km=self.max_distance_km,
                time_window_s=time_window,
                min_time_window_s=self.min_time_window_s,
                mean_speed_km_s=mean_spd,
                site_quality_score=site.quality_score,
                sensor_score=site.sensor_score,
                comm_score=site.communication_score,
                base_success=self.base_success,
            )
            sim_prob = prob_dict["simulated_success_probability"]
        else:
            reason_str = "; ".join(reasons)
            sim_prob = 0.0

        return FeasibilityResult(
            target_id=trajectory.target_id,
            site_id=site.site_id,
            feasible=is_feasible,
            distance_score=distance_score,
            timing_score=timing_score,
            quality_score=quality_score,
            simulated_success_probability=sim_prob,
            reason=reason_str,
        )

    def evaluate_all(
        self,
        trajectories: Dict[str, TargetTrajectory],
        sites: Dict[str, CandidateSite],
    ) -> List[FeasibilityResult]:
        """Evaluates all target-site pairs and returns a list of FeasibilityResults."""
        results = []
        for t_id, traj in sorted(trajectories.items()):
            for s_id, site in sorted(sites.items()):
                res = self.evaluate_pair(traj, site)
                results.append(res)
        return results

    def results_to_dataframe(self, results: List[FeasibilityResult]) -> pd.DataFrame:
        """Converts list of results to a structured DataFrame."""
        records = [r.model_dump() for r in results]
        return pd.DataFrame(records)
