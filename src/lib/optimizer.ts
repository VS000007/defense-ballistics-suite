import { calculateCombinedProtection } from './probability';
import type {
  OptimizationResult,
  ScenarioDefinition,
  SimulationParams,
  TargetProtectionResult,
} from './types';

/**
 * Synthetic Optimization Engine:
 * 
 * Step 1: Calculate synthetic score for each site:
 *   siteScore = totalSyntheticCoverage + qualityScore + marginalContribution - costPenalty
 * 
 * Step 2: Sort candidate sites by (score / cost) ratio (efficiency heuristic).
 * 
 * Step 3: Select top sites subject to:
 *   - Total cost <= Budget
 *   - Total sites <= Max Sites limit
 * 
 * Step 4: Evaluate combined multi-site protection probability for each target:
 *   P_i = 1 - ∏ (1 - p_ij)
 */

export function runOptimization(
  scenario: ScenarioDefinition,
  params: SimulationParams
): OptimizationResult {
  const { sites, trajectories, probabilityMatrix } = scenario;
  const { budget, maxSites, minProtectionThreshold } = params;

  const siteScores: Record<string, number> = {};
  const siteScorePerCost: Record<string, number> = {};

  // 1. Calculate score for each candidate site
  for (const site of sites) {
    // Total synthetic coverage over all scenario trajectories
    let totalSyntheticCoverage = 0;
    for (const traj of trajectories) {
      totalSyntheticCoverage += probabilityMatrix[site.id]?.[traj.id] ?? 0;
    }

    // Quality bonus from site topography (0.45 - 0.95 -> 1.0 - 2.5)
    const qualityScore = site.qualityScore * 2.5;

    // Marginal contribution factor based on abstract interceptor capacity
    const marginalContribution = (site.capacity / 5.0) * 1.8;

    // Cost penalty to penalize expensive installations
    const costPenalty = site.cost * 0.15;

    const rawScore = totalSyntheticCoverage + qualityScore + marginalContribution - costPenalty;
    const siteScore = Math.max(0.1, Math.round(rawScore * 100) / 100);

    siteScores[site.id] = siteScore;
    siteScorePerCost[site.id] = Math.round((siteScore / site.cost) * 100) / 100;
  }

  // 2. Sort candidate sites descending by score-per-cost efficiency
  const candidateList = [...sites].sort((a, b) => {
    const effA = siteScorePerCost[a.id] ?? 0;
    const effB = siteScorePerCost[b.id] ?? 0;
    return effB - effA;
  });

  // 3. Select sites respecting budget and max site constraints
  const selectedSiteIds: string[] = [];
  let totalCost = 0;

  for (const site of candidateList) {
    if (selectedSiteIds.length >= maxSites) {
      break;
    }

    if (totalCost + site.cost <= budget) {
      selectedSiteIds.push(site.id);
      totalCost += site.cost;
    }
  }

  // 4. Calculate protection probability for each target vector
  const targetResults: TargetProtectionResult[] = trajectories.map((traj) => {
    const { combinedProtection, supportingSites, individualProbabilities } =
      calculateCombinedProtection(traj.id, selectedSiteIds, probabilityMatrix);

    const isProtected = combinedProtection >= minProtectionThreshold;

    return {
      targetId: traj.id,
      targetName: traj.name,
      combinedProtection,
      supportingSites,
      isProtected,
      individualProbabilities,
    };
  });

  // 5. Aggregate summary metrics
  const protections = targetResults.map((r) => r.combinedProtection);
  const avgProtection =
    protections.length > 0
      ? Math.round((protections.reduce((a, b) => a + b, 0) / protections.length) * 1000) / 1000
      : 0;
  const minProtection = protections.length > 0 ? Math.min(...protections) : 0;
  const maxProtection = protections.length > 0 ? Math.max(...protections) : 0;
  const targetsBelowThresholdCount = targetResults.filter((r) => !r.isProtected).length;
  const protectedTargetsCount = targetResults.filter((r) => r.isProtected).length;

  return {
    selectedSiteIds,
    totalCost,
    budgetUsedPercentage: budget > 0 ? Math.round((totalCost / budget) * 100) : 0,
    siteScores,
    siteScorePerCost,
    targetResults,
    averageProtection: avgProtection,
    minProtection,
    maxProtection,
    targetsBelowThresholdCount,
    protectedTargetsCount,
    totalTargetsCount: trajectories.length,
    timestamp: Date.now(),
  };
}
