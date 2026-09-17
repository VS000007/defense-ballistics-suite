export type ScenarioId = 'short' | 'medium' | 'long';

export interface CandidateSiteData {
  id: string; // e.g. "S01"
  name: string; // e.g. "Site Alpha-1"
  x: number; // Synthetic X: -45 to +45 km
  y: number; // Synthetic Y: -45 to +45 km
  elevation: number; // Synthetic base altitude
  cost: number; // Normalized cost 1-10 units
  capacity: number; // Max interceptor / radar capacity (1-5)
  qualityScore: number; // Topographic quality score (0.45 - 0.95)
  description: string;
}

export interface SyntheticTrajectoryData {
  id: string; // e.g. "T01"
  name: string; // e.g. "Vector Alpha"
  startX: number;
  startY: number;
  startZ: number;
  peakX: number;
  peakY: number;
  peakZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  speedKmS: number;
  curvature: number;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  sites: CandidateSiteData[];
  trajectories: SyntheticTrajectoryData[];
  probabilityMatrix: Record<string, Record<string, number>>; // [siteId][trajectoryId] => 0.0 - 0.95
}

export interface SimulationParams {
  scenarioId: ScenarioId;
  budget: number; // 5 to 30 normalized cost units
  maxSites: number; // 1 to 5
  minProtectionThreshold: number; // 0.40 to 0.95
}

export interface TargetProtectionResult {
  targetId: string;
  targetName: string;
  combinedProtection: number; // 0.0 to 1.0
  supportingSites: string[]; // List of site IDs providing > 0.05 prob
  isProtected: boolean; // combinedProtection >= threshold
  individualProbabilities: Record<string, number>;
}

export interface OptimizationResult {
  selectedSiteIds: string[];
  totalCost: number;
  budgetUsedPercentage: number;
  siteScores: Record<string, number>;
  siteScorePerCost: Record<string, number>;
  targetResults: TargetProtectionResult[];
  averageProtection: number;
  minProtection: number;
  maxProtection: number;
  targetsBelowThresholdCount: number;
  protectedTargetsCount: number;
  totalTargetsCount: number;
  timestamp: number;
}
