"""
Data schemas and domain models for Synthetic Probabilistic Candidate-Site Optimization.
Academic synthetic simulation — not for operational use.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator


class TargetTimeStep(BaseModel):
    target_id: str
    scenario: str
    time_s: float = Field(ge=0.0)
    x_km: float = Field(ge=0.0, le=100.0)
    y_km: float = Field(ge=0.0, le=100.0)
    altitude_km: float = Field(ge=0.0, le=200.0)
    speed_km_s: float = Field(ge=0.0, le=10.0)
    direction_deg: float = Field(ge=0.0, le=360.0)
    priority_weight: float = Field(default=1.0, ge=0.1, le=10.0)

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        valid = {"short", "medium", "long"}
        if v.lower() not in valid:
            raise ValueError(f"Scenario must be one of {valid}, got {v}")
        return v.lower()


class CandidateSite(BaseModel):
    site_id: str
    normalized_cost: float = Field(ge=1.0, le=10.0)
    capacity: int = Field(ge=1, le=10)
    access_score: float = Field(ge=0.0, le=1.0)
    communication_score: float = Field(ge=0.0, le=1.0)
    sensor_score: float = Field(ge=0.0, le=1.0)
    quality_score: float = Field(ge=0.0, le=1.0)
    polygon_coordinates: List[List[float]] = Field(
        ..., description="List of [x, y] coordinates in km defining polygon boundary"
    )

    @field_validator("polygon_coordinates")
    @classmethod
    def validate_coords(cls, coords: List[List[float]]) -> List[List[float]]:
        if len(coords) < 3:
            raise ValueError("Polygon must have at least 3 vertices.")
        for pt in coords:
            if len(pt) < 2:
                raise ValueError("Each vertex must have [x, y] coordinates.")
            if not (0.0 <= pt[0] <= 100.0 and 0.0 <= pt[1] <= 100.0):
                raise ValueError(f"Vertex coordinates {pt} out of bounds [0, 100] km.")
        return coords


class FeasibilityResult(BaseModel):
    target_id: str
    site_id: str
    feasible: bool
    distance_score: float = Field(ge=0.0, le=1.0)
    timing_score: float = Field(ge=0.0, le=1.0)
    quality_score: float = Field(ge=0.0, le=1.0)
    simulated_success_probability: float = Field(ge=0.0, le=1.0)
    reason: str


class OptimizationRequest(BaseModel):
    scenario: str = "all"
    optimization_mode: str = "Mode A: Maximum protection"
    budget: float = Field(default=25.0, ge=1.0)
    max_sites: int = Field(default=5, ge=1)
    min_protection_threshold: float = Field(default=0.70, ge=0.0, le=1.0)
    cost_penalty_alpha: float = Field(default=0.05, ge=0.0)
    shortfall_penalty_beta: float = Field(default=1.5, ge=0.0)
    random_seed: int = 42


class OptimizationResult(BaseModel):
    selected_sites: List[str]
    assignments: Dict[str, Dict[str, int]]  # {target_id: {site_id: units}}
    target_protection: Dict[str, float]     # {target_id: protection_probability}
    total_cost: float
    weighted_protection: float
    mean_protection: float
    minimum_protection: float
    below_threshold_targets: List[str]
    objective_value: float
    solver_status: str
    disclaimer: str = "Academic synthetic simulation — not for operational use."
