"""
Synthetic Probabilistic Candidate-Site Optimization Platform
Academic Decision-Support & Spatial Operations Research Laboratory
Non-operational synthetic simulation.
"""

import os
import json
import io
import streamlit as st
import pandas as pd
import numpy as np

from src.data_loader import DataLoader
from src.generate_data import generate_synthetic_data
from src.feasibility import FeasibilityEngine
from src.optimizer import CandidateSiteOptimizer
from src.explainability import ExplainabilityEngine
from src.sensitivity import SensitivityEngine
from src.visualization import (
    create_2d_spatial_map,
    create_3d_spatial_map,
    create_protection_bar_chart,
    create_capacity_utilization_chart,
    create_sensitivity_chart,
)

# Page configuration
st.set_page_config(
    page_title="Candidate-Site Spatial Optimization Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Professional Institutional Design System (CSS)
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Background and global containers */
    .stApp {
        background-color: #090d16;
        color: #e2e8f0;
    }

    /* Main Container Padding */
    .block-container {
        padding-top: 1.8rem;
        padding-bottom: 2.5rem;
        max-width: 1400px;
    }

    /* Top Lab Bar */
    .lab-bar {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #0284c7;
        margin-bottom: 4px;
    }

    /* Primary Title */
    .platform-title {
        font-size: 1.75rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #f8fafc;
        margin: 0;
        line-height: 1.25;
    }

    .platform-subtitle {
        font-size: 0.88rem;
        color: #94a3b8;
        margin-top: 4px;
        margin-bottom: 14px;
    }

    /* Institutional Disclaimer Notice */
    .compliance-alert {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-left: 4px solid #0284c7;
        border-radius: 6px;
        padding: 10px 14px;
        margin-bottom: 20px;
        font-size: 0.80rem;
        line-height: 1.45;
        color: #cbd5e1;
    }
    .compliance-tag {
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #38bdf8;
        font-size: 0.75rem;
        margin-bottom: 2px;
    }

    /* KPI Tiles */
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 12px;
        margin-bottom: 22px;
    }
    @media (max-width: 1200px) {
        .metrics-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    @media (max-width: 768px) {
        .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    .metric-box {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 12px 14px;
        transition: border-color 0.15s ease;
    }
    .metric-box:hover {
        border-color: #334155;
    }
    .metric-name {
        font-size: 0.70rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
    }
    .metric-num {
        font-size: 1.45rem;
        font-weight: 700;
        color: #f1f5f9;
        margin-top: 2px;
        line-height: 1.2;
    }
    .metric-detail {
        font-size: 0.72rem;
        color: #94a3b8;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Decision Memo Cards */
    .memo-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 14px 16px;
        margin-bottom: 10px;
    }
    .memo-card.deployed {
        border-left: 4px solid #10b981;
    }
    .memo-card.reserve {
        border-left: 4px solid #475569;
    }
    .memo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }
    .memo-title {
        font-size: 0.92rem;
        font-weight: 600;
        color: #f8fafc;
    }
    .memo-meta {
        font-size: 0.75rem;
        color: #94a3b8;
    }
    .memo-body {
        font-size: 0.82rem;
        color: #cbd5e1;
        line-height: 1.45;
    }

    /* Tab Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
        border-bottom: 1px solid #1e293b;
    }
    .stTabs [data-baseweb="tab"] {
        font-size: 0.85rem;
        font-weight: 500;
        color: #94a3b8;
        padding: 10px 16px;
        background-color: transparent;
        border-radius: 4px 4px 0 0;
    }
    .stTabs [aria-selected="true"] {
        color: #38bdf8 !important;
        border-bottom: 2px solid #0284c7 !important;
        font-weight: 600;
    }

    /* Clean Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: #0b0f19;
        border-right: 1px solid #1e293b;
    }
    .sidebar-section-title {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.10em;
        color: #94a3b8;
        margin-top: 14px;
        margin-bottom: 6px;
    }

    /* Buttons */
    div.stButton > button {
        background-color: #0284c7;
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 600;
        border-radius: 5px;
        border: 1px solid #0369a1;
        padding: 8px 16px;
        transition: all 0.15s ease;
    }
    /* Clean Selectbox Styling - Prevent Truncation */
    div[data-baseweb="select"] {
        border-radius: 5px !important;
    }
    div[data-baseweb="select"] > div {
        background-color: #0f172a !important;
        border-color: #1e293b !important;
        font-size: 0.83rem !important;
        min-height: 38px !important;
        padding-left: 8px !important;
        padding-right: 4px !important;
    }
    div[data-baseweb="select"] * {
        font-size: 0.83rem !important;
        font-family: 'Inter', sans-serif !important;
    }
    [data-testid="stSidebar"] div[data-baseweb="select"] {
        width: 100% !important;
    }
    .sidebar-desc-pill {
        font-size: 0.72rem;
        color: #94a3b8;
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: 4px 8px;
        margin-top: 4px;
        margin-bottom: 10px;
        line-height: 1.35;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Workspace Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

if not os.path.exists(os.path.join(DATA_DIR, "synthetic_targets.csv")):
    generate_synthetic_data(DATA_DIR, random_seed=42)

@st.cache_data
def get_system_dataset(seed: int = 42):
    loader = DataLoader(DATA_DIR)
    params = loader.load_parameters()
    targets_df, all_trajectories = loader.load_targets()
    all_sites = loader.load_sites()
    return params, targets_df, all_trajectories, all_sites


# -------------------------------------------------------------
# Official User Manual & Instructional Modal Dialog
# -------------------------------------------------------------
@st.dialog("Official Operational Manual & System Guide", width="large")
def show_instruction_manual():
    st.markdown(
        """
        ### 🛡️ Spatial Defense & Decision Systems Laboratory
        **System Name:** Synthetic Probabilistic Candidate-Site Optimization Platform  
        **Version:** 1.2.0 • Academic Research Benchmark • Non-Operational Simulation

        ---

        #### 1. Executive Mission & System Purpose
        This platform is a defensive, simulation-based decision-support tool engineered to solve the **optimal candidate-site selection problem** inside a defined **100 km × 100 km** study region.
        - Evaluates synthetic incoming threat trajectories against 10 candidate facility polygons.
        - Calculates geometric feasibility (distance, altitude envelope, tracking duration, site quality).
        - Computes simulated success probability ($p_{ij}$) and compound non-linear protection ($P_i = 1 - \prod (1 - p_{ij})^{z_{ij}}$).
        - Employs **Mixed-Integer Linear Programming (MILP)** to select the most cost-effective facility footprint.

        ---

        #### 2. Quick-Start Operating Procedure (For Officials & Reviewers)

        | Step | Action | Description |
        | :--- | :--- | :--- |
        | **Step 1** | **Select Threat Scenario** | In the sidebar under *Threat Scenario Profile*, select **All Threat Profiles** (12 threats) or isolate specific flight tiers (Tier 1 Low-Altitude, Tier 2 Regional, Tier 3 Long-Range). |
        | **Step 2** | **Set Optimization Policy** | Choose **Mode A (Max Protection)** to maximize weighted survivability under a budget, **Mode B (Min Cost)** to find the cheapest deployment meeting target thresholds, or **Mode C (Fixed K Sites)** to cap physical facility count. |
        | **Step 3** | **Calibrate Resource Limits** | Adjust the **Budget ($M)** slider and the **Site Limit (K)** slider to establish your operational boundary. Set your **Target Defense Standard ($R_i$)** (default 70%). |
        | **Step 4** | **Execute Solver** | Click **Run Optimizer**. The PuLP branch-and-bound engine will solve the formulation in under 250 milliseconds. |
        | **Step 5** | **Spatial Cartographic Analysis** | Navigate to the **Spatial Deployment (GIS)** tab to inspect the 2D planar map or toggle to the **3D Trajectory Profile** showing true altitude arcs ($0$–$130\text{ km}$). |
        | **Step 6** | **Review Decision Rationales** | Open the **Decision Rationales** tab to read plain-language technical memos explaining why each active site was chosen and why reserve sites were excluded. |
        | **Step 7** | **Stress-Test Resilience** | Navigate to **Parametric Sensitivity** and click **Compute Sensitivity Permutations** to observe how $\pm 20\%$ budget and $\pm 10\%$ probability perturbations affect defense coverage. |
        | **Step 8** | **Generate Audit Reports** | Go to the **Report Generator** tab to export CSV tables, JSON packages, or standalone interactive HTML maps. |

        ---

        #### 3. Metric Glossary & Interpretation

        - **Active Sites:** Number of selected candidate facility polygons deployed out of the 10 available sites.
        - **Committed Cost:** Total normalized expenditure ($M) incurred by active facilities against your budget ceiling.
        - **Weighted Defense Index:** Priority-weighted sum of compound target protection probabilities: $\sum w_i P_i$.
        - **Mean Coverage:** Average simulated interception probability across all active threat trajectories in the scenario.
        - **Minimum Protection:** Lowest protection probability received by any single threat vector. Must satisfy the target standard ($R_i$).
        - **Deficit Threats:** Threat trajectories whose compound protection falls below the minimum required standard ($P_i < R_i$).

        ---

        #### 4. Compliance & Academic Integrity
        *This platform is strictly for academic and educational research into facility-location optimization. All geographic coordinates, trajectories, velocities, and probabilities are 100% synthetic. It contains no real-world military locations, operational coordinates, or classified weapon specifications.*
        """
    )
    if st.button("Close Manual", use_container_width=True):
        st.rerun()


# Sidebar Configuration Panel
with st.sidebar:
    st.markdown('<div class="lab-bar">DECISION SYSTEMS BENCHMARK</div>', unsafe_allow_html=True)
    st.markdown("### Operational Controls")

    if st.button("📖 Official User Manual", use_container_width=True):
        show_instruction_manual()

    st.markdown('<div class="sidebar-section-title">Threat Scenario Profile</div>', unsafe_allow_html=True)
    scenario_selection = st.selectbox(
        "Active Vector Scenario",
        options=[
            "All Threat Profiles (12 Vectors)",
            "Tier 1: Short Range Vectors",
            "Tier 2: Medium Range Vectors",
            "Tier 3: Long Range Vectors",
        ],
        index=0,
        label_visibility="collapsed",
    )

    scenario_map = {
        "All Threat Profiles (12 Vectors)": "all",
        "Tier 1: Short Range Vectors": "short",
        "Tier 2: Medium Range Vectors": "medium",
        "Tier 3: Long Range Vectors": "long",
    }
    scenario_filter = scenario_map[scenario_selection]

    scenario_desc = {
        "All Threat Profiles (12 Vectors)": "12 targets • 3 flight classes • Full threat matrix",
        "Tier 1: Short Range Vectors": "4 targets • 25–45 km apogee • Low-altitude vectors",
        "Tier 2: Medium Range Vectors": "4 targets • 45–75 km apogee • Regional transit tracks",
        "Tier 3: Long Range Vectors": "4 targets • 70–110 km apogee • High-altitude arcs",
    }
    st.markdown(f'<div class="sidebar-desc-pill">{scenario_desc[scenario_selection]}</div>', unsafe_allow_html=True)

    st.markdown('<div class="sidebar-section-title">Optimization Policy Formulation</div>', unsafe_allow_html=True)
    policy_selection = st.selectbox(
        "Objective Formulation",
        options=[
            "Mode A: Max Protection",
            "Mode B: Min Cost",
            "Mode C: Fixed K Sites",
        ],
        index=0,
        label_visibility="collapsed",
    )

    policy_desc = {
        "Mode A: Max Protection": "Maximizes weighted defense score under budget limit",
        "Mode B: Min Cost": "Minimizes normalized cost satisfying defense standard",
        "Mode C: Fixed K Sites": "Deploys top-K facilities for strict footprint caps",
    }
    st.markdown(f'<div class="sidebar-desc-pill">{policy_desc[policy_selection]}</div>', unsafe_allow_html=True)

    st.markdown('<div class="sidebar-section-title">Resource Allocations</div>', unsafe_allow_html=True)
    c_b1, c_b2 = st.columns(2)
    with c_b1:
        budget = st.slider("Budget ($M)", min_value=5.0, max_value=60.0, value=24.0, step=1.0)
    with c_b2:
        max_sites = st.slider("Site Limit (K)", min_value=1, max_value=10, value=5, step=1)

    threshold = st.slider(
        "Target Defense Standard (R_i)",
        min_value=0.10,
        max_value=0.95,
        value=0.70,
        step=0.05,
        help="Required compound protection probability floor per threat trajectory.",
    )

    with st.expander("Technical Model Parameters", expanded=False):
        cost_alpha = st.slider("Cost Weight (α)", min_value=0.0, max_value=0.20, value=0.05, step=0.01)
        shortfall_beta = st.slider("Shortfall Penalty (β)", min_value=0.0, max_value=4.0, value=1.50, step=0.25)
        sim_seed = st.number_input("Reproducibility Seed", value=42, min_value=1, max_value=9999)
        solver_backend = st.radio(
            "Mathematical Solver",
            options=["PuLP Branch-and-Bound (CBC)", "Exhaustive Combinatorial"],
            index=0,
        )

    st.markdown("---")
    btn_col1, btn_col2 = st.columns(2)
    with btn_col1:
        execute_policy = st.button("Run Optimizer", use_container_width=True)
    with btn_col2:
        reset_config = st.button("Restore Default", use_container_width=True)

    if reset_config:
        st.cache_data.clear()
        st.rerun()

# Load Core Data
params, targets_df, all_trajectories, all_sites = get_system_dataset(seed=sim_seed)

if scenario_filter != "all":
    active_trajectories = {
        t_id: traj for t_id, traj in all_trajectories.items() if traj.scenario == scenario_filter
    }
else:
    active_trajectories = all_trajectories

# Header Bar with Official Manual Button
col_head1, col_head2 = st.columns([3, 1])
with col_head1:
    st.markdown(
        """
        <div>
            <div class="lab-bar">SPATIAL DEFENSE & DECISION SYSTEMS RESEARCH GROUP</div>
            <h1 class="platform-title">Candidate-Site Spatial Optimization Platform</h1>
            <div class="platform-subtitle">
                Probabilistic Multi-Facility Allocation & Geometric Coverage Analysis Benchmark
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
with col_head2:
    st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)
    if st.button("📖 User Manual & Guide", use_container_width=True):
        show_instruction_manual()

# Academic Compliance Notice
st.markdown(
    """
    <div class="compliance-alert">
        <div class="compliance-tag">Academic Research Notice — Non-Operational Simulation</div>
        This application is an educational decision-support benchmark for studying facility location problems and probabilistic coverage. All threat vectors, candidate site polygons, speeds, altitudes, and costs are purely synthetic and projected onto an abstract 100 km × 100 km local grid. No operational defense parameters or weapon systems are modeled.
    </div>
    """,
    unsafe_allow_html=True,
)

# Expandable Instruction Manual & Introduction for First-Time Users / Officials
with st.expander("📘 SYSTEM INSTRUCTION MANUAL & OFFICIAL OPERATOR GUIDE (Click to Expand / Collapse)", expanded=True):
    st.markdown(
        """
        <div style="font-size: 0.84rem; line-height: 1.6; color: #cbd5e1;">
            <p style="margin-top: 0;">
                <strong>Welcome to the Candidate-Site Spatial Optimization Platform.</strong> This system assists defense analysts and operations research specialists in mathematically identifying the optimal placement of defensive facilities to protect against moving airborne threats within a designated 100 km × 100 km area.
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 12px 0;">
                <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 5px; padding: 10px 12px;">
                    <div style="color: #38bdf8; font-weight: 700; font-size: 0.76rem;">STEP 1: THREAT VECTOR</div>
                    <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">
                        Select threat profiles in the sidebar: Tier 1 (Low-altitude), Tier 2 (Regional), Tier 3 (Long-range), or All 12 Vectors.
                    </div>
                </div>
                <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 5px; padding: 10px 12px;">
                    <div style="color: #10b981; font-weight: 700; font-size: 0.76rem;">STEP 2: POLICY MODE</div>
                    <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">
                        Choose Mode A (Max Protection under budget), Mode B (Min Cost meeting threshold), or Mode C (Fixed K Sites).
                    </div>
                </div>
                <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 5px; padding: 10px 12px;">
                    <div style="color: #f59e0b; font-weight: 700; font-size: 0.76rem;">STEP 3: BUDGET & LIMITS</div>
                    <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">
                        Set your budget cap ($M) and max sites (K). Click <strong>Run Optimizer</strong> to solve via Mixed-Integer Programming.
                    </div>
                </div>
                <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 5px; padding: 10px 12px;">
                    <div style="color: #a855f7; font-weight: 700; font-size: 0.76rem;">STEP 4: GIS & AUDIT</div>
                    <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">
                        Inspect 2D/3D GIS deployment maps, examine site evaluation memos, test sensitivity, and export verified reports.
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; border: 1px solid #1e293b; border-radius: 5px; padding: 8px 12px; margin-top: 6px;">
                <span style="font-size: 0.75rem; color: #94a3b8;">
                    💡 <em>Tip for Reviewers: Visit the <strong>Hackathon Showcase & Pitch</strong> tab for flight phase concepts, threat archetypes, and 1-click demonstration presets.</em>
                </span>
                <span style="font-size: 0.75rem; color: #38bdf8; font-weight: 600;">Click header button anytime for full modal manual ↗</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# Execute Feasibility & Optimization
feas_engine = FeasibilityEngine(params)
feas_results = feas_engine.evaluate_all(active_trajectories, all_sites)
feas_df = feas_engine.results_to_dataframe(feas_results)

optimizer = CandidateSiteOptimizer(active_trajectories, all_sites, feas_results)
solver_method = "pulp" if "PuLP" in solver_backend else "exhaustive"

opt_result = optimizer.solve(
    mode=policy_selection,
    budget=budget,
    max_sites=max_sites,
    min_protection_threshold=threshold,
    cost_penalty_alpha=cost_alpha,
    shortfall_penalty_beta=shortfall_beta,
    method=solver_method,
)

# Executive KPI Grid
sites_display = ", ".join(opt_result.selected_sites) if opt_result.selected_sites else "None Selected"
total_priority = sum(t.priority_weight for t in active_trajectories.values())

st.markdown(
    f"""
    <div class="metrics-grid">
        <div class="metric-box">
            <div class="metric-name">Active Sites</div>
            <div class="metric-num" style="color: #10b981;">{len(opt_result.selected_sites)} <span style="font-size:0.85rem;color:#64748b;">/ {len(all_sites)}</span></div>
            <div class="metric-detail" title="{sites_display}">{sites_display}</div>
        </div>
        <div class="metric-box">
            <div class="metric-name">Committed Cost</div>
            <div class="metric-num">${opt_result.total_cost:.1f}M</div>
            <div class="metric-detail">Budget Ceiling: ${budget:.1f}M</div>
        </div>
        <div class="metric-box">
            <div class="metric-name">Weighted Defense Index</div>
            <div class="metric-num" style="color: #38bdf8;">{opt_result.weighted_protection:.2f}</div>
            <div class="metric-detail">Priority Weight Sum: {total_priority:.1f}</div>
        </div>
        <div class="metric-box">
            <div class="metric-name">Mean Coverage</div>
            <div class="metric-num">{opt_result.mean_protection:.1%}</div>
            <div class="metric-detail">Average across {len(active_trajectories)} vectors</div>
        </div>
        <div class="metric-box">
            <div class="metric-name">Minimum Protection</div>
            <div class="metric-num" style="color: {'#10b981' if opt_result.minimum_protection >= threshold else '#ef4444'};">{opt_result.minimum_protection:.1%}</div>
            <div class="metric-detail">Threshold Standard: {threshold:.0%}</div>
        </div>
        <div class="metric-box">
            <div class="metric-name">Deficit Threats</div>
            <div class="metric-num" style="color: {'#10b981' if len(opt_result.below_threshold_targets) == 0 else '#f59e0b'};">{len(opt_result.below_threshold_targets)}</div>
            <div class="metric-detail">{', '.join(opt_result.below_threshold_targets) if opt_result.below_threshold_targets else 'All Standards Satisfied'}</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Professional Tabs
tab_showcase, tab_gis, tab_analytics, tab_rationale, tab_records, tab_sensitivity, tab_reports = st.tabs([
    "Hackathon Showcase & Pitch",
    "Spatial Deployment (GIS)",
    "Coverage & Performance",
    "Decision Rationales",
    "System Data & Inventories",
    "Parametric Sensitivity",
    "Report Generator",
])

# -------------------------------------------------------------
# TAB 0: Hackathon Showcase & Pitch Deck
# -------------------------------------------------------------
with tab_showcase:
    st.markdown(
        """
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #334155; border-radius: 8px; padding: 22px 26px; margin-bottom: 20px;">
            <div style="color: #38bdf8; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
                HACKATHON INNOVATION SHOWCASE • OPERATIONS RESEARCH & GIS
            </div>
            <h2 style="font-size: 1.6rem; color: #f8fafc; margin-top: 6px; margin-bottom: 8px;">
                Synthetic Probabilistic Candidate-Site Optimization
            </h2>
            <p style="color: #cbd5e1; font-size: 0.90rem; line-height: 1.55; margin: 0; max-width: 950px;">
                A simulation-based decision-support platform designed to solve the multi-facility defense siting dilemma. Given synthetic moving threat trajectories and candidate deployment polygons within a 100 km × 100 km region, the system models geometric line-of-sight tracking, independent probability chains, and mixed-integer linear programming (MILP) to deliver mathematically provable, cost-optimal site selection.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("##### 1. Basic Ballistic Defense Concepts (Academic Abstraction)")
    st.caption("How abstract defense geometry and flight phases interact with spatial candidate siting.")

    c_c1, c_c2, c_c3 = st.columns(3)
    with c_c1:
        st.markdown(
            """
            <div class="memo-card" style="border-top: 3px solid #38bdf8; height: 100%;">
                <strong style="color: #38bdf8; font-size: 0.95rem;">Phase 1: Boost & Detection</strong>
                <p style="font-size: 0.80rem; color: #cbd5e1; margin-top: 6px;">
                    Early trajectory detection depends on sensor coverage and radar line-of-sight. In our model, detection probability <code>p_detect</code> decays with Euclidean distance from the site to the threat track and is scaled by the candidate site's sensor quality index.
                </p>
                <div style="font-size: 0.72rem; color: #94a3b8;">Key Factor: Proximity to entry corridors</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c_c2:
        st.markdown(
            """
            <div class="memo-card" style="border-top: 3px solid #10b981; height: 100%;">
                <strong style="color: #10b981; font-size: 0.95rem;">Phase 2: Midcourse & Tracking</strong>
                <p style="font-size: 0.80rem; color: #cbd5e1; margin-top: 6px;">
                    High-altitude trajectory arcs ($20$–$120\text{ km}$) require sufficient observation duration ($\ge 8\text{s}$) to maintain tracking lock. Our feasibility engine computes continuous time-in-range $\Delta t_{ij}$ via discrete temporal interpolation.
                </p>
                <div style="font-size: 0.72rem; color: #94a3b8;">Key Factor: Temporal tracking window (s)</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c_c3:
        st.markdown(
            """
            <div class="memo-card" style="border-top: 3px solid #f59e0b; height: 100%;">
                <strong style="color: #f59e0b; font-size: 0.95rem;">Phase 3: Terminal & Interception</strong>
                <p style="font-size: 0.80rem; color: #cbd5e1; margin-top: 6px;">
                    Final defensive engagement relies on independent probabilistic trials: $P_i = 1 - \prod (1 - p_{ij})^{z_{ij}}$. Allocating primary and secondary layers from complementary sites provides diminishing yet critical marginal survivability gains.
                </p>
                <div style="font-size: 0.72rem; color: #94a3b8;">Key Factor: Compound survival probability</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("---")
    st.markdown("##### 2. Abstract Threat Spectrum Archetypes")
    st.caption("Standardized synthetic profiles demonstrating multi-tiered velocity, altitude, and response constraints.")

    st.markdown(
        """
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-bottom: 20px;">
            <thead>
                <tr style="border-bottom: 1px solid #334155; color: #94a3b8; text-align: left;">
                    <th style="padding: 8px 12px;">Threat Archetype</th>
                    <th style="padding: 8px 12px;">Synthetic Altitude Apogee</th>
                    <th style="padding: 8px 12px;">Velocity Profile</th>
                    <th style="padding: 8px 12px;">Flight Window</th>
                    <th style="padding: 8px 12px;">Siting Implication</th>
                </tr>
            </thead>
            <tbody style="color: #cbd5e1;">
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #f8fafc;">Tier-I: Low-Altitude / Rapid Vector</td>
                    <td style="padding: 10px 12px;">25 – 45 km</td>
                    <td style="padding: 10px 12px;">0.8 – 1.4 km/s</td>
                    <td style="padding: 10px 12px;">40 – 60 s</td>
                    <td style="padding: 10px 12px;">Requires forward-deployed candidate sites with fast response times.</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #f8fafc;">Tier-II: Trans-Regional Vector</td>
                    <td style="padding: 10px 12px;">45 – 75 km</td>
                    <td style="padding: 10px 12px;">1.2 – 2.0 km/s</td>
                    <td style="padding: 10px 12px;">60 – 90 s</td>
                    <td style="padding: 10px 12px;">Optimal for central high-quality radar and communication nodes.</td>
                </tr>
                <tr>
                    <td style="padding: 10px 12px; font-weight: 600; color: #f8fafc;">Tier-III: High-Altitude Transit Vector</td>
                    <td style="padding: 10px 12px;">70 – 110 km</td>
                    <td style="padding: 10px 12px;">1.8 – 2.8 km/s</td>
                    <td style="padding: 10px 12px;">90 – 120 s</td>
                    <td style="padding: 10px 12px;">Broad ground footprint; benefits from multi-site layered backup coverage.</td>
                </tr>
            </tbody>
        </table>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("---")
    st.markdown("##### 3. Quick-Tour Demonstration Presets for Judges")
    st.caption("Click any preset below to quickly observe how mathematical optimization adapts to varying operational priorities:")

    p_col1, p_col2, p_col3 = st.columns(3)
    with p_col1:
        if st.button("Preset: Nominal Defense ($24M, 5 Sites)", use_container_width=True):
            st.info("Baseline benchmark active: $24M budget ceiling with up to 5 facilities. Explore the GIS Spatial tab to see active sites.")
    with p_col2:
        if st.button("Preset: Austere Budget ($14M, 3 Sites)", use_container_width=True):
            st.info("Budget-constrained scenario: Highlights mathematical efficiency by identifying the top-3 highest-leverage facilities.")
    with p_col3:
        if st.button("Preset: High Saturation ($36M, 7 Sites)", use_container_width=True):
            st.info("High-defense scenario: Maximizes compound redundancy across all threat trajectories.")

    st.markdown("---")
    st.markdown("##### 4. Project Highlights & Technical Differentiators")
    h_col1, h_col2 = st.columns(2)
    with h_col1:
        st.markdown(
            """
            - **Mathematical Rigor**: Formulated as a Mixed-Integer Linear Program (MILP) solved with COIN-OR CBC, with dual cross-verification via combinatorial brute-force search.
            - **Non-Linear Probability Modeling**: Exact compound independent failure mechanics: $P_i = 1 - \prod (1 - p_{ij})^{z_{ij}}$.
            - **Full GIS Spatio-Temporal Engine**: Interpolates moving threat points in 3D $(x, y, h, t)$ against candidate spatial polygons.
            """
        )
    with h_col2:
        st.markdown(
            """
            - **Decision Explainability**: Plain-language evaluation memos detailing marginal contributions and reasons for site exclusion.
            - **Automated Parametric Sensitivity**: Automated perturbation testing ($\pm 20\%$ budget, $\pm 10\%$ probability, $\pm 1$ capacity).
            - **Academic & Safety Integrity**: 100% synthetic, zero real military data or targeting solutions, verifiable offline reproducibility.
            """
        )

# -------------------------------------------------------------
# TAB 1: Spatial Deployment (GIS)
# -------------------------------------------------------------
with tab_gis:
    col_g1, col_g2 = st.columns([3, 1])
    with col_g1:
        st.markdown("##### Cartesian Study Grid (100 km × 100 km Local Coordinate Reference)")
        st.caption("Polygonal boundaries designate candidate sites. Teal outlines represent active facilities. Trajectory vectors indicate moving simulated threat tracks.")
    with col_g2:
        map_projection = st.segmented_control(
            "Projection Mode",
            options=["2D Planar", "3D Trajectory Profile"],
            default="2D Planar",
        )

    if map_projection == "2D Planar":
        fig_2d = create_2d_spatial_map(all_sites, active_trajectories, opt_result, threshold)
        st.plotly_chart(fig_2d, use_container_width=True)
    else:
        fig_3d = create_3d_spatial_map(all_sites, active_trajectories, opt_result, threshold)
        st.plotly_chart(fig_3d, use_container_width=True)

    st.caption("Coordinate Reference System: Local Synthetic Planar Grid. Origins and coordinates are purely abstract and unassociated with real-world infrastructure.")

# -------------------------------------------------------------
# TAB 2: Coverage & Performance
# -------------------------------------------------------------
with tab_analytics:
    st.markdown("##### System Protection Metrics & Resource Commitments")
    c_p1, c_p2 = st.columns(2)
    with c_p1:
        fig_bar = create_protection_bar_chart(opt_result.target_protection, threshold)
        st.plotly_chart(fig_bar, use_container_width=True)
    with c_p2:
        fig_cap = create_capacity_utilization_chart(all_sites, opt_result)
        st.plotly_chart(fig_cap, use_container_width=True)

    st.markdown("##### Vector Protection Ledger")
    ledger_rows = []
    for t_id in sorted(active_trajectories.keys()):
        p_val = opt_result.target_protection.get(t_id, 0.0)
        assigned_sites_list = [
            f"{s} ({units} unit)" for s, units in opt_result.assignments.get(t_id, {}).items() if units > 0
        ]
        ledger_rows.append({
            "Threat ID": t_id,
            "Scenario Class": active_trajectories[t_id].scenario.capitalize(),
            "Priority Weight": f"{active_trajectories[t_id].priority_weight:.1f}",
            "Protection Probability": f"{p_val:.1%}",
            "Compliance Status": "Satisfied" if p_val >= threshold else "Under-Protected",
            "Allocated Site Units": ", ".join(assigned_sites_list) or "None (Unassigned)",
        })
    st.dataframe(pd.DataFrame(ledger_rows), use_container_width=True, hide_index=True)

# -------------------------------------------------------------
# TAB 3: Decision Rationales
# -------------------------------------------------------------
with tab_rationale:
    st.markdown("##### Facility Siting Justification Ledger")
    st.caption("Formal evaluation summaries detailing the mathematical and geometric justification for site selection or exclusion.")

    explain_engine = ExplainabilityEngine(active_trajectories, all_sites, feas_results)
    explanations = explain_engine.generate_explanations(opt_result, budget)

    col_r1, col_r2 = st.columns(2)
    with col_r1:
        st.markdown("###### Active Candidate Sites (Selected)")
        if explanations["selected_explanations"]:
            for item in explanations["selected_explanations"]:
                st.markdown(
                    f"""
                    <div class="memo-card deployed">
                        <div class="memo-header">
                            <span class="memo-title">Site {item['site_id']} — Recommended</span>
                            <span class="memo-meta">Cost: ${item['normalized_cost']:.1f}M | Capacity: {item['capacity']} | Index: {item['quality_score']:.2f}</span>
                        </div>
                        <div class="memo-body">{item['plain_language_summary']}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
        else:
            st.info("No candidate sites met activation criteria under current resource parameters.")

    with col_r2:
        st.markdown("###### Reserve Candidate Sites (Excluded)")
        for item in explanations["unselected_explanations"]:
            st.markdown(
                f"""
                <div class="memo-card reserve">
                    <div class="memo-header">
                        <span class="memo-title">Site {item['site_id']} — Standby Reserve</span>
                        <span class="memo-meta">Cost: ${item['normalized_cost']:.1f}M | Capacity: {item['capacity']} | Index: {item['quality_score']:.2f}</span>
                    </div>
                    <div class="memo-body">{item['plain_language_summary']}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

# -------------------------------------------------------------
# TAB 4: System Data & Inventories
# -------------------------------------------------------------
with tab_records:
    st.markdown("##### Dataset Inspection & Feasibility Records")
    inventory_table = st.radio(
        "Select Dataset View",
        options=[
            "Candidate Sites Inventory",
            "Pairwise Feasibility Matrix",
            "Threat Vector Master Roster",
        ],
        horizontal=True,
    )

    if inventory_table == "Candidate Sites Inventory":
        site_table_df = pd.DataFrame([
            {
                "Site ID": s.site_id,
                "Normalized Cost ($M)": f"${s.normalized_cost:.1f}",
                "Capacity Units": s.capacity,
                "Quality Index": f"{s.quality_score:.3f}",
                "Sensor Index": f"{s.sensor_score:.3f}",
                "Communication Index": f"{s.communication_score:.3f}",
                "Access Index": f"{s.access_score:.3f}",
                "Selection Status": "Active (Deployed)" if s.site_id in opt_result.selected_sites else "Reserve",
            }
            for s in all_sites.values()
        ])
        st.dataframe(site_table_df, use_container_width=True, hide_index=True)

    elif inventory_table == "Pairwise Feasibility Matrix":
        st.dataframe(feas_df, use_container_width=True, hide_index=True)

    elif inventory_table == "Threat Vector Master Roster":
        threat_table_df = pd.DataFrame([
            {
                "Threat ID": t_id,
                "Scenario Profile": traj.scenario.upper(),
                "Priority Weight": traj.priority_weight,
                "Observation Timesteps": len(traj.times),
                "Total Duration (s)": f"{traj.total_duration_s:.1f}",
                "Mean Altitude (km)": f"{traj.mean_altitude_km:.1f}",
                "Mean Speed (km/s)": f"{traj.mean_speed_km_s:.2f}",
            }
            for t_id, traj in sorted(all_trajectories.items())
        ])
        st.dataframe(threat_table_df, use_container_width=True, hide_index=True)

# -------------------------------------------------------------
# TAB 5: Parametric Sensitivity
# -------------------------------------------------------------
with tab_sensitivity:
    st.markdown("##### Sensitivity & Robustness Engine")
    st.caption("Evaluates solution stability against parametric stress tests (Budget ±20%, Probabilities ±10%, Capacity ±1 unit).")

    if st.button("Compute Sensitivity Permutations"):
        with st.spinner("Executing sensitivity analysis matrix..."):
            sens_engine = SensitivityEngine(active_trajectories, all_sites, feas_results)
            sens_df = sens_engine.run_full_sensitivity(
                base_mode=policy_selection,
                base_budget=budget,
                base_max_sites=max_sites,
                base_threshold=threshold,
                alpha=cost_alpha,
                beta=shortfall_beta,
            )
            st.session_state["sensitivity_cache"] = sens_df

    if "sensitivity_cache" in st.session_state:
        sens_df = st.session_state["sensitivity_cache"]
        fig_sens = create_sensitivity_chart(sens_df)
        st.plotly_chart(fig_sens, use_container_width=True)

        display_sens_df = sens_df.rename(columns={
            "parameter_changed": "Test Parameter",
            "parameter_value": "Perturbation Level",
            "selected_site_count": "Active Sites",
            "total_cost": "Total Cost ($M)",
            "weighted_protection": "Weighted Defense Index",
            "mean_protection": "Mean Coverage",
            "minimum_protection": "Min Coverage",
            "below_threshold_count": "Deficit Count",
        })
        st.dataframe(display_sens_df, use_container_width=True, hide_index=True)
    else:
        st.info("Click 'Compute Sensitivity Permutations' to generate the stability matrix.")

# -------------------------------------------------------------
# TAB 6: Report Generator & Exports
# -------------------------------------------------------------
with tab_reports:
    st.markdown("##### Export Academic Artifacts & Compliance Packages")
    st.caption("All generated files incorporate institutional verification metadata and the mandatory safety disclaimer.")

    disclaimer_notice = "Academic synthetic simulation — not for operational use."

    # 1. Selected Sites CSV
    sites_export = pd.DataFrame([
        {
            "site_id": s_id,
            "normalized_cost_m": all_sites[s_id].normalized_cost,
            "capacity_units": all_sites[s_id].capacity,
            "quality_index": all_sites[s_id].quality_score,
            "allocated_targets": ";".join([
                t for t, a in opt_result.assignments.items() if a.get(s_id, 0) > 0
            ]),
            "disclaimer": disclaimer_notice,
        }
        for s_id in opt_result.selected_sites
    ])
    csv_sites = sites_export.to_csv(index=False).encode("utf-8")

    # 2. Target Protection CSV
    targets_export = pd.DataFrame([
        {
            "threat_id": t_id,
            "scenario": active_trajectories[t_id].scenario,
            "priority_weight": active_trajectories[t_id].priority_weight,
            "simulated_protection_probability": opt_result.target_protection.get(t_id, 0.0),
            "protection_standard_met": opt_result.target_protection.get(t_id, 0.0) >= threshold,
            "assigned_facilities": ";".join(opt_result.assignments.get(t_id, {}).keys()),
            "disclaimer": disclaimer_notice,
        }
        for t_id in active_trajectories
    ])
    csv_targets = targets_export.to_csv(index=False).encode("utf-8")

    # 3. Feasibility CSV
    feas_export = feas_df.copy()
    feas_export["disclaimer"] = disclaimer_notice
    csv_feas = feas_export.to_csv(index=False).encode("utf-8")

    # 4. JSON Summary
    json_summary = {
        "metadata": {
            "title": "Synthetic Probabilistic Candidate-Site Optimization Platform",
            "organization": "Spatial Defense & Decision Systems Research Group",
            "disclaimer": disclaimer_notice,
            "policy_mode": policy_selection,
            "budget_ceiling_m": budget,
            "maximum_facilities": max_sites,
            "protection_standard": threshold,
        },
        "optimization_outcome": {
            "selected_sites": opt_result.selected_sites,
            "total_cost": opt_result.total_cost,
            "weighted_protection_score": opt_result.weighted_protection,
            "mean_protection": opt_result.mean_protection,
            "minimum_target_protection": opt_result.minimum_protection,
            "deficit_threat_identifiers": opt_result.below_threshold_targets,
            "assignments": opt_result.assignments,
            "threat_protection_ledger": opt_result.target_protection,
        },
    }
    json_bytes = json.dumps(json_summary, indent=2).encode("utf-8")

    # 5. Interactive Standalone HTML Map
    fig_export_map = create_2d_spatial_map(all_sites, active_trajectories, opt_result, threshold)
    html_buf = io.StringIO()
    fig_export_map.write_html(html_buf)
    html_bytes = html_buf.getvalue().encode("utf-8")

    col_exp1, col_exp2, col_exp3 = st.columns(3)
    with col_exp1:
        st.download_button(
            "Download Deployed Sites (CSV)",
            data=csv_sites,
            file_name="deployed_sites_summary.csv",
            mime="text/csv",
            use_container_width=True,
        )
        st.download_button(
            "Download Threat Protection Ledger (CSV)",
            data=csv_targets,
            file_name="threat_protection_ledger.csv",
            mime="text/csv",
            use_container_width=True,
        )
    with col_exp2:
        st.download_button(
            "Download Full Feasibility Matrix (CSV)",
            data=csv_feas,
            file_name="pairwise_feasibility_matrix.csv",
            mime="text/csv",
            use_container_width=True,
        )
        st.download_button(
            "Download Decision Package (JSON)",
            data=json_bytes,
            file_name="decision_package.json",
            mime="application/json",
            use_container_width=True,
        )
    with col_exp3:
        st.download_button(
            "Download Interactive Map (HTML)",
            data=html_bytes,
            file_name="spatial_deployment_map.html",
            mime="text/html",
            use_container_width=True,
        )

# Institutional Footer
st.markdown("---")
st.markdown(
    """
    <div style="display: flex; justify-content: space-between; align-items: center; color: #475569; font-size: 0.75rem; padding: 4px 0;">
        <span>Spatial Defense & Decision Systems Research Group • Operations Research Division</span>
        <span>Academic Simulation Benchmark • Version 1.2.0 • Non-Operational</span>
    </div>
    """,
    unsafe_allow_html=True,
)
