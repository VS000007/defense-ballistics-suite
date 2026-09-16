"""
Interactive visualization module using Plotly.
Academic synthetic simulation — not for operational use.
"""

from typing import Dict, List, Any
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

from src.models import CandidateSite, OptimizationResult
from src.trajectory import TargetTrajectory
from src.coordinate_utils import polygon_centroid


def create_2d_spatial_map(
    sites: Dict[str, CandidateSite],
    trajectories: Dict[str, TargetTrajectory],
    result: OptimizationResult,
    threshold: float = 0.70,
) -> go.Figure:
    """Creates a professional GIS cartographic 2D map of candidate polygons and trajectories."""
    fig = go.Figure()

    # 1. Unselected Sites (Muted Slate)
    for s_id, site in sorted(sites.items()):
        if s_id not in result.selected_sites:
            coords = site.polygon_coordinates
            xs = [pt[0] for pt in coords]
            ys = [pt[1] for pt in coords]
            cx, cy = polygon_centroid(coords)
            fig.add_trace(
                go.Scatter(
                    x=xs,
                    y=ys,
                    mode="lines",
                    fill="toself",
                    fillcolor="rgba(51, 65, 85, 0.25)",
                    line=dict(color="#475569", width=1.5, dash="dash"),
                    name=f"Site {s_id} (Unselected)",
                    hoverinfo="text",
                    text=(
                        f"<b>Candidate Site {s_id}</b> [Available]<br>"
                        f"Unit Cost: {site.normalized_cost:.1f}<br>"
                        f"Capacity: {site.capacity} units<br>"
                        f"Site Quality Index: {site.quality_score:.2f}<br>"
                        f"Sensor Score: {site.sensor_score:.2f} | Comm Score: {site.communication_score:.2f}"
                    ),
                    showlegend=False,
                )
            )
            # Subtle site ID label
            fig.add_trace(
                go.Scatter(
                    x=[cx],
                    y=[cy],
                    mode="text",
                    text=[s_id],
                    textposition="middle center",
                    textfont=dict(color="#64748b", size=9, family="Inter, sans-serif"),
                    showlegend=False,
                    hoverinfo="none",
                )
            )

    # 2. Selected Sites (Institutional Emerald / Teal)
    for s_id in result.selected_sites:
        site = sites[s_id]
        coords = site.polygon_coordinates
        xs = [pt[0] for pt in coords]
        ys = [pt[1] for pt in coords]
        cx, cy = polygon_centroid(coords)
        fig.add_trace(
            go.Scatter(
                x=xs,
                y=ys,
                mode="lines",
                fill="toself",
                fillcolor="rgba(16, 185, 129, 0.20)",
                line=dict(color="#10b981", width=2.5),
                name=f"Selected Site {s_id}",
                hoverinfo="text",
                text=(
                    f"<b>ACTIVE SITE {s_id}</b> [Deployed]<br>"
                    f"Normalized Cost: ${site.normalized_cost:.1f}<br>"
                    f"Assigned Capacity: {site.capacity} units<br>"
                    f"Quality Index: {site.quality_score:.2f}<br>"
                    f"Sensor: {site.sensor_score:.2f} | Comm: {site.communication_score:.2f}"
                ),
            )
        )
        # Prominent site label
        fig.add_trace(
            go.Scatter(
                x=[cx],
                y=[cy],
                mode="text",
                text=[f"<b>{s_id}</b>"],
                textposition="middle center",
                textfont=dict(color="#ffffff", size=11, family="Inter, sans-serif"),
                showlegend=False,
                hoverinfo="none",
            )
        )

    # 3. Intercept & Coverage Vectors (Clean dotted linkage)
    for t_id, allocs in result.assignments.items():
        for s_id, units in allocs.items():
            if units > 0 and s_id in sites and t_id in trajectories:
                scx, scy = polygon_centroid(sites[s_id].polygon_coordinates)
                mid_idx = len(trajectories[t_id].xs) // 2
                tx, ty = trajectories[t_id].xs[mid_idx], trajectories[t_id].ys[mid_idx]
                fig.add_trace(
                    go.Scatter(
                        x=[scx, tx],
                        y=[scy, ty],
                        mode="lines",
                        line=dict(color="rgba(16, 185, 129, 0.45)", width=1.5, dash="dot"),
                        showlegend=False,
                        hoverinfo="text",
                        text=f"Assignment: {s_id} -> {t_id} ({units} unit)",
                    )
                )

    # 4. Target Trajectories
    for t_id, traj in sorted(trajectories.items()):
        prot = result.target_protection.get(t_id, 0.0)
        line_color = "#10b981" if prot >= threshold else ("#f59e0b" if prot >= 0.40 else "#ef4444")

        fig.add_trace(
            go.Scatter(
                x=traj.xs,
                y=traj.ys,
                mode="lines+markers",
                marker=dict(size=4, color=line_color),
                line=dict(color=line_color, width=2.0),
                name=f"{t_id} ({prot:.1%})",
                hoverinfo="text",
                text=[
                    f"<b>Threat {t_id}</b> [{traj.scenario.upper()}]<br>"
                    f"Time: {traj.times[k]:.1f}s | Speed: {traj.speeds[k]:.2f} km/s<br>"
                    f"Grid: ({traj.xs[k]:.1f}E, {traj.ys[k]:.1f}N) km<br>"
                    f"Altitude: {traj.altitudes[k]:.1f} km<br>"
                    f"Target Protection: {prot:.1%}"
                    for k in range(len(traj.times))
                ],
            )
        )

        # Waypoint Origin
        fig.add_trace(
            go.Scatter(
                x=[traj.xs[0]],
                y=[traj.ys[0]],
                mode="markers+text",
                marker=dict(symbol="circle", size=7, color="#0f172a", line=dict(color=line_color, width=2)),
                text=[f" {t_id}"],
                textposition="middle right",
                textfont=dict(color="#cbd5e1", size=10, family="Inter, sans-serif"),
                showlegend=False,
                hoverinfo="none",
            )
        )

    fig.update_layout(
        title=dict(
            text="<b>Study Grid: Candidate Sites & Threat Trajectories</b><br><span style='font-size:11px;color:#94a3b8;'>Fictional 100 km × 100 km coordinate space. Green: Protected ≥ Threshold | Amber: Marginal | Red: Below Threshold</span>",
            font=dict(size=13, color="#f1f5f9", family="Inter, sans-serif"),
        ),
        xaxis=dict(
            title="Synthetic Easting Coordinate (km)",
            range=[-2, 102],
            showgrid=True,
            gridcolor="#1e293b",
            zeroline=False,
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#64748b"),
        ),
        yaxis=dict(
            title="Synthetic Northing Coordinate (km)",
            range=[-2, 102],
            showgrid=True,
            gridcolor="#1e293b",
            scaleanchor="x",
            scaleratio=1,
            zeroline=False,
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#64748b"),
        ),
        paper_bgcolor="#0f172a",
        plot_bgcolor="#090d16",
        margin=dict(l=50, r=30, t=65, b=45),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.22,
            xanchor="center",
            x=0.5,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    return fig


def create_3d_spatial_map(
    sites: Dict[str, CandidateSite],
    trajectories: Dict[str, TargetTrajectory],
    result: OptimizationResult,
    threshold: float = 0.70,
) -> go.Figure:
    """Creates a clean aerospace 3D spatial plot with true altitude profile."""
    fig = go.Figure()

    # 1. Base polygons at Z=0
    for s_id, site in sorted(sites.items()):
        is_sel = s_id in result.selected_sites
        coords = site.polygon_coordinates
        xs = [pt[0] for pt in coords]
        ys = [pt[1] for pt in coords]
        zs = [0.0] * len(coords)
        color = "#10b981" if is_sel else "#475569"

        fig.add_trace(
            go.Scatter3d(
                x=xs,
                y=ys,
                z=zs,
                mode="lines",
                line=dict(color=color, width=4 if is_sel else 2),
                name=f"Site {s_id} ({'Active' if is_sel else 'Reserve'})",
                hoverinfo="text",
                text=f"Site {s_id} (Cost: ${site.normalized_cost:.1f}, Cap: {site.capacity})",
            )
        )

    # 2. Trajectories in 3D
    for t_id, traj in sorted(trajectories.items()):
        prot = result.target_protection.get(t_id, 0.0)
        color = "#10b981" if prot >= threshold else ("#f59e0b" if prot >= 0.40 else "#ef4444")
        fig.add_trace(
            go.Scatter3d(
                x=traj.xs,
                y=traj.ys,
                z=traj.altitudes,
                mode="lines+markers",
                marker=dict(size=3, color=color),
                line=dict(color=color, width=3),
                name=f"{t_id} (P={prot:.1%})",
                hoverinfo="text",
                text=[
                    f"Threat {t_id}<br>Easting: {traj.xs[k]:.1f} km, Northing: {traj.ys[k]:.1f} km<br>Alt: {traj.altitudes[k]:.1f} km"
                    for k in range(len(traj.times))
                ],
            )
        )

    fig.update_layout(
        scene=dict(
            xaxis=dict(title="Easting (km)", range=[0, 100], backgroundcolor="#090d16", gridcolor="#1e293b", title_font=dict(size=10, color="#94a3b8")),
            yaxis=dict(title="Northing (km)", range=[0, 100], backgroundcolor="#090d16", gridcolor="#1e293b", title_font=dict(size=10, color="#94a3b8")),
            zaxis=dict(title="Altitude AGL (km)", range=[0, 130], backgroundcolor="#090d16", gridcolor="#1e293b", title_font=dict(size=10, color="#94a3b8")),
            aspectratio=dict(x=1, y=1, z=0.55),
        ),
        paper_bgcolor="#0f172a",
        margin=dict(l=10, r=10, t=35, b=10),
        title=dict(
            text="<b>3D Spatio-Temporal Trajectory Arc & Ground Footprints</b>",
            font=dict(size=13, color="#f1f5f9", family="Inter, sans-serif"),
        ),
    )
    return fig


def create_protection_bar_chart(
    target_protection: Dict[str, float],
    threshold: float = 0.70,
    target_weights: Dict[str, float] = None,
) -> go.Figure:
    """Bar chart of simulated protection probability by target with threshold line."""
    targets = sorted(target_protection.keys())
    probs = [target_protection[t] for t in targets]
    colors = ["#10b981" if p >= threshold else ("#f59e0b" if p >= 0.40 else "#ef4444") for p in probs]

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=targets,
            y=probs,
            marker=dict(color=colors, line=dict(color="#1e293b", width=1)),
            text=[f"{p:.1%}" for p in probs],
            textposition="auto",
            textfont=dict(size=11, family="Inter, sans-serif"),
            name="Target Protection",
        )
    )

    fig.add_hline(
        y=threshold,
        line_dash="dash",
        line_color="#38bdf8",
        line_width=1.5,
        annotation_text=f"Protection Standard ({threshold:.0%})",
        annotation_position="top right",
        annotation_font=dict(color="#38bdf8", size=10, family="Inter, sans-serif"),
    )

    fig.update_layout(
        title=dict(
            text="<b>Simulated Protection Probability Across Threats</b>",
            font=dict(size=13, color="#f1f5f9", family="Inter, sans-serif"),
        ),
        xaxis=dict(
            title="Threat Identifier",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        yaxis=dict(
            title="Protection Probability P_i",
            range=[0, 1.08],
            tickformat=".0%",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        paper_bgcolor="#0f172a",
        plot_bgcolor="#090d16",
        margin=dict(l=50, r=30, t=50, b=40),
    )
    return fig


def create_capacity_utilization_chart(
    sites: Dict[str, CandidateSite],
    result: OptimizationResult,
) -> go.Figure:
    """Grouped horizontal bar chart showing capacity vs assigned defense units."""
    if not result.selected_sites:
        return go.Figure()

    selected = sorted(result.selected_sites)
    capacities = [sites[s].capacity for s in selected]
    used = [
        sum(allocs.get(s, 0) for allocs in result.assignments.values())
        for s in selected
    ]

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            y=selected,
            x=capacities,
            name="Authorized Capacity",
            orientation="h",
            marker=dict(color="#334155"),
            text=[f"{c} max" for c in capacities],
            textposition="auto",
            textfont=dict(size=10, family="Inter, sans-serif"),
        )
    )
    fig.add_trace(
        go.Bar(
            y=selected,
            x=used,
            name="Committed Units",
            orientation="h",
            marker=dict(color="#0ea5e9"),
            text=[f"{u} used" for u in used],
            textposition="auto",
            textfont=dict(size=10, family="Inter, sans-serif"),
        )
    )

    fig.update_layout(
        barmode="group",
        title=dict(
            text="<b>Site Resource Allocation & Capacity Utilization</b>",
            font=dict(size=13, color="#f1f5f9", family="Inter, sans-serif"),
        ),
        xaxis=dict(
            title="Defensive Units",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        yaxis=dict(
            title="Selected Site",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        paper_bgcolor="#0f172a",
        plot_bgcolor="#090d16",
        margin=dict(l=50, r=30, t=50, b=40),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.28,
            xanchor="center",
            x=0.5,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    return fig


def create_sensitivity_chart(sensitivity_df: pd.DataFrame) -> go.Figure:
    """Refined bar chart for parametric sensitivity analysis."""
    fig = px.bar(
        sensitivity_df,
        x="parameter_value",
        y="mean_protection",
        color="parameter_changed",
        barmode="group",
        title="<b>Parametric Sensitivity: Impact on Mean System Protection</b>",
        labels={"parameter_value": "Parameter Perturbation", "mean_protection": "Mean Protection P_mean"},
        color_discrete_sequence=["#0ea5e9", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#64748b"],
    )
    fig.update_layout(
        paper_bgcolor="#0f172a",
        plot_bgcolor="#090d16",
        xaxis=dict(
            title="Perturbation Step",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        yaxis=dict(
            title="Mean Protection",
            tickformat=".0%",
            title_font=dict(size=11, color="#94a3b8"),
            tickfont=dict(size=10, color="#cbd5e1"),
            gridcolor="#1e293b",
        ),
        margin=dict(l=50, r=30, t=50, b=40),
        font=dict(family="Inter, sans-serif"),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.35,
            xanchor="center",
            x=0.5,
            font=dict(size=10, color="#94a3b8"),
            title=None,
        ),
    )
    return fig
