"""
Coordinate and spatial utilities for synthetic 100x100 km grid.
Academic synthetic simulation — not for operational use.
"""

import math
from typing import Tuple, List, Sequence
from shapely.geometry import Point, Polygon


def euclidean_distance_2d(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Computes 2D Euclidean distance between two (x, y) coordinates in km."""
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


def euclidean_distance_3d(
    p1: Tuple[float, float, float], p2: Tuple[float, float, float]
) -> float:
    """Computes 3D Euclidean distance between two (x, y, z) coordinates in km."""
    return math.sqrt(
        (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
    )


def distance_point_to_polygon(
    point: Tuple[float, float], polygon_coords: Sequence[Sequence[float]]
) -> float:
    """
    Computes minimum Euclidean distance in km from a 2D point to a polygon.
    Returns 0.0 if point is inside polygon.
    """
    pt = Point(point[0], point[1])
    poly = Polygon(polygon_coords)
    if poly.contains(pt):
        return 0.0
    return float(poly.distance(pt))


def local_km_to_synthetic_latlon(
    x_km: float, y_km: float, origin_lat: float = 0.0, origin_lon: float = 0.0
) -> Tuple[float, float]:
    """
    Projects local synthetic km coordinates to synthetic display-only lat/lon.
    Uses an arbitrary synthetic origin (0.0°N, 0.0°E, open ocean) for map projection.
    1 deg latitude ≈ 111.0 km, 1 deg longitude ≈ 111.0 km at equator.
    NOTE: Strictly for display purposes in synthetic map components.
    """
    km_per_deg_lat = 111.0
    km_per_deg_lon = 111.0
    syn_lat = origin_lat + (y_km / km_per_deg_lat)
    syn_lon = origin_lon + (x_km / km_per_deg_lon)
    return syn_lat, syn_lon


def polygon_centroid(polygon_coords: Sequence[Sequence[float]]) -> Tuple[float, float]:
    """Computes centroid (x, y) in km of a polygon."""
    poly = Polygon(polygon_coords)
    c = poly.centroid
    return float(c.x), float(c.y)
