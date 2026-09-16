// ============================================================
// AEGIS BALLISTIC TRAJECTORY SIMULATOR — Core Physics Engine
// ============================================================

export interface MissileConfig {
  name: string;
  range: number;         // km
  apogee: number;        // km
  speed: number;         // km/s at burnout
  mass: number;          // kg
  thrustKN: number;      // kN
  burnTime: number;      // seconds
  stages: number;
}

export interface TrajectoryPoint {
  t: number;   // time (s)
  x: number;   // downrange (km)
  y: number;   // altitude (km)
  vx: number;  // velocity x (km/s)
  vy: number;  // velocity y (km/s)
  phase: "boost" | "midcourse" | "reentry";
}

const G = 9.80665 / 1000; // km/s²
const rho0 = 1.225e-9;    // kg/km³ (sea level density)
const H = 8.5;             // scale height km
const Cd = 0.3;            // drag coefficient
const A = 0.003;           // cross section km²

export const PRESET_MISSILES: Record<string, MissileConfig> = {
  "Hatf-III (Ghaznavi)": {
    name: "Hatf-III (Ghaznavi)", range: 300, apogee: 90,
    speed: 1.5, mass: 5500, thrustKN: 260, burnTime: 55, stages: 1,
  },
  "Shaheen-I": {
    name: "Shaheen-I", range: 900, apogee: 210,
    speed: 2.1, mass: 9500, thrustKN: 480, burnTime: 75, stages: 1,
  },
  "Shaheen-II": {
    name: "Shaheen-II", range: 2500, apogee: 580,
    speed: 3.2, mass: 25000, thrustKN: 950, burnTime: 110, stages: 2,
  },
  "DF-15 (CSS-6)": {
    name: "DF-15 (CSS-6)", range: 600, apogee: 150,
    speed: 1.9, mass: 6200, thrustKN: 320, burnTime: 60, stages: 1,
  },
  "DF-21": {
    name: "DF-21", range: 2150, apogee: 500,
    speed: 3.0, mass: 14700, thrustKN: 800, burnTime: 100, stages: 2,
  },
  "DF-26": {
    name: "DF-26", range: 4000, apogee: 1000,
    speed: 4.5, mass: 20000, thrustKN: 1200, burnTime: 130, stages: 2,
  },
  "Scud-B": {
    name: "Scud-B", range: 300, apogee: 80,
    speed: 1.5, mass: 5900, thrustKN: 130, burnTime: 65, stages: 1,
  },
};

function atmosphericDensity(alt: number): number {
  return rho0 * Math.exp(-alt / H);
}

export function simulateTrajectory(cfg: MissileConfig): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  // Launch angle for max range ≈ 45°, adjusted for actual range/apogee
  const targetApogee = cfg.apogee;
  const v0 = cfg.speed; // km/s burnout speed
  
  // Compute launch angle from range
  // Using simplified ballistic: range = v0² * sin(2θ) / g
  const sinArg = Math.min(1, (cfg.range * G) / (v0 * v0));
  const theta = Math.asin(sinArg) / 2; // launch angle in rad
  
  let x = 0, y = 0;
  let vx = v0 * Math.cos(theta);
  let vy = v0 * Math.sin(theta);
  let t = 0;
  const dt = 2; // time step in seconds

  // Boost phase (simplified — from launch to burnout)
  const boostPoints = Math.floor(cfg.burnTime / dt);
  for (let i = 0; i < boostPoints; i++) {
    // Thrust acceleration during boost
    const thrustAcc = (cfg.thrustKN * 1000) / (cfg.mass * 1000) / 1000; // km/s²
    vx += thrustAcc * Math.cos(theta) * dt * 0.4;
    vy += (thrustAcc * Math.sin(theta) - G) * dt;
    x += vx * dt;
    y = Math.max(0, y + vy * dt);
    t += dt;
    points.push({ t, x, y, vx, vy, phase: "boost" });
    if (y >= targetApogee * 0.6) break;
  }

  // Midcourse & reentry — ballistic arc
  let maxAlt = 0;
  let reentry = false;
  for (let i = 0; i < 10000; i++) {
    const rho = atmosphericDensity(y);
    const v = Math.sqrt(vx * vx + vy * vy);
    const dragAcc = 0.5 * rho * Cd * A * v * v / (cfg.mass / 1e6);
    const dragX = dragAcc * (vx / v);
    const dragY = dragAcc * (vy / v);

    vx -= dragX * dt * 0.001;
    vy -= (G + dragY * 0.001) * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;

    if (y > maxAlt) maxAlt = y;
    if (y <= 0) { y = 0; break; }

    const phase: TrajectoryPoint["phase"] = y < maxAlt * 0.3 && vy < 0 ? "reentry" : "midcourse";
    if (phase === "reentry") reentry = true;

    points.push({ t, x, y, vx, vy, phase: reentry ? "reentry" : "midcourse" });

    if (i % 5 === 0 && points.length > 300) {
      // Thin out points at midcourse for performance
      points.splice(points.length - 2, 1);
    }
  }

  return points;
}

export interface MilpSite {
  id: number;
  name: string;
  lat: number;
  lng: number;
  score: number;     // composite score 0–100
  capacity: number;  // interceptors
  cost: number;      // M USD
  tier: 1 | 2 | 3;
  selected?: boolean;
}

export const CANDIDATE_SITES: MilpSite[] = [
  { id: 1, name: "Jodhpur Ridge",       lat: 26.3, lng: 73.0, score: 91, capacity: 24, cost: 320, tier: 1 },
  { id: 2, name: "Bikaner Plateau",     lat: 28.0, lng: 73.3, score: 85, capacity: 18, cost: 280, tier: 1 },
  { id: 3, name: "Amritsar Forward",    lat: 31.6, lng: 74.8, score: 78, capacity: 12, cost: 210, tier: 2 },
  { id: 4, name: "Jaisalmer East",      lat: 26.9, lng: 70.9, score: 72, capacity: 20, cost: 295, tier: 1 },
  { id: 5, name: "Pathankot Escarpment",lat: 32.3, lng: 75.6, score: 88, capacity: 16, cost: 260, tier: 2 },
  { id: 6, name: "Jammu Heights",       lat: 32.7, lng: 74.9, score: 80, capacity: 14, cost: 240, tier: 2 },
  { id: 7, name: "Barmer Desert",       lat: 25.7, lng: 71.4, score: 65, capacity: 22, cost: 310, tier: 1 },
  { id: 8, name: "Suratgarh Plains",    lat: 29.3, lng: 73.9, score: 70, capacity: 10, cost: 190, tier: 3 },
  { id: 9, name: "Ganganagar Forward",  lat: 29.9, lng: 73.9, score: 68, capacity: 8,  cost: 175, tier: 3 },
  { id: 10, name: "Ferozpur Salient",   lat: 30.9, lng: 74.6, score: 75, capacity: 12, cost: 220, tier: 2 },
];

export interface MilpResult {
  selectedSites: MilpSite[];
  totalCost: number;
  totalCapacity: number;
  coverageScore: number;
  iterations: number;
}

export function runMilpSolver(budget: number, minCapacity: number, requiredTiers: number[]): MilpResult {
  // Greedy MILP approximation — maximize coverage score under budget
  const sites = [...CANDIDATE_SITES].map(s => ({ ...s, selected: false }));
  
  let totalCost = 0;
  let totalCapacity = 0;
  let coverageScore = 0;
  let iterations = 0;

  // Sort by score/cost ratio (bang-per-buck)
  const sorted = sites.sort((a, b) => (b.score / b.cost) - (a.score / a.cost));

  for (const site of sorted) {
    iterations++;
    const tierRequired = requiredTiers.length === 0 || requiredTiers.includes(site.tier);
    if (tierRequired && totalCost + site.cost <= budget && totalCapacity < minCapacity * 2) {
      site.selected = true;
      totalCost += site.cost;
      totalCapacity += site.capacity;
      coverageScore += site.score;
    }
  }

  return {
    selectedSites: sites.filter(s => s.selected),
    totalCost,
    totalCapacity,
    coverageScore: Math.min(100, coverageScore / sites.length),
    iterations,
  };
}
