"""
Synthetic reproducible dataset generator for Synthetic Candidate-Site Optimization.
Academic synthetic simulation — not for operational use.
"""

import json
import math
import os
from typing import Dict, Any, List
import numpy as np
import pandas as pd
import yaml


def generate_synthetic_data(
    output_dir: str,
    random_seed: int = 42,
    grid_size_km: float = 100.0,
) -> Dict[str, str]:
    """
    Generates synthetic targets CSV, synthetic sites GeoJSON, and synthetic parameters YAML.
    All data is 100% fictional and confined to an abstract [0, 100] km x [0, 100] km coordinate frame.
    """
    os.makedirs(output_dir, exist_ok=True)
    rng = np.random.default_rng(random_seed)

    # -------------------------------------------------------------
    # 1. Generate 10 Candidate Site Polygons
    # -------------------------------------------------------------
    # Centroids scattered across the synthetic grid
    centroids_x = [15.0, 32.0, 50.0, 72.0, 85.0, 22.0, 45.0, 68.0, 80.0, 38.0]
    centroids_y = [20.0, 25.0, 18.0, 22.0, 35.0, 60.0, 55.0, 65.0, 78.0, 82.0]

    sites_features = []
    for j in range(10):
        site_id = f"S{j+1:02d}"
        cx, cy = centroids_x[j], centroids_y[j]
        # Jitter vertices to create a realistic irregular candidate land polygon
        num_vertices = rng.integers(5, 8)
        radius = rng.uniform(2.5, 4.5)  # polygon radius in km
        angles = np.sort(rng.uniform(0, 2 * np.pi, num_vertices))
        poly_coords = []
        for a in angles:
            r = radius * rng.uniform(0.8, 1.2)
            px = float(np.clip(cx + r * math.cos(a), 1.0, grid_size_km - 1.0))
            py = float(np.clip(cy + r * math.sin(a), 1.0, grid_size_km - 1.0))
            poly_coords.append([round(px, 3), round(py, 3)])
        # Close polygon
        poly_coords.append(poly_coords[0])

        # Attribute distributions
        normalized_cost = round(float(rng.uniform(2.0, 9.5)), 2)
        capacity = int(rng.integers(2, 6))  # 2 to 5 abstract interceptor units
        access_score = round(float(rng.uniform(0.40, 0.95)), 3)
        communication_score = round(float(rng.uniform(0.45, 0.98)), 3)
        sensor_score = round(float(rng.uniform(0.45, 0.95)), 3)
        quality_score = round(
            0.4 * access_score + 0.3 * communication_score + 0.3 * sensor_score, 3
        )

        feature = {
            "type": "Feature",
            "properties": {
                "site_id": site_id,
                "normalized_cost": normalized_cost,
                "capacity": capacity,
                "access_score": access_score,
                "communication_score": communication_score,
                "sensor_score": sensor_score,
                "quality_score": quality_score,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly_coords],
            },
        }
        sites_features.append(feature)

    sites_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "description": "Synthetic Candidate Sites Polygon Collection",
            "coordinate_system": "Abstract Cartesian Local Grid (km)",
            "safety_disclaimer": "Academic synthetic simulation — not for operational use.",
            "random_seed": random_seed,
        },
        "features": sites_features,
    }

    sites_path = os.path.join(output_dir, "synthetic_sites.geojson")
    with open(sites_path, "w", encoding="utf-8") as f:
        json.dump(sites_geojson, f, indent=2)

    # -------------------------------------------------------------
    # 2. Generate 12 Synthetic Targets (3 Scenarios)
    # -------------------------------------------------------------
    # 4 short, 4 medium, 4 long scenarios
    scenarios = ["short"] * 4 + ["medium"] * 4 + ["long"] * 4
    target_rows = []

    for i in range(12):
        target_id = f"T{i+1:02d}"
        scenario = scenarios[i]

        if scenario == "short":
            timesteps = rng.integers(10, 14)
            t_max = rng.uniform(40.0, 60.0)
            start_x = rng.uniform(5.0, 30.0)
            start_y = rng.uniform(5.0, 35.0)
            end_x = start_x + rng.uniform(25.0, 45.0)
            end_y = start_y + rng.uniform(25.0, 45.0)
            alt_apex = rng.uniform(25.0, 45.0)
            base_speed = rng.uniform(0.8, 1.4)
            priority_weight = float(rng.choice([1.0, 1.5, 2.0]))
        elif scenario == "medium":
            timesteps = rng.integers(14, 18)
            t_max = rng.uniform(60.0, 90.0)
            start_x = rng.uniform(5.0, 25.0)
            start_y = rng.uniform(70.0, 95.0)
            end_x = start_x + rng.uniform(40.0, 65.0)
            end_y = start_y - rng.uniform(40.0, 65.0)
            alt_apex = rng.uniform(45.0, 75.0)
            base_speed = rng.uniform(1.2, 2.0)
            priority_weight = float(rng.choice([1.5, 2.0, 2.5, 3.0]))
        else:  # long
            timesteps = rng.integers(18, 24)
            t_max = rng.uniform(90.0, 120.0)
            start_x = rng.uniform(5.0, 15.0)
            start_y = rng.uniform(10.0, 25.0)
            end_x = rng.uniform(75.0, 95.0)
            end_y = rng.uniform(75.0, 95.0)
            alt_apex = rng.uniform(70.0, 110.0)
            base_speed = rng.uniform(1.8, 2.8)
            priority_weight = float(rng.choice([2.0, 3.0, 4.0, 5.0]))

        time_steps = np.linspace(0.0, t_max, timesteps)
        dx = (end_x - start_x)
        dy = (end_y - start_y)
        heading = (math.degrees(math.atan2(dy, dx)) + 360) % 360

        for step_idx, t in enumerate(time_steps):
            fraction = t / t_max
            # Sub-linear or curved trajectory with slight synthetic lateral deflection
            arc_deflection = math.sin(fraction * math.pi) * rng.uniform(-4.0, 4.0)
            x_km = float(np.clip(start_x + fraction * dx - arc_deflection * (dy / max(1.0, math.sqrt(dx**2 + dy**2))), 0.5, grid_size_km - 0.5))
            y_km = float(np.clip(start_y + fraction * dy + arc_deflection * (dx / max(1.0, math.sqrt(dx**2 + dy**2))), 0.5, grid_size_km - 0.5))
            # Parabolic abstract altitude profile
            altitude_km = float(np.clip(10.0 + (alt_apex - 10.0) * 4.0 * fraction * (1.0 - fraction) + rng.uniform(-1.0, 1.0), 5.0, 130.0))
            # Speed profile
            speed_km_s = float(np.clip(base_speed + 0.3 * math.cos(fraction * math.pi) + rng.uniform(-0.05, 0.05), 0.5, 4.0))

            target_rows.append({
                "target_id": target_id,
                "scenario": scenario,
                "time_s": round(float(t), 2),
                "x_km": round(x_km, 3),
                "y_km": round(y_km, 3),
                "altitude_km": round(altitude_km, 2),
                "speed_km_s": round(speed_km_s, 3),
                "direction_deg": round(heading, 1),
                "priority_weight": priority_weight,
            })

    targets_df = pd.DataFrame(target_rows)
    targets_path = os.path.join(output_dir, "synthetic_targets.csv")
    targets_df.to_csv(targets_path, index=False)

    # -------------------------------------------------------------
    # 3. Generate Parameters YAML
    # -------------------------------------------------------------
    params = {
        "simulation_metadata": {
            "study_region_name": "Synthetic 100km Academic Grid",
            "grid_width_km": grid_size_km,
            "grid_height_km": grid_size_km,
            "random_seed": random_seed,
            "disclaimer": "Academic synthetic simulation — not for operational use.",
        },
        "feasibility_thresholds": {
            "max_simulated_distance_km": 80.0,
            "min_simulated_altitude_km": 5.0,
            "max_simulated_altitude_km": 120.0,
            "minimum_time_window_s": 8.0,
            "required_quality_score": 0.45,
        },
        "probability_factors": {
            "base_component_success": 0.85,
            "distance_decay_factor": 0.70,
            "speed_decay_factor": 2.0,
            "quality_weights": {
                "access": 0.40,
                "comm": 0.30,
                "sensor": 0.30,
            },
        },
        "default_optimization": {
            "budget": 24.0,
            "max_sites": 5,
            "min_protection_threshold": 0.70,
            "cost_penalty_alpha": 0.05,
            "shortfall_penalty_beta": 1.50,
        },
    }
    params_path = os.path.join(output_dir, "synthetic_parameters.yaml")
    with open(params_path, "w", encoding="utf-8") as f:
        yaml.dump(params, f, default_flow_style=False)

    return {"targets": targets_path, "sites": sites_path, "parameters": params_path}


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    data_dir = os.path.join(project_root, "data")
    res = generate_synthetic_data(data_dir, random_seed=42)
    print("Generated synthetic dataset successfully:", res)
