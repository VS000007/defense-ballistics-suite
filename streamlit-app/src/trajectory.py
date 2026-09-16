"""
Trajectory processing and temporal interpolation for synthetic targets.
Academic synthetic simulation — not for operational use.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
from src.coordinate_utils import distance_point_to_polygon, euclidean_distance_2d


class TargetTrajectory:
    """Represents a time-indexed target trajectory."""

    def __init__(self, target_id: str, scenario: str, priority_weight: float, data_points: List[Dict[str, Any]]):
        self.target_id = target_id
        self.scenario = scenario
        self.priority_weight = priority_weight
        # Sort points strictly by time_s
        self.points = sorted(data_points, key=lambda p: p["time_s"])
        
        self.times = np.array([p["time_s"] for p in self.points], dtype=float)
        self.xs = np.array([p["x_km"] for p in self.points], dtype=float)
        self.ys = np.array([p["y_km"] for p in self.points], dtype=float)
        self.altitudes = np.array([p["altitude_km"] for p in self.points], dtype=float)
        self.speeds = np.array([p["speed_km_s"] for p in self.points], dtype=float)
        self.directions = np.array([p["direction_deg"] for p in self.points], dtype=float)

    @property
    def total_duration_s(self) -> float:
        return float(self.times[-1] - self.times[0]) if len(self.times) > 1 else 0.0

    @property
    def mean_altitude_km(self) -> float:
        return float(np.mean(self.altitudes))

    @property
    def mean_speed_km_s(self) -> float:
        return float(np.mean(self.speeds))

    def position_at_time(self, t: float) -> Tuple[float, float, float]:
        """Interpolates (x, y, altitude) in km at query time t."""
        t_clamped = float(np.clip(t, self.times[0], self.times[-1]))
        x = float(np.interp(t_clamped, self.times, self.xs))
        y = float(np.interp(t_clamped, self.times, self.ys))
        alt = float(np.interp(t_clamped, self.times, self.altitudes))
        return x, y, alt

    def compute_window_and_min_distance(
        self, polygon_coords: List[List[float]], max_distance_km: float
    ) -> Tuple[float, float]:
        """
        Computes:
        1. Minimum distance (km) between trajectory and polygon boundary.
        2. Total duration (seconds) target spends within max_distance_km of the polygon.
        """
        dense_times = np.linspace(self.times[0], self.times[-1], num=max(len(self.times) * 5, 50))
        dense_xs = np.interp(dense_times, self.times, self.xs)
        dense_ys = np.interp(dense_times, self.times, self.ys)

        distances = [
            distance_point_to_polygon((dense_xs[i], dense_ys[i]), polygon_coords)
            for i in range(len(dense_times))
        ]
        min_dist = min(distances)

        dt = float(dense_times[1] - dense_times[0]) if len(dense_times) > 1 else 1.0
        time_within_window = sum(dt for d in distances if d <= max_distance_km)

        return float(min_dist), float(time_within_window)
