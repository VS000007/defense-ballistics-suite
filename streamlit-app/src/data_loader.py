"""
Data ingestion, parsing, and validation for Synthetic Site Optimizer.
Academic synthetic simulation — not for operational use.
"""

import json
import os
from typing import Dict, List, Any, Tuple
import pandas as pd
import yaml
from shapely.geometry import shape, Polygon

from src.models import TargetTimeStep, CandidateSite
from src.trajectory import TargetTrajectory


class DataLoader:
    """Loads, validates, and prepares synthetic targets, candidate sites, and simulation configs."""

    def __init__(self, data_dir: str):
        self.data_dir = data_dir

    def load_parameters(self, filename: str = "synthetic_parameters.yaml") -> Dict[str, Any]:
        path = os.path.join(self.data_dir, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Configuration file not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data

    def load_targets(self, filename: str = "synthetic_targets.csv") -> Tuple[pd.DataFrame, Dict[str, TargetTrajectory]]:
        path = os.path.join(self.data_dir, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Targets file not found: {path}")
        df = pd.read_csv(path)
        required_cols = {
            "target_id", "scenario", "time_s", "x_km", "y_km",
            "altitude_km", "speed_km_s", "direction_deg", "priority_weight"
        }
        missing = required_cols - set(df.columns)
        if missing:
            raise ValueError(f"Targets CSV missing required columns: {missing}")

        # Validate rows using Pydantic
        trajectories: Dict[str, TargetTrajectory] = {}
        for target_id, group in df.groupby("target_id"):
            records = group.to_dict(orient="records")
            # validate each record
            for r in records:
                TargetTimeStep(**r)
            scenario = str(records[0]["scenario"])
            priority = float(records[0]["priority_weight"])
            trajectories[str(target_id)] = TargetTrajectory(
                target_id=str(target_id),
                scenario=scenario,
                priority_weight=priority,
                data_points=records
            )

        return df, trajectories

    def load_sites(self, filename: str = "synthetic_sites.geojson") -> Dict[str, CandidateSite]:
        path = os.path.join(self.data_dir, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Sites GeoJSON not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data.get("features", [])
        if not features:
            raise ValueError("No features found in synthetic sites GeoJSON")

        sites: Dict[str, CandidateSite] = {}
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            if geom.get("type") != "Polygon":
                raise ValueError(f"Site geometry must be Polygon, got {geom.get('type')}")
            coords = geom.get("coordinates", [[]])[0]
            site_obj = CandidateSite(
                site_id=props["site_id"],
                normalized_cost=props["normalized_cost"],
                capacity=props["capacity"],
                access_score=props["access_score"],
                communication_score=props["communication_score"],
                sensor_score=props["sensor_score"],
                quality_score=props["quality_score"],
                polygon_coordinates=coords
            )
            sites[site_obj.site_id] = site_obj

        return sites
