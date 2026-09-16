import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Target, Cpu, FileText,
  Play, RotateCcw,
  CheckCircle,
} from "lucide-react";
import {
  simulateTrajectory, runMilpSolver,
  PRESET_MISSILES, CANDIDATE_SITES,
  type TrajectoryPoint, type MilpSite, type MilpResult,
} from "./simulator";

// ─── COLOUR TOKENS ────────────────────────────────────────────────
const C = {
  bg:       "#060a12",
  panel:    "rgba(10,18,32,0.85)",
  border:   "rgba(0,200,255,0.12)",
  cyan:     "#00c8ff",
  gold:     "#f5c842",
  red:      "#ff4466",
  green:    "#00e87a",
  orange:   "#ff8c00",
  muted:    "rgba(180,210,255,0.45)",
  text:     "#d6eaf8",
};

const PHASE_COLOR: Record<string, string> = {
  boost:      C.gold,
  midcourse:  C.cyan,
  reentry:    C.red,
};

// ─── TRAJECTORY CANVAS ────────────────────────────────────────────
function TrajectoryCanvas({ points, width = 700, height = 320 }: {
  points: TrajectoryPoint[]; width?: number; height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const frameRef  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = width;
    canvas.height = height;

    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));
    const pad  = 40;

    const toCanvas = (x: number, y: number) => ({
      cx: pad + (x / maxX) * (width - pad * 2),
      cy: height - pad - (y / maxY) * (height - pad * 2),
    });

    frameRef.current = 0;
    cancelAnimationFrame(animRef.current);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = "rgba(0,200,255,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = pad + (i / 10) * (width - pad * 2);
        const y = pad + (i / 10) * (height - pad * 2);
        ctx.beginPath(); ctx.moveTo(x, pad);    ctx.lineTo(x, height - pad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad, y);    ctx.lineTo(width - pad, y);  ctx.stroke();
      }

      // Ground line
      ctx.strokeStyle = C.green; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad, height - pad); ctx.lineTo(width - pad, height - pad);
      ctx.stroke();

      // Axes labels
      ctx.fillStyle = C.muted; ctx.font = "11px monospace";
      ctx.fillText(`0`, pad - 6, height - pad + 14);
      ctx.fillText(`${Math.round(maxX)} km`, width - pad - 40, height - pad + 14);
      ctx.fillText(`${Math.round(maxY)} km`, 2, pad + 4);
      ctx.fillText("Altitude", 4, pad - 8);
      ctx.fillText("Downrange", width / 2 - 30, height - 6);

      // Draw trajectory up to current frame
      const limit = Math.min(frameRef.current, points.length);
      for (let i = 1; i < limit; i++) {
        const prev = toCanvas(points[i - 1].x, points[i - 1].y);
        const curr = toCanvas(points[i].x,     points[i].y);
        ctx.strokeStyle = PHASE_COLOR[points[i].phase] ?? C.cyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(prev.cx, prev.cy);
        ctx.lineTo(curr.cx, curr.cy);
        ctx.stroke();
      }

      // Glowing head dot
      if (limit > 0 && limit < points.length) {
        const head = toCanvas(points[limit - 1].x, points[limit - 1].y);
        const grad = ctx.createRadialGradient(head.cx, head.cy, 0, head.cx, head.cy, 10);
        grad.addColorStop(0, "rgba(255,255,100,0.9)");
        grad.addColorStop(1, "rgba(255,255,100,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(head.cx, head.cy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(head.cx, head.cy, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Impact marker
      if (limit >= points.length && points.length > 0) {
        const last = toCanvas(points[points.length - 1].x, 0);
        ctx.strokeStyle = C.red; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(last.cx - 8, last.cy - 8); ctx.lineTo(last.cx + 8, last.cy + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(last.cx + 8, last.cy - 8); ctx.lineTo(last.cx - 8, last.cy + 8); ctx.stroke();
        ctx.fillStyle = C.red; ctx.font = "11px monospace";
        ctx.fillText("IMPACT", last.cx - 24, last.cy - 12);
      }

      frameRef.current += Math.max(1, Math.floor(points.length / 180));
      if (frameRef.current <= points.length) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [points, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}
    />
  );
}

// ─── MILP MAP ─────────────────────────────────────────────────────
function MilpMap({ sites, selected }: { sites: MilpSite[]; selected: MilpSite[] }) {
  const selectedIds = new Set(selected.map(s => s.id));
  const minLat = Math.min(...sites.map(s => s.lat)) - 1;
  const maxLat = Math.max(...sites.map(s => s.lat)) + 1;
  const minLng = Math.min(...sites.map(s => s.lng)) - 1;
  const maxLng = Math.max(...sites.map(s => s.lng)) + 1;

  const W = 520, H = 320;
  const toXY = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * (W - 60) + 30,
    y: H - ((lat - minLat) / (maxLat - minLat)) * (H - 60) - 30,
  });

  const tierColor = (t: number) => [C.gold, C.cyan, C.green][t - 1] ?? C.muted;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(0,8,20,0.8)" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Grid */}
        {[...Array(8)].map((_, i) => (
          <g key={i}>
            <line x1={30 + i * 70} y1={10} x2={30 + i * 70} y2={H - 10} stroke="rgba(0,200,255,0.06)" strokeWidth={1} />
            <line x1={10} y1={30 + i * 37} x2={W - 10} y2={30 + i * 37} stroke="rgba(0,200,255,0.06)" strokeWidth={1} />
          </g>
        ))}

        {/* Coverage circles for selected sites */}
        {selected.map(s => {
          const { x, y } = toXY(s.lat, s.lng);
          const r = 30 + s.tier * 20;
          return (
            <circle key={`cov-${s.id}`} cx={x} cy={y} r={r}
              fill={`${tierColor(s.tier)}10`} stroke={tierColor(s.tier)}
              strokeWidth={0.8} strokeDasharray="4 3" />
          );
        })}

        {/* All sites */}
        {sites.map(s => {
          const { x, y } = toXY(s.lat, s.lng);
          const active = selectedIds.has(s.id);
          const col = tierColor(s.tier);
          return (
            <g key={s.id}>
              {active && <circle cx={x} cy={y} r={14} fill={`${col}20`} stroke={col} strokeWidth={1.5} />}
              <circle cx={x} cy={y} r={active ? 6 : 4}
                fill={active ? col : "rgba(180,200,255,0.25)"}
                stroke={active ? col : "rgba(180,200,255,0.5)"}
                strokeWidth={1.5}
              />
              <text x={x + 9} y={y + 4} fontSize={9} fill={active ? col : C.muted} fontFamily="monospace">
                {s.name.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        {[1, 2, 3].map((t, i) => (
          <g key={t} transform={`translate(10, ${H - 50 + i * 14})`}>
            <circle cx={6} cy={0} r={4} fill={tierColor(t)} />
            <text x={14} y={4} fontSize={9} fill={C.muted} fontFamily="monospace">Tier-{t}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── DOCUMENTS PANEL ──────────────────────────────────────────────
const DOCUMENTS = [
  {
    title: "Introduction to Ballistic Missiles",
    file:  "Introduction 2 Ballistic Missile.pdf",
    pages: 7, category: "Fundamentals",
    summary: "Overview of ballistic missile principles, flight phases, classification by range (SRBM, MRBM, IRBM, ICBM), and historical development from V-2 to modern systems.",
    topics: ["Flight Phases", "Range Classification", "Propulsion Types", "Historical Context"],
    color: C.cyan,
  },
  {
    title: "Ballistic Component Classification",
    file:  "ballistic component classification.pdf",
    pages: 62, category: "Engineering",
    summary: "Detailed breakdown of missile subsystems: re-entry vehicle, guidance section, interstage, propulsion module, and nose cone configurations with engineering diagrams.",
    topics: ["RV Design", "Guidance Systems", "Interstage", "Propulsion Module", "Warhead Types"],
    color: C.gold,
  },
  {
    title: "Mathematical Aspects & Trajectories",
    file:  "Mathematical aspects and trajectories calculation.pdf",
    pages: 22, category: "Mathematics",
    summary: "Keplerian orbital mechanics applied to ballistic arcs, Tsiolkovsky's rocket equation, atmospheric drag models, and terminal re-entry heating calculations.",
    topics: ["Keplerian Mechanics", "Rocket Equation", "Drag Models", "Re-entry Heating", "Impact Prediction"],
    color: C.green,
  },
  {
    title: "Ballistic Working Principles",
    file:  "Ballistic working.pdf",
    pages: 4, category: "Operations",
    summary: "Operational principles of ballistic missile deployment, targeting procedures, hardened launcher systems, and command & control infrastructure.",
    topics: ["Deployment", "TEL Systems", "C2 Infrastructure", "Targeting"],
    color: C.orange,
  },
];

function DocumentsPanel() {
  const [selected, setSelected] = useState<typeof DOCUMENTS[0] | null>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16, transition: "all 0.3s" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {DOCUMENTS.map((doc) => (
          <motion.div
            key={doc.title}
            whileHover={{ scale: 1.02, borderColor: doc.color }}
            onClick={() => setSelected(selected?.title === doc.title ? null : doc)}
            style={{
              background: C.panel, border: `1px solid ${selected?.title === doc.title ? doc.color : C.border}`,
              borderRadius: 12, padding: "18px 16px", cursor: "pointer", transition: "border-color 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FileText size={18} color={doc.color} />
              <span style={{ fontSize: 11, color: doc.color, fontFamily: "monospace", letterSpacing: 1 }}>
                {doc.category}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>
              {doc.title}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{doc.pages} pages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
              {doc.topics.slice(0, 2).map(t => (
                <span key={t} style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 4,
                  background: `${doc.color}18`, color: doc.color, fontFamily: "monospace",
                }}>{t}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
            style={{ background: C.panel, border: `1px solid ${selected.color}40`, borderRadius: 12, padding: 24 }}
          >
            <div style={{ fontSize: 11, color: selected.color, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>
              {selected.category} · {selected.pages} PAGES
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 16 }}>{selected.title}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>{selected.summary}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, fontFamily: "monospace" }}>KEY TOPICS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {selected.topics.map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: `${selected.color}15`, color: selected.color,
                  border: `1px solid ${selected.color}40`, fontFamily: "monospace",
                }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 8 }}>
              📄 {selected.file}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN SIMULATOR PAGE ──────────────────────────────────────────
type Tab = "simulator" | "milp" | "documents";

export default function SimulatorPage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("simulator");

  // Simulator state
  const [selectedMissile, setSelectedMissile] = useState("Shaheen-II");
  const [points, setPoints] = useState<TrajectoryPoint[]>([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<{ apogee: number; range: number; flightTime: number } | null>(null);

  // MILP state
  const [budget, setBudget] = useState(1200);
  const [minCap, setMinCap] = useState(40);
  const [tiers, setTiers] = useState<number[]>([1, 2, 3]);
  const [milpResult, setMilpResult] = useState<MilpResult | null>(null);

  const runSim = useCallback(() => {
    const cfg = PRESET_MISSILES[selectedMissile];
    if (!cfg) return;
    setRunning(true);
    setStats(null);
    const pts = simulateTrajectory(cfg);
    setPoints(pts);
    const apogee     = Math.max(...pts.map(p => p.y));
    const range      = Math.max(...pts.map(p => p.x));
    const flightTime = pts[pts.length - 1]?.t ?? 0;
    setStats({ apogee, range, flightTime });
    setTimeout(() => setRunning(false), 1000);
  }, [selectedMissile]);

  const runMilp = useCallback(() => {
    const result = runMilpSolver(budget, minCap, tiers);
    setMilpResult(result);
  }, [budget, minCap, tiers]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "simulator",  label: "Trajectory Simulator", icon: <Activity size={14} /> },
    { id: "milp",       label: "MILP Site Optimizer",  icon: <Cpu size={14} /> },
    { id: "documents",  label: "Reference Documents",  icon: <FileText size={14} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── TOP NAV ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,10,18,0.92)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Target size={20} color={C.cyan} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, color: C.cyan, fontFamily: "monospace" }}>
            AEGIS · BALLISTICS LAB
          </span>
        </div>
        <button onClick={onBack} style={{
          background: "none", border: `1px solid ${C.border}`, color: C.muted,
          padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          ← Back to Mission Briefing
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: "24px 32px 0", display: "flex", gap: 4, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
            background: tab === t.id ? "rgba(0,200,255,0.12)" : "transparent",
            color: tab === t.id ? C.cyan : C.muted,
            borderBottom: tab === t.id ? `2px solid ${C.cyan}` : "2px solid transparent",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400, transition: "all 0.2s",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <AnimatePresence mode="wait">

          {/* SIMULATOR TAB */}
          {tab === "simulator" && (
            <motion.div key="sim" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>

                {/* Controls */}
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 11, color: C.cyan, fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>
                    MISSILE SELECTION
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {Object.keys(PRESET_MISSILES).map(name => (
                      <button key={name} onClick={() => setSelectedMissile(name)} style={{
                        padding: "8px 12px", borderRadius: 8, border: `1px solid ${selectedMissile === name ? C.cyan : C.border}`,
                        background: selectedMissile === name ? "rgba(0,200,255,0.12)" : "transparent",
                        color: selectedMissile === name ? C.cyan : C.muted,
                        cursor: "pointer", textAlign: "left", fontSize: 12, transition: "all 0.15s",
                      }}>{name}</button>
                    ))}
                  </div>

                  {/* Missile stats */}
                  {selectedMissile && (
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                      {Object.entries({
                        Range:    `${PRESET_MISSILES[selectedMissile].range} km`,
                        Apogee:   `${PRESET_MISSILES[selectedMissile].apogee} km`,
                        Speed:    `${PRESET_MISSILES[selectedMissile].speed} km/s`,
                        Stages:   `${PRESET_MISSILES[selectedMissile].stages}`,
                        Mass:     `${PRESET_MISSILES[selectedMissile].mass.toLocaleString()} kg`,
                      }).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span>{k}</span><span style={{ color: C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                    <button onClick={runSim} disabled={running} style={{
                      flex: 1, padding: "12px", borderRadius: 8, border: "none",
                      background: running ? "rgba(0,200,255,0.1)" : "rgba(0,200,255,0.2)",
                      color: C.cyan, cursor: running ? "not-allowed" : "pointer",
                      fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <Play size={14} /> {running ? "SIMULATING…" : "LAUNCH SIM"}
                    </button>
                    <button onClick={() => { setPoints([]); setStats(null); }} style={{
                      padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`,
                      background: "transparent", color: C.muted, cursor: "pointer",
                    }}><RotateCcw size={14} /></button>
                  </div>
                </div>

                {/* Canvas + stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontSize: 11, color: C.cyan, fontFamily: "monospace", letterSpacing: 2 }}>
                        TRAJECTORY PLOT · {selectedMissile}
                      </span>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "monospace" }}>
                        {Object.entries(PHASE_COLOR).map(([ph, col]) => (
                          <span key={ph} style={{ color: col }}>■ {ph.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                    {points.length > 0
                      ? <TrajectoryCanvas points={points} />
                      : (
                        <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 8, flexDirection: "column", gap: 8 }}>
                          <Activity size={32} color={C.border} />
                          Select a missile and click LAUNCH SIM
                        </div>
                      )
                    }
                  </div>

                  {/* Stats row */}
                  {stats && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { label: "MAX APOGEE",   value: `${Math.round(stats.apogee)} km`,        color: C.gold },
                        { label: "TOTAL RANGE",  value: `${Math.round(stats.range)} km`,         color: C.cyan },
                        { label: "FLIGHT TIME",  value: `${Math.round(stats.flightTime)} s`,     color: C.green },
                      ].map(s => (
                        <div key={s.label} style={{ background: C.panel, border: `1px solid ${s.color}30`, borderRadius: 10, padding: "14px 18px" }}>
                          <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>{s.label}</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* MILP TAB */}
          {tab === "milp" && (
            <motion.div key="milp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

                {/* Controls */}
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 11, color: C.cyan, fontFamily: "monospace", letterSpacing: 2, marginBottom: 20 }}>
                    OPTIMIZATION PARAMETERS
                  </div>

                  <label style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                    BUDGET (M USD): <span style={{ color: C.gold }}>${budget}M</span>
                  </label>
                  <input type="range" min={400} max={2000} step={50} value={budget}
                    onChange={e => setBudget(+e.target.value)}
                    style={{ width: "100%", margin: "8px 0 18px", accentColor: C.gold }} />

                  <label style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                    MIN INTERCEPTORS: <span style={{ color: C.cyan }}>{minCap}</span>
                  </label>
                  <input type="range" min={10} max={80} step={5} value={minCap}
                    onChange={e => setMinCap(+e.target.value)}
                    style={{ width: "100%", margin: "8px 0 18px", accentColor: C.cyan }} />

                  <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>REQUIRED TIERS</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {[1, 2, 3].map(t => (
                      <button key={t} onClick={() => setTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                        style={{
                          flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                          border: `1px solid ${tiers.includes(t) ? [C.gold, C.cyan, C.green][t - 1] : C.border}`,
                          background: tiers.includes(t) ? `${[C.gold, C.cyan, C.green][t - 1]}20` : "transparent",
                          color: tiers.includes(t) ? [C.gold, C.cyan, C.green][t - 1] : C.muted,
                        }}>T{t}</button>
                    ))}
                  </div>

                  <button onClick={runMilp} style={{
                    width: "100%", padding: "12px", borderRadius: 8, border: "none",
                    background: "rgba(0,200,255,0.18)", color: C.cyan,
                    cursor: "pointer", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <Cpu size={14} /> RUN SOLVER
                  </button>

                  {milpResult && (
                    <div style={{ marginTop: 20, padding: 14, background: "rgba(0,0,0,0.3)", borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: C.green, fontFamily: "monospace", marginBottom: 8 }}>
                        <CheckCircle size={11} style={{ verticalAlign: "middle" }} /> SOLUTION FOUND
                      </div>
                      {[
                        { k: "Sites Selected",    v: milpResult.selectedSites.length },
                        { k: "Total Cost",        v: `$${milpResult.totalCost}M` },
                        { k: "Total Capacity",    v: `${milpResult.totalCapacity} interceptors` },
                        { k: "Coverage Score",    v: `${milpResult.coverageScore.toFixed(1)}%` },
                      ].map(({ k, v }) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", padding: "3px 0", color: C.muted }}>
                          <span>{k}</span><span style={{ color: C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map + table */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, color: C.cyan, fontFamily: "monospace", letterSpacing: 2, marginBottom: 14 }}>
                      GIS SITE MAP — 10 CANDIDATE POLYGONS
                    </div>
                    <MilpMap sites={CANDIDATE_SITES} selected={milpResult?.selectedSites ?? []} />
                  </div>

                  {milpResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 11, color: C.cyan, fontFamily: "monospace", letterSpacing: 2, marginBottom: 14 }}>
                        SELECTED SITES
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {milpResult.selectedSites.map(s => (
                          <div key={s.id} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${[C.gold, C.cyan, C.green][s.tier - 1]}40`, background: "rgba(0,0,0,0.2)" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{s.name}</div>
                            <div style={{ fontSize: 10, fontFamily: "monospace", color: C.muted }}>
                              Tier-{s.tier} · Score: {s.score} · Cap: {s.capacity} · ${s.cost}M
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* DOCUMENTS TAB */}
          {tab === "documents" && (
            <motion.div key="docs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 20 }}>
                4 REFERENCE DOCUMENTS · CLASSIFIED RESEARCH CORPUS
              </div>
              <DocumentsPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
