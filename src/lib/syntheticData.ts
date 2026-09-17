import type { CandidateSiteData, ScenarioDefinition, SyntheticTrajectoryData } from './types';

// ============================================================================
// 10 FICTIONAL CANDIDATE SITES (100 x 100 km Synthetic Grid)
// All coordinates, scores, and costs are purely academic and fictional.
// ============================================================================
export const BASE_CANDIDATE_SITES: CandidateSiteData[] = [
  {
    id: 'S01',
    name: 'Sector 1-A (North Ridge)',
    x: -32,
    y: 36,
    elevation: 2.1,
    cost: 5,
    capacity: 3,
    qualityScore: 0.88,
    description: 'Elevated plateau with high line-of-sight across northern ingress vectors.'
  },
  {
    id: 'S02',
    name: 'Sector 2-B (North-East Foothill)',
    x: 28,
    y: 38,
    elevation: 1.8,
    cost: 4,
    capacity: 2,
    qualityScore: 0.82,
    description: 'Northeastern rim providing layered coverage over eastern ingress.'
  },
  {
    id: 'S03',
    name: 'Sector 3-C (Central Mesa)',
    x: 0,
    y: 5,
    elevation: 3.2,
    cost: 8,
    capacity: 5,
    qualityScore: 0.94,
    description: 'High-capacity central hub with omni-directional synthetic coverage.'
  },
  {
    id: 'S04',
    name: 'Sector 4-D (West Basin)',
    x: -38,
    y: -5,
    elevation: 0.9,
    cost: 3,
    capacity: 2,
    qualityScore: 0.65,
    description: 'Low-cost western outpost with quick deployment logistics.'
  },
  {
    id: 'S05',
    name: 'Sector 5-E (East Highland)',
    x: 35,
    y: -8,
    elevation: 2.4,
    cost: 6,
    capacity: 4,
    qualityScore: 0.79,
    description: 'Eastern synthetic flank barrier with strong sensor overlap.'
  },
  {
    id: 'S06',
    name: 'Sector 6-F (South-West Pass)',
    x: -25,
    y: -35,
    elevation: 1.5,
    cost: 4,
    capacity: 3,
    qualityScore: 0.72,
    description: 'Guards southwestern trajectory corridor and low-altitude ingress.'
  },
  {
    id: 'S07',
    name: 'Sector 7-G (South Plain)',
    x: 8,
    y: -38,
    elevation: 0.8,
    cost: 2,
    capacity: 2,
    qualityScore: 0.58,
    description: 'Budget-friendly southern plains node for complementary point defense.'
  },
  {
    id: 'S08',
    name: 'Sector 8-H (South-East Bluffs)',
    x: 32,
    y: -32,
    elevation: 2.0,
    cost: 5,
    capacity: 3,
    qualityScore: 0.75,
    description: 'South-east promontory covering terminal dive vectors.'
  },
  {
    id: 'S09',
    name: 'Sector 9-I (North-West Gap)',
    x: -18,
    y: 22,
    elevation: 1.6,
    cost: 3,
    capacity: 2,
    qualityScore: 0.71,
    description: 'Intermediate node covering the transition between north and central grid.'
  },
  {
    id: 'S10',
    name: 'Sector 10-J (Apex Redoubt)',
    x: -5,
    y: -15,
    elevation: 2.8,
    cost: 7,
    capacity: 4,
    qualityScore: 0.91,
    description: 'Heavy tactical installation protecting core inner defense perimeter.'
  }
];

// Helper to compute synthetic probability based on Euclidean distance & site quality
function computeSyntheticProb(site: CandidateSiteData, targetX: number, targetY: number, baseBoost = 0): number {
  const dx = site.x - targetX;
  const dy = site.y - targetY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Synthetic spatial decay curve
  const maxRange = 55; // 55 km synthetic range
  if (dist > maxRange) return 0.05;
  
  const distanceFactor = Math.max(0, 1 - dist / maxRange);
  const rawProb = (distanceFactor * 0.75 + site.qualityScore * 0.25 + baseBoost);
  
  // Clamp between 0.10 and 0.92
  const clamped = Math.min(0.92, Math.max(0.10, Math.round(rawProb * 100) / 100));
  return clamped;
}

// ============================================================================
// SCENARIO 1: SHORT SYNTHETIC SCENARIO (Terminal / Rapid Ingress)
// ============================================================================
const SHORT_TRAJECTORIES: SyntheticTrajectoryData[] = [
  { id: 'T01', name: 'Vector α-01 (North Ingress)', startX: -40, startY: 48, startZ: 14, peakX: -25, peakY: 25, peakZ: 18, targetX: -10, targetY: 5, targetZ: 0, speedKmS: 2.1, curvature: 1.2 },
  { id: 'T02', name: 'Vector α-02 (NE Fast Dive)', startX: 35, startY: 48, startZ: 12, peakX: 20, peakY: 28, peakZ: 16, targetX: 5, targetY: 8, targetZ: 0, speedKmS: 2.4, curvature: 1.4 },
  { id: 'T03', name: 'Vector α-03 (NW Flank)', startX: -48, startY: 20, startZ: 11, peakX: -30, peakY: 10, peakZ: 15, targetX: -12, targetY: -2, targetZ: 0, speedKmS: 1.9, curvature: 1.1 },
  { id: 'T04', name: 'Vector α-04 (West Corridor)', startX: -46, startY: -15, startZ: 13, peakX: -28, peakY: -8, peakZ: 17, targetX: -6, targetY: -5, targetZ: 0, speedKmS: 2.2, curvature: 1.3 },
  { id: 'T05', name: 'Vector α-05 (SW Direct)', startX: -38, startY: -45, startZ: 15, peakX: -20, peakY: -26, peakZ: 19, targetX: -2, targetY: -10, targetZ: 0, speedKmS: 2.0, curvature: 1.2 },
  { id: 'T06', name: 'Vector α-06 (South Salvo)', startX: 10, startY: -48, startZ: 12, peakX: 6, peakY: -28, peakZ: 16, targetX: 2, targetY: -8, targetZ: 0, speedKmS: 2.3, curvature: 1.5 },
  { id: 'T07', name: 'Vector α-07 (SE High-G)', startX: 42, startY: -38, startZ: 14, peakX: 25, peakY: -20, peakZ: 18, targetX: 8, targetY: -6, targetZ: 0, speedKmS: 2.5, curvature: 1.6 },
  { id: 'T08', name: 'Vector α-08 (East Ingress)', startX: 48, startY: 10, startZ: 13, peakX: 30, peakY: 4, peakZ: 17, targetX: 12, targetY: 0, targetZ: 0, speedKmS: 2.1, curvature: 1.2 },
  { id: 'T09', name: 'Vector α-09 (Central Plunge)', startX: -10, startY: 45, startZ: 16, peakX: -4, peakY: 20, peakZ: 21, targetX: 0, targetY: 0, targetZ: 0, speedKmS: 2.6, curvature: 1.7 },
  { id: 'T10', name: 'Vector α-10 (Perimeter Sweep)', startX: 45, startY: 35, startZ: 14, peakX: 28, peakY: 14, peakZ: 18, targetX: 14, targetY: -4, targetZ: 0, speedKmS: 2.0, curvature: 1.3 }
];

// ============================================================================
// SCENARIO 2: MEDIUM SYNTHETIC SCENARIO (Balanced Multi-Axis Defense)
// ============================================================================
const MEDIUM_TRAJECTORIES: SyntheticTrajectoryData[] = [
  { id: 'T01', name: 'Vector β-01 (Polar Arc)', startX: -30, startY: 49, startZ: 18, peakX: -15, peakY: 20, peakZ: 25, targetX: -5, targetY: 0, targetZ: 0, speedKmS: 1.6, curvature: 1.4 },
  { id: 'T02', name: 'Vector β-02 (Eastern Arc)', startX: 46, startY: 25, startZ: 17, peakX: 22, peakY: 12, peakZ: 24, targetX: 4, targetY: 2, targetZ: 0, speedKmS: 1.7, curvature: 1.3 },
  { id: 'T03', name: 'Vector β-03 (Western Vector)', startX: -49, startY: 5, startZ: 19, peakX: -26, peakY: 2, peakZ: 26, targetX: -8, targetY: -2, targetZ: 0, speedKmS: 1.8, curvature: 1.5 },
  { id: 'T04', name: 'Vector β-04 (SW Compound)', startX: -42, startY: -35, startZ: 20, peakX: -22, peakY: -18, peakZ: 27, targetX: -6, targetY: -8, targetZ: 0, speedKmS: 1.5, curvature: 1.4 },
  { id: 'T05', name: 'Vector β-05 (Southern Meridian)', startX: 0, startY: -49, startZ: 18, peakX: 0, peakY: -22, peakZ: 26, targetX: 0, targetY: -5, targetZ: 0, speedKmS: 1.6, curvature: 1.3 },
  { id: 'T06', name: 'Vector β-06 (SE Coastal Arc)', startX: 40, startY: -40, startZ: 19, peakX: 22, peakY: -20, peakZ: 25, targetX: 6, targetY: -6, targetZ: 0, speedKmS: 1.7, curvature: 1.4 },
  { id: 'T07', name: 'Vector β-07 (NE Stratospheric)', startX: 48, startY: 44, startZ: 21, peakX: 24, peakY: 22, peakZ: 28, targetX: 8, targetY: 6, targetZ: 0, speedKmS: 1.9, curvature: 1.6 },
  { id: 'T08', name: 'Vector β-08 (NW High Trajectory)', startX: -45, startY: 40, startZ: 20, peakX: -24, peakY: 18, peakZ: 27, targetX: -7, targetY: 4, targetZ: 0, speedKmS: 1.8, curvature: 1.5 },
  { id: 'T09', name: 'Vector β-09 (Zenith Center)', startX: 15, startY: 48, startZ: 22, peakX: 8, peakY: 20, peakZ: 30, targetX: 0, targetY: 0, targetZ: 0, speedKmS: 2.0, curvature: 1.8 },
  { id: 'T10', name: 'Vector β-10 (Deep Flank)', startX: -48, startY: -20, startZ: 18, peakX: -26, peakY: -10, peakZ: 24, targetX: -10, targetY: -4, targetZ: 0, speedKmS: 1.6, curvature: 1.3 }
];

// ============================================================================
// SCENARIO 3: LONG SYNTHETIC SCENARIO (Exo-Atmospheric / High Apogee)
// ============================================================================
const LONG_TRAJECTORIES: SyntheticTrajectoryData[] = [
  { id: 'T01', name: 'Vector γ-01 (Exo-Arc North)', startX: -35, startY: 49, startZ: 24, peakX: -18, peakY: 24, peakZ: 36, targetX: -3, targetY: 2, targetZ: 0, speedKmS: 2.8, curvature: 1.8 },
  { id: 'T02', name: 'Vector γ-02 (Exo-Arc North-East)', startX: 42, startY: 48, startZ: 25, peakX: 22, peakY: 25, peakZ: 38, targetX: 6, targetY: 4, targetZ: 0, speedKmS: 2.9, curvature: 1.9 },
  { id: 'T03', name: 'Vector γ-03 (High Orbital East)', startX: 49, startY: 15, startZ: 23, peakX: 26, peakY: 8, peakZ: 35, targetX: 7, targetY: -1, targetZ: 0, speedKmS: 2.7, curvature: 1.7 },
  { id: 'T04', name: 'Vector γ-04 (Sub-Orbital SE)', startX: 45, startY: -42, startZ: 26, peakX: 24, peakY: -22, peakZ: 39, targetX: 5, targetY: -6, targetZ: 0, speedKmS: 3.1, curvature: 2.0 },
  { id: 'T05', name: 'Vector γ-05 (South Polar Apex)', startX: -5, startY: -49, startZ: 24, peakX: -3, peakY: -24, peakZ: 36, targetX: -1, targetY: -4, targetZ: 0, speedKmS: 2.8, curvature: 1.8 },
  { id: 'T06', name: 'Vector γ-06 (SW Hypersonic Arc)', startX: -46, startY: -40, startZ: 27, peakX: -24, peakY: -20, peakZ: 40, targetX: -6, targetY: -5, targetZ: 0, speedKmS: 3.2, curvature: 2.1 },
  { id: 'T07', name: 'Vector γ-07 (West High Apogee)', startX: -49, startY: -5, startZ: 25, peakX: -26, peakY: -2, peakZ: 37, targetX: -8, targetY: 0, targetZ: 0, speedKmS: 2.9, curvature: 1.8 },
  { id: 'T08', name: 'Vector γ-08 (NW High Apogee)', startX: -46, startY: 38, startZ: 24, peakX: -23, peakY: 20, peakZ: 36, targetX: -5, targetY: 5, targetZ: 0, speedKmS: 2.7, curvature: 1.7 },
  { id: 'T09', name: 'Vector γ-09 (Zenith Penetrator)', startX: 5, startY: 49, startZ: 28, peakX: 3, peakY: 22, peakZ: 42, targetX: 0, targetY: 0, targetZ: 0, speedKmS: 3.4, curvature: 2.3 },
  { id: 'T10', name: 'Vector γ-10 (Perimeter Loop)', startX: 38, startY: -25, startZ: 23, peakX: 20, peakY: -12, peakZ: 34, targetX: 4, targetY: -3, targetZ: 0, speedKmS: 2.6, curvature: 1.6 }
];

function buildProbabilityMatrix(sites: CandidateSiteData[], trajectories: SyntheticTrajectoryData[]): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  
  for (const site of sites) {
    matrix[site.id] = {};
    for (const traj of trajectories) {
      // Evaluate intercept point along midcourse (weighted between peak and target)
      const midX = (traj.peakX * 0.6 + traj.targetX * 0.4);
      const midY = (traj.peakY * 0.6 + traj.targetY * 0.4);
      matrix[site.id][traj.id] = computeSyntheticProb(site, midX, midY);
    }
  }
  
  return matrix;
}

export const SYNTHETIC_SCENARIOS: Record<'short' | 'medium' | 'long', ScenarioDefinition> = {
  short: {
    id: 'short',
    name: 'Short Synthetic Scenario',
    description: 'Low-altitude terminal threats with rapid ingress and localized coverage requirements.',
    sites: BASE_CANDIDATE_SITES,
    trajectories: SHORT_TRAJECTORIES,
    probabilityMatrix: buildProbabilityMatrix(BASE_CANDIDATE_SITES, SHORT_TRAJECTORIES)
  },
  medium: {
    id: 'medium',
    name: 'Medium Synthetic Scenario',
    description: 'Balanced multi-axis regional trajectory corridors across the synthetic 100 × 100 km grid.',
    sites: BASE_CANDIDATE_SITES,
    trajectories: MEDIUM_TRAJECTORIES,
    probabilityMatrix: buildProbabilityMatrix(BASE_CANDIDATE_SITES, MEDIUM_TRAJECTORIES)
  },
  long: {
    id: 'long',
    name: 'Long Synthetic Scenario',
    description: 'Exo-atmospheric high-apogee arcs requiring wide synthetic sensor coordination.',
    sites: BASE_CANDIDATE_SITES,
    trajectories: LONG_TRAJECTORIES,
    probabilityMatrix: buildProbabilityMatrix(BASE_CANDIDATE_SITES, LONG_TRAJECTORIES)
  }
};
