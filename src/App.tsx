import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Compass,
  Clock,
  Cpu,
  Activity,
  Shield,
  Radio,
  ExternalLink,
  X,
} from "lucide-react";
import { SimulatorDashboard } from "./components/simulator/SimulatorDashboard";


// --- DATA ---
const chaptersData = [
  {
    name: "Tier-I: Low-Altitude Point Defense",
    category: "TACTICAL TERMINAL INTERCEPTION",
    apogee: "25 – 45 km",
    speed: "0.8 – 1.4 km/s",
    window: "40 – 60 s",
    image: "/chapter_tier1.jpg",
    description:
      "Rapid-response surface-to-air interceptors positioned in forward perimeter polygons to counter low-altitude terminal dive threats.",
  },
  {
    name: "Tier-II: Trans-Regional Area Defense",
    category: "REGIONAL PHASED-ARRAY COVERAGE",
    apogee: "45 – 75 km",
    speed: "1.2 – 2.0 km/s",
    window: "60 – 90 s",
    image: "/chapter_tier2.jpg",
    description:
      "Central high-altitude radar nodes coordinating midcourse defensive batteries across contiguous 100 km territorial corridors.",
  },
  {
    name: "Tier-III: Exo-Atmospheric Ballistic Arc",
    category: "HIGH-APOGEE KINETIC INTERCEPT",
    apogee: "70 – 110 km",
    speed: "1.8 – 2.8 km/s",
    window: "90 – 120 s",
    image: "/chapter_tier3.jpg",
    description:
      "Sub-orbital kinetic kill vehicles engaging targets at edge-of-space apogees with multi-site layered complementary backup.",
  },
  {
    name: "Candidate Land Polygons & Siting",
    category: "GIS SPATIAL GEOMETRY & TOPOGRAPHY",
    apogee: "Ground Level",
    speed: "Stationary Sites",
    window: "Continuous",
    image: "/chapter_gis.jpg",
    description:
      "Mathematical evaluation of 10 candidate land polygon areas evaluating access, communication, and sensor quality scores.",
  },
  {
    name: "Mixed-Integer Optimization & Capacity",
    category: "OPERATIONS RESEARCH & MILP SOLVER",
    apogee: "Computational",
    speed: "< 250 ms solve",
    window: "Full Scenario",
    image: "/chapter_milp.jpg",
    description:
      "Linearized diminishing returns optimization matching site capacities to threat trajectories under strict budget bounds.",
  },
];

// --- ANIMATION VARIANTS ---
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// --- CUSTOM SAND / PARTICLE DISSOLVE IMAGE COMPONENT ---
function SandTransitionImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const filterIdRef = useRef(`sand-filter-${Math.random().toString(36).substr(2, 9)}`);
  const [filterProgress, setFilterProgress] = useState(0);

  useEffect(() => {
    if (src !== currentSrc) {
      setIsTransitioning(true);
      let start: number | null = null;
      const duration = 750;

      const animateStep = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out
        setFilterProgress(progress);

        if (progress < 0.5) {
          requestAnimationFrame(animateStep);
        } else {
          setCurrentSrc(src);
          requestAnimationFrame(animateOut);
        }
      };

      const animateOut = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        setFilterProgress(1 - progress);

        if (progress < 1) {
          requestAnimationFrame(animateOut);
        } else {
          setIsTransitioning(false);
          setFilterProgress(0);
        }
      };

      requestAnimationFrame(animateStep);
    }
  }, [src, currentSrc]);

  const displacementScale = isTransitioning ? filterProgress * 80 : 0;
  const blurVal = isTransitioning ? filterProgress * 4 : 0;
  const opacityVal = isTransitioning ? 1 - filterProgress * 0.4 : 1;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id={filterIdRef.current}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={blurVal} />
          </filter>
        </defs>
      </svg>
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${className}`}
        style={{
          filter: displacementScale > 0 ? `url(#${filterIdRef.current})` : "none",
          opacity: opacityVal,
        }}
      />
    </div>
  );
}

// --- BLUEPRINT VEHICLE SCHEMATIC ANIMATION COMPONENT ---
function BlueprintVehicleAnimation({
  onOpenSpecs,
}: {
  onOpenSpecs: () => void;
}) {
  const [viewMode, setViewMode] = useState<"side" | "full" | "top" | "axial">("side");
  const [isTacticalDark, setIsTacticalDark] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Zoom & Pan camera presets
  const viewPresets: Record<
    "side" | "full" | "top" | "axial",
    { scale: number; y: string; title: string; subtitle: string }
  > = {
    side: {
      scale: 1.52,
      y: "25%",
      title: "SIDE ELEVATION PROFILE",
      subtitle: "8×8 MAZ-543 Chassis & Stowed Launch Rail",
    },
    full: {
      scale: 1,
      y: "0%",
      title: "OVERALL 3-VIEW SCHEMATIC",
      subtitle: "S-400 Triumf Mobile Defense System",
    },
    top: {
      scale: 1.52,
      y: "-3%",
      title: "TOP-DOWN PLAN VIEW",
      subtitle: "Missile Traverse Cradle & Hydraulic Bay",
    },
    axial: {
      scale: 1.62,
      y: "-33%",
      title: "AXIAL CROSS-SECTIONS",
      subtitle: "Operator Cab Front & Stabilizer Rear",
    },
  };

  const currentPreset = viewPresets[viewMode];

  return (
    <div className="w-full max-w-[620px] mx-auto flex flex-col items-center">
      {/* Outer HUD Card Frame */}
      <div
        className={`relative w-full rounded-lg border transition-colors duration-500 overflow-hidden shadow-lg ${
          isTacticalDark
            ? "bg-[#0b1329] border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.18)]"
            : "bg-white/95 border-gray-300 text-gray-800 shadow-sm"
        }`}
      >
        {/* HUD Top Bar */}
        <div
          className={`flex items-center justify-between px-3.5 py-2 text-[10px] font-mono border-b transition-colors ${
            isTacticalDark
              ? "border-emerald-500/30 bg-[#060b18]/90 text-emerald-400"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wider uppercase">
              S-400 TRIUMF TEL LAUNCHER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* FLIR Mode Toggle */}
            <button
              onClick={() => setIsTacticalDark(!isTacticalDark)}
              className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isTacticalDark
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isTacticalDark ? "FLIR NIGHT HUD" : "BLUEPRINT MODE"}
            </button>

            {/* Laser Scan Toggle */}
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`px-1.5 py-0.5 rounded border text-[9px] font-bold transition-all cursor-pointer ${
                isScanning
                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              SCAN
            </button>
          </div>
        </div>

        {/* Perspective View Buttons */}
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b text-[9px] font-mono tracking-widest uppercase overflow-x-auto ${
            isTacticalDark
              ? "border-emerald-500/20 bg-[#081020]"
              : "border-gray-200 bg-gray-100/70 text-gray-600"
          }`}
        >
          <span className="text-gray-400 mr-1 hidden sm:inline">VIEW:</span>
          <div className="flex items-center gap-1">
            {(
              [
                { id: "side", label: "SIDE PROFILE" },
                { id: "full", label: "ALL 3-VIEWS" },
                { id: "top", label: "TOP PLAN" },
                { id: "axial", label: "FRONT/REAR" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setViewMode(item.id);
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                  viewMode === item.id
                    ? isTacticalDark
                      ? "bg-emerald-500 text-black shadow-[0_0_8px_#10b981]"
                      : "bg-black text-white shadow-sm"
                    : isTacticalDark
                    ? "text-emerald-400 hover:bg-emerald-950/60"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Canvas Viewport */}
        <div
          className={`relative w-full h-[270px] sm:h-[310px] overflow-hidden cursor-crosshair ${
            isTacticalDark
              ? "bg-[#060c18] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"
              : "bg-[#fafafa] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]"
          }`}
        >
          {/* Subtle Framing HUD Corner Brackets */}
          <div className="absolute top-2 left-2 text-[10px] font-mono opacity-40 select-none pointer-events-none">
            + [00,00]
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-mono opacity-40 select-none pointer-events-none">
            [100,00] +
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-mono opacity-40 select-none pointer-events-none">
            + [00,100]
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono opacity-40 select-none pointer-events-none">
            [100,100] +
          </div>

          {/* Animated Image Container with Smooth Pan & Zoom */}
          <motion.div
            className="w-full h-full flex items-center justify-center relative origin-center"
            animate={{
              scale: currentPreset.scale,
              y: currentPreset.y,
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {/* The Blueprint Schematic Image */}
            <div className="relative w-[92%] h-[92%] flex items-center justify-center">
              <img
                src="/launcher_blueprint.png"
                alt="S-400 Triumf Transporter Erector Launcher Blueprint"
                className={`max-w-full max-h-full object-contain select-none transition-all duration-500 ${
                  isTacticalDark
                    ? "invert hue-rotate-180 brightness-110 contrast-125"
                    : "mix-blend-multiply opacity-95 contrast-110"
                }`}
              />
            </div>
          </motion.div>

          {/* Sweeping Laser Radar Beam */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className={`w-full h-12 border-b animate-laser-scan ${
                  isTacticalDark
                    ? "bg-gradient-to-b from-transparent via-emerald-500/15 to-emerald-500/25 border-emerald-400/80 shadow-[0_0_12px_#10b981]"
                    : "bg-gradient-to-b from-transparent via-cyan-500/10 to-cyan-500/20 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                }`}
              />
            </div>
          )}

          {/* Scale Rulers Overlay */}
          <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[8px] font-mono opacity-70 pointer-events-none">
            <span className="font-bold">SCALE 1:50</span>
            <div className="flex items-center gap-0.5">
              <span className="w-4 h-[1px] bg-current inline-block" />
              <span>0</span>
              <span className="w-4 h-[1px] bg-current inline-block" />
              <span>1m</span>
              <span className="w-4 h-[1px] bg-current inline-block" />
              <span>2m</span>
              <span className="w-4 h-[1px] bg-current inline-block" />
              <span>3m</span>
            </div>
          </div>

          {/* Current Perspective Indicator */}
          <div className="absolute top-2 right-3 text-[9px] font-mono text-right opacity-80 pointer-events-none">
            <div className="font-bold uppercase tracking-wider">
              {currentPreset.title}
            </div>
            <div className="text-[8px] text-gray-400">
              {currentPreset.subtitle}
            </div>
          </div>
        </div>

        {/* Bottom Technical Telemetry Footer Strip */}
        <div
          className={`px-3 py-2 border-t text-[9px] font-mono flex flex-wrap items-center justify-between gap-2 ${
            isTacticalDark
              ? "border-emerald-500/30 bg-[#060b18] text-emerald-400/90"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <span>
              DIM: <strong>13.36m × 3.02m</strong>
            </span>
            <span className="hidden sm:inline">
              MASS: <strong>37.0 TONNES</strong>
            </span>
            <span>
              CHASSIS: <strong>8×8 ALL-TERRAIN</strong>
            </span>
          </div>

          <button
            onClick={onOpenSpecs}
            className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] hover:underline cursor-pointer ${
              isTacticalDark ? "text-emerald-300" : "text-black"
            }`}
          >
            Vehicle Blueprint Specs &rarr;
          </button>
        </div>
      </div>

      {/* Subtitle Caption */}
      <div className="mt-2.5 text-center text-[10px] font-mono text-gray-500 tracking-wider uppercase">
        Tactical Mobile Launch Platform Schematic &bull; Siting Target Unit
      </div>
    </div>
  );
}

function App({ onNavigateToSimulator }: { onNavigateToSimulator?: () => void }) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSpecimen, setActiveSpecimen] = useState<"tel" | "aero">("tel");

  // Auto-cycle chapters every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % chaptersData.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#fcfcfc] text-[#111] overflow-x-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* SECTION 1: HERO (Full Viewport Height) */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden pb-12">
        {/* Subtle high-tech ambient background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none z-0" />

        {/* 1A. HEADER WITH ANIMATED "SPCO" / "AEGIS" GEOMETRIC LOGO */}
        <motion.header
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
          className="relative w-full pt-6 px-6 md:px-16 z-20"
        >
          {/* Top Classification Banner */}
          <div className="flex justify-between items-center text-[10px] font-mono tracking-[0.25em] text-gray-400 uppercase mb-4 border-b border-gray-200 pb-2">
            <span>DEFENSE SYSTEMS DECISION SUPPORT</span>
            <span>100 KM × 100 KM STUDY REGION • ACADEMIC SIMULATION</span>
          </div>

          {/* Large Geometric SVG Typography: "AEGIS" */}
          <motion.div
            variants={{
              initial: { scale: 1.02 },
              animate: { scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="w-full flex justify-center py-2"
          >
            <svg
              viewBox="0 0 840 95"
              className="w-full max-w-[1280px] h-auto fill-[#111]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Letter A (translate 0,0) */}
              <g transform="translate(10, 0)">
                <motion.polygon
                  variants={letterBlock}
                  points="0,95 24,95 90,0 66,0"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="132,95 156,95 90,0 66,0"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="38,62 118,62 118,74 38,74"
                />
              </g>

              {/* Letter E (translate 200,0) */}
              <g transform="translate(200, 0)">
                <motion.polygon
                  variants={letterBlock}
                  points="0,0 24,0 24,95 0,95"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="24,0 135,0 135,16 24,16"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="24,40 105,40 105,56 24,56"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="24,79 135,79 135,95 24,95"
                />
              </g>

              {/* Letter G (translate 370,0) */}
              <g transform="translate(370, 0)">
                <motion.polygon
                  variants={letterBlock}
                  points="0,0 24,0 24,95 0,95"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="24,0 135,0 135,16 24,16"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="24,79 135,79 135,95 24,95"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="111,48 135,48 135,95 111,95"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="65,48 135,48 135,62 65,62"
                />
              </g>

              {/* Letter I (translate 540,0) */}
              <g transform="translate(540, 0)">
                <motion.polygon
                  variants={letterBlock}
                  points="25,0 55,0 55,95 25,95"
                />
              </g>

              {/* Letter S (translate 640,0) */}
              <g transform="translate(640, 0)">
                <motion.polygon
                  variants={letterBlock}
                  points="0,0 145,0 145,16 0,16"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="0,0 24,0 24,52 0,52"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="0,40 145,40 145,56 0,56"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="121,44 145,44 145,95 121,95"
                />
                <motion.polygon
                  variants={letterBlock}
                  points="0,79 145,79 145,95 0,95"
                />
              </g>
            </svg>
          </motion.div>

          {/* 1B. SUB-NAV BAR */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-between items-start mt-6 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase border-t border-gray-200 pt-5"
          >
            {/* Left Column (18% width) */}
            <div className="w-[18%] leading-relaxed font-semibold text-gray-900">
              <div>SPATIAL</div>
              <div>DEFENSE</div>
              <div>OPTIMIZER</div>
            </div>

            {/* Arrow Separator */}
            <div className="hidden md:flex w-[4%] justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1.5} className="text-gray-400" />
            </div>

            {/* Center Column */}
            <div className="flex-1 md:w-[35%] text-gray-700 leading-relaxed font-mono normal-case text-[11px] md:text-[12px] px-2">
              <span className="font-semibold text-gray-900">Candidate-Site Siting Problem:</span> Multi-factor probabilistic modeling and mixed-integer linear programming (MILP) to identify cost-optimal facility polygons defending against synthetic ballistic threats.
            </div>

            {/* Arrow Separator */}
            <div className="hidden md:flex w-[4%] justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1.5} className="text-gray-400" />
            </div>

            {/* Right Nav Links */}
            <div className="hidden md:flex w-[25%] justify-end gap-6 text-gray-800">
              <a href="#grid-overview" className="hover:text-black hover:underline transition-colors">
                Grid
              </a>
              <a href="#threat-spectrum" className="hover:text-black hover:underline transition-colors">
                Threats
              </a>
              <a href="#optimization" className="hover:text-black hover:underline transition-colors">
                Solver
              </a>
              <button
                onClick={() => onNavigateToSimulator ? onNavigateToSimulator() : (window.location.href = '/simulator')}
                className="text-emerald-700 font-bold hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                Simulator <ExternalLink size={11} />
              </button>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-end gap-[6px] w-8 h-8 z-50 cursor-pointer"
              aria-label="Toggle Menu"
            >
              <div
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? "w-6 rotate-45 translate-y-[4px]" : "w-7"
                }`}
              />
              <div
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? "w-6 -rotate-45 -translate-y-[4px]" : "w-5"
                }`}
              />
            </button>
          </motion.div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden absolute top-full left-0 w-full bg-[#fcfcfc] border-b border-gray-200 shadow-xl p-8 space-y-4 font-mono tracking-widest uppercase text-xs z-50"
              >
                <div><a href="#grid-overview" onClick={() => setIsMobileMenuOpen(false)}>Grid Overview</a></div>
                <div><a href="#threat-spectrum" onClick={() => setIsMobileMenuOpen(false)}>Threat Spectrum</a></div>
                <div><a href="#optimization" onClick={() => setIsMobileMenuOpen(false)}>Optimization Logic</a></div>
                <div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onNavigateToSimulator) {
                        onNavigateToSimulator();
                      } else {
                        window.location.href = '/simulator';
                      }
                    }}
                    className="text-emerald-700 font-bold cursor-pointer"
                  >
                    Launch Simulator ↗
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* 1E. HERO MAIN BODY CONTENT */}
        <div className="relative w-full flex-1 flex flex-col md:flex-row justify-between items-start px-6 md:px-16 mt-12 md:mt-16 z-10">
          {/* Left Sidebar Content */}
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.15, delayChildren: 0.5 }}
            className="w-full md:w-[380px]"
          >
            {/* Section Indicator */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs font-mono text-gray-500 mb-6">
              <span className="font-semibold text-gray-900">01</span>
              <div className="w-14 h-[1px] bg-black/30" />
              <span className="tracking-widest uppercase">STRATEGIC SITING</span>
            </motion.div>

            {/* Main Hero Headline */}
            <motion.h2
              variants={fadeUp}
              className="text-[3.2rem] md:text-[4.6rem] font-normal tracking-tight leading-[0.95] text-[#111] mb-6"
            >
              TACTICAL <br />
              HORIZONS
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-[13px] md:text-[14px] text-gray-700 max-w-[280px] leading-[1.65] mb-8 font-normal"
            >
              Defensive spatial optimization and multi-factor probabilistic engagement modeling for candidate facility selection.
            </motion.p>

            {/* Interactive CTA Button: Slide Hover Effect */}
            <motion.div variants={fadeUp}>
              <button
                onClick={() => onNavigateToSimulator ? onNavigateToSimulator() : (window.location.href = '/simulator')}
                className="group relative inline-flex items-center gap-3 bg-[#111] text-white px-7 py-3.5 rounded-md border border-[#111] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 cursor-pointer"
              >
                {/* Sliding Background Panel */}
                <div className="absolute inset-0 bg-[#fcfcfc] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                {/* Rotating Crosshair / Radar Icon */}
                <Crosshair
                  size={16}
                  className="relative z-10 text-white group-hover:text-black group-hover:rotate-90 group-hover:scale-110 transition-all duration-300"
                />

                {/* Text */}
                <span className="relative z-10 text-[14px] font-medium font-mono uppercase tracking-wider text-white group-hover:text-black transition-colors duration-300">
                  Launch Simulator
                </span>
                <ArrowRight
                  size={14}
                  className="relative z-10 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300"
                />
              </button>
            </motion.div>
          </motion.div>

          {/* Center / Right Blueprint Vehicle Schematic Animation */}
          <div className="w-full lg:flex-1 flex justify-center items-center py-2 px-2 z-10 my-4 lg:my-0">
            <BlueprintVehicleAnimation onOpenSpecs={() => setIsModalOpen(true)} />
          </div>
        </div>

        {/* 1G. BOTTOM-LEFT "SCROLL TO EXPLORE" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="relative px-6 md:px-16 mt-8 hidden md:flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center gap-[3px]">
            <div className="w-[1.5px] h-[10px] bg-gray-600 animate-pulse" />
            <div className="w-[1.5px] h-[10px] bg-gray-600 animate-pulse delay-100" />
          </div>
          <span>Scroll to explore defense grid</span>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: "EXPLORE THE DEFENSE GRID" (Clean Light Section) */}
      {/* ============================================================ */}
      <section
        id="grid-overview"
        className="relative w-full min-h-[85vh] bg-[#fcfcfc] flex flex-col items-center pt-24 md:pt-32 pb-20 z-20 border-t border-gray-200"
      >
        {/* 2A. SECTION LABEL */}
        <div className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-8">
          <span className="text-gray-500">[ 02 ]</span>{" "}
          <span className="text-gray-900 font-bold uppercase">Strategic Feasibility</span>
        </div>

        {/* 2B. MAIN HEADING */}
        <motion.h2
          initial={{ y: 35, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2.2rem] md:text-[3.4rem] lg:text-[4rem] leading-[1.1] font-medium tracking-tight text-[#111] max-w-[980px] text-center px-6 mb-12"
        >
          Unifying spatial geometry, moving trajectory arcs, and mixed-integer linear programming.
        </motion.h2>

        {/* 2C. ACTION PILLS */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-6 mb-16 max-w-[850px]">
          {[
            { icon: <Shield size={14} />, label: "Airborne Threats" },
            { icon: <Compass size={14} />, label: "Spatial Polygons" },
            { icon: <Clock size={14} />, label: "Tracking Envelopes" },
            { icon: <Cpu size={14} />, label: "MILP Formulation" },
            { icon: <Activity size={14} />, label: "Probabilistic Audit" },
          ].map((pill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/80 backdrop-blur-sm text-gray-800 hover:border-black hover:bg-black hover:text-white transition-all duration-300 cursor-default shadow-xs"
            >
              {pill.icon}
              <span>{pill.label}</span>
            </motion.div>
          ))}
        </div>

        {/* 2D. SPACER OVERLAP CONTAINER FOR HERO INTERCEPTOR */}
        <div className="relative w-full max-w-[1100px] h-[220px] md:h-[320px] px-6 flex justify-center">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute -bottom-16 w-full max-w-[950px] rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black z-30"
          >
            <img
              src="/interceptor_hero.jpg"
              alt="Supersonic Interceptor Vehicle"
              className="w-full h-[260px] md:h-[380px] object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-6 md:p-8">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                  AEROSPACE INTERCEPTOR FLEET
                </span>
                <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight mt-1">
                  High-Altitude Exo-Atmospheric Defense Layer
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 2E. BOTTOM TEXT */}
        <div className="w-full flex justify-between items-center px-8 md:px-16 pt-24 text-[10px] font-mono tracking-widest uppercase text-gray-400 font-medium">
          <div>DEFENSIVE SIMULATION BENCHMARK</div>
          <div>OPERATIONS RESEARCH (C) 2026</div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: "TACTICAL DEFENSE PORTFOLIO" (Dark Section #0a0a0a) */}
      {/* ============================================================ */}
      <section
        id="threat-spectrum"
        className="relative w-full bg-[#0a0a0a] text-white flex flex-col pt-32 pb-24 z-30 border-t border-gray-900"
      >
        {/* 3B. HEADING AREA */}
        <div className="px-8 md:px-16 mb-16">
          <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
            {/* Left Main Heading */}
            <div className="max-w-[780px]">
              <div className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-semibold mb-4">
                [ 03 ] TACTICAL DEFENSE MATRIX
              </div>
              <h2 className="text-[2rem] md:text-[3.2rem] lg:text-[3.8rem] leading-[1.12] font-medium tracking-tight text-white">
                Curated from thousands of simulated threat vectors{" "}
                <span className="inline-flex gap-2 align-middle mx-2 translate-y-[-4px]">
                  <span className="w-8 h-8 md:w-11 md:h-11 rounded-full border border-gray-700 bg-black flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <Shield size={16} />
                  </span>
                  <span className="w-8 h-8 md:w-11 md:h-11 rounded-full border border-gray-700 bg-black flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <Radio size={16} />
                  </span>
                  <span className="w-8 h-8 md:w-11 md:h-11 rounded-full border border-gray-700 bg-black flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <Crosshair size={16} />
                  </span>
                </span>{" "}
                & candidate land polygons.
              </h2>
            </div>

            {/* Right Tagline + Badges */}
            <div className="xl:text-right flex flex-col items-start xl:items-end">
              <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-4 leading-relaxed max-w-[280px]">
                WE DON'T GUESS DEPLOYMENTS <br />
                WE SOLVE COMPLEMENTARY COVERAGE
              </div>
              <div className="flex flex-wrap gap-2">
                {["Mathematical", "Defensive", "Optimal"].map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 rounded-full border border-gray-700 text-[9px] font-mono tracking-widest uppercase text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3C. TWO-COLUMN INTERACTIVE CHAPTER SHOWCASE */}
        <div className="border-y border-gray-800 flex flex-col lg:flex-row w-full">
          {/* Left Panel (40% width): Interactive Sand Transition Image */}
          <div className="lg:w-[42%] border-b lg:border-b-0 lg:border-r border-gray-800 p-8 md:p-12 flex flex-col justify-between min-h-[460px] md:min-h-[580px] bg-[#0d0d0d]">
            {/* Top Chapter Status Code */}
            <div className="flex justify-between items-center text-gray-500 font-mono text-xs tracking-widest">
              <span>{chaptersData[activeChapter].category}</span>
              <span className="text-gray-400">SYS_VECT_{activeChapter + 1}</span>
            </div>

            {/* Center Visual with Particle/Sand Dissolve */}
            <div className="relative w-full h-[320px] md:h-[400px] my-6 rounded-lg overflow-hidden border border-gray-800 bg-black">
              <SandTransitionImage
                src={chaptersData[activeChapter].image}
                alt={chaptersData[activeChapter].name}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded border border-gray-800">
                <div className="text-[9px] font-mono text-gray-400 uppercase">Operational Envelope</div>
                <div className="text-xs text-gray-200 mt-1">
                  Apogee: <span className="text-emerald-400 font-bold">{chaptersData[activeChapter].apogee}</span> | Speed: <span className="text-white font-semibold">{chaptersData[activeChapter].speed}</span>
                </div>
              </div>
            </div>

            {/* Bottom Counter */}
            <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-gray-500 uppercase">
              <span>ACTIVE PROFILE</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">
                  0{activeChapter + 1}
                </span>
                <span className="text-gray-600">/</span>
                <span>0{chaptersData.length}</span>
              </div>
            </div>
          </div>

          {/* Right Panel (58% width): Interactive Chapter List */}
          <div className="lg:w-[58%] flex flex-col justify-between bg-[#0a0a0a]">
            {/* Top Bar */}
            <div className="border-b border-gray-800 p-6 md:p-8 flex justify-between items-center text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              <span>Explore the vectors. Understand the coverage.</span>
              <span className="text-emerald-400 font-bold">Chapter 0{activeChapter + 1}</span>
            </div>

            {/* Chapter Items List */}
            <div className="flex-1 flex flex-col justify-center divide-y divide-gray-800/80">
              {chaptersData.map((chap, idx) => {
                const isActive = activeChapter === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveChapter(idx)}
                    className={`group px-6 md:px-10 py-6 md:py-8 cursor-pointer transition-all duration-300 flex justify-between items-center ${
                      isActive ? "bg-[#111] text-white" : "text-gray-500 hover:text-gray-300 hover:bg-[#0e0e0e]"
                    }`}
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      <span className={`text-xs font-mono tracking-widest pt-1 ${isActive ? "text-emerald-400 font-bold" : "text-gray-600"}`}>
                        0{idx + 1}
                      </span>
                      <div>
                        <h4 className={`text-xl md:text-2xl font-medium tracking-tight ${isActive ? "text-white font-bold" : "text-gray-400 group-hover:text-white"}`}>
                          {chap.name}
                        </h4>
                        <p className={`text-xs mt-1.5 font-mono max-w-[500px] leading-relaxed ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                          {chap.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className="hidden sm:inline-block px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 rounded">
                          Selected
                        </span>
                      )}
                      <ArrowUpRight
                        size={22}
                        strokeWidth={1.5}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-emerald-400 translate-x-0 opacity-100 rotate-0"
                            : "text-gray-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Status Ticker */}
            <div className="border-t border-gray-800 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0a]">
              <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                DEFENSE SIMULATION ENGINE • COIN-OR CBC SOLVER
              </div>
              <button
                onClick={() => onNavigateToSimulator ? onNavigateToSimulator() : (window.location.href = '/simulator')}
                className="inline-flex items-center gap-2 text-xs font-mono text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded transition-colors uppercase tracking-widest font-semibold cursor-pointer"
              >
                Run Live Benchmark <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: LIVE SIMULATOR BRIDGE / FOOTER */}
      {/* ============================================================ */}
      <footer className="w-full bg-[#050505] text-white border-t border-gray-900 py-16 px-6 md:px-16">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-800 pb-12">
          <div>
            <div className="text-xs font-mono text-emerald-400 tracking-widest uppercase font-bold">
              SPATIAL DEFENSE & DECISION SYSTEMS RESEARCH GROUP
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">
              Synthetic Probabilistic Candidate-Site Optimization
            </h3>
            <p className="text-xs text-gray-400 max-w-[500px] mt-2 font-mono leading-relaxed">
              Defensive spatial optimization benchmark. Built with Vite, React 19, Motion, and Python PuLP Operations Research solver.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => onNavigateToSimulator ? onNavigateToSimulator() : (window.location.href = '/simulator')}
              className="px-6 py-3.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-200 transition-colors text-center cursor-pointer"
            >
              Open Full Simulator Dashboard ↗
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          <span>ACADEMIC RESEARCH PROTOTYPE • STRICTLY NON-OPERATIONAL</span>
          <span>ETHICS & GIS BENCHMARK (C) 2026</span>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODAL: TECHNICAL SPECIFICATIONS BRIEFING */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0f172a] text-white border border-gray-700 rounded-xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
                <button
                  onClick={() => setActiveSpecimen("tel")}
                  className={`px-3 py-1 rounded text-xs font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                    activeSpecimen === "tel"
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  9P117 ELBRUS TEL LAUNCHER
                </button>
                <button
                  onClick={() => setActiveSpecimen("aero")}
                  className={`px-3 py-1 rounded text-xs font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                    activeSpecimen === "aero"
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AERO-X3 INTERCEPTOR
                </button>
              </div>

              {activeSpecimen === "tel" ? (
                <>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    SYSTEM SCHEMATIC BLUEPRINT BRIEFING
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    S-400 Triumf Mobile Defense Transporter Erector Launcher
                  </h3>

                  <div className="my-4 p-2 bg-white rounded-lg overflow-hidden border border-gray-600 flex justify-center">
                    <img
                      src="/launcher_blueprint.png"
                      alt="Launcher Blueprint"
                      className="max-h-[220px] object-contain"
                    />
                  </div>

                  <div className="mt-4 space-y-3 text-xs font-mono text-gray-300 leading-relaxed">
                    <p>
                      <strong>Platform Role:</strong> Heavy tactical all-terrain mobile launcher deployed within candidate polygon areas to provide flexible firing azimuth and defense reaction corridors.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
                      <div className="bg-[#1e293b] p-2.5 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[9px]">OVERALL LENGTH</span>
                        <span className="text-sm font-bold text-white">13.36 m</span>
                      </div>
                      <div className="bg-[#1e293b] p-2.5 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[9px]">OVERALL WIDTH</span>
                        <span className="text-sm font-bold text-white">3.02 m</span>
                      </div>
                      <div className="bg-[#1e293b] p-2.5 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[9px]">GROSS MASS</span>
                        <span className="text-sm font-bold text-white">37.0 Tonnes</span>
                      </div>
                      <div className="bg-[#1e293b] p-2.5 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[9px]">ERECTION ANGLE</span>
                        <span className="text-sm font-bold text-emerald-400">90° Vertical</span>
                      </div>
                    </div>
                    <p>
                      <strong>Spatial Siting Model Constraints:</strong> Evaluated under candidate polygon slope &lt; 12%, soil bearing capacity &ge; 250 kPa, road network proximity factor, and site quality score q_j &ge; 0.45.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    TECHNICAL SPECIFICATIONS MEMORANDUM
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    AERO-X3 Exo-Atmospheric Interceptor System
                  </h3>

                  <div className="mt-6 space-y-4 text-xs font-mono text-gray-300 leading-relaxed">
                    <p>
                      <strong>System Class:</strong> Abstract Kinetic Kill Vehicle (KVV) designed for exo-atmospheric intercept within the 100 km × 100 km synthetic regional study grid.
                    </p>
                    <div className="grid grid-cols-2 gap-4 my-4">
                      <div className="bg-[#1e293b] p-3 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[10px]">MAX ALTITUDE CEILING</span>
                        <span className="text-base font-bold text-white">120.0 km (AGL)</span>
                      </div>
                      <div className="bg-[#1e293b] p-3 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[10px]">AVERAGE VELOCITY</span>
                        <span className="text-base font-bold text-white">2.80 km/s</span>
                      </div>
                      <div className="bg-[#1e293b] p-3 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[10px]">EFFECTIVE ENGAGEMENT RADIUS</span>
                        <span className="text-base font-bold text-white">80.0 km</span>
                      </div>
                      <div className="bg-[#1e293b] p-3 rounded border border-gray-700">
                        <span className="text-gray-400 block text-[10px]">SIMULATED BASELINE P(SUCCESS)</span>
                        <span className="text-base font-bold text-emerald-400">85.0% Independent</span>
                      </div>
                    </div>
                    <p>
                      <strong>Mathematical Formulation:</strong> Evaluated under diminishing returns multi-assignment policy: P_i = 1 - &prod;(1 - p_ij)^&#123;z_ij&#125;. Deployed exclusively from candidate land polygons meeting composite quality threshold q_j &ge; 0.45.
                    </p>
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase tracking-widest rounded transition-colors"
                >
                  Dismiss Briefing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppRoot() {
  const [route, setRoute] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes("/simulator") || hash.includes("simulator")) {
        return "/simulator";
      }
    }
    return "/";
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes("/simulator") || hash.includes("simulator")) {
        setRoute("/simulator");
      } else {
        setRoute("/");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({}, "", to);
      } catch {
        window.location.hash = to === "/simulator" ? "#simulator" : "";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setRoute(to);
  };

  if (route === "/simulator") {
    return <SimulatorDashboard onBackToLanding={() => navigate("/")} />;
  }

  return <App onNavigateToSimulator={() => navigate("/simulator")} />;
}
