/**
 * Combined Protection Probability Calculation:
 * 
 * Formula:
 * P_combined(target) = 1 - ∏_{s ∈ SelectedSites} (1 - p_{s, target})
 * 
 * This represents the synthetic complementary probability that at least
 * one of the active candidate defense sites covers the incoming trajectory.
 */

export function calculateCombinedProtection(
  targetId: string,
  selectedSiteIds: string[],
  probabilityMatrix: Record<string, Record<string, number>>
): { combinedProtection: number; supportingSites: string[]; individualProbabilities: Record<string, number> } {
  if (selectedSiteIds.length === 0) {
    return {
      combinedProtection: 0,
      supportingSites: [],
      individualProbabilities: {}
    };
  }

  let productUnprotected = 1.0;
  const supportingSites: string[] = [];
  const individualProbabilities: Record<string, number> = {};

  for (const siteId of selectedSiteIds) {
    const prob = probabilityMatrix[siteId]?.[targetId] ?? 0;
    individualProbabilities[siteId] = prob;

    if (prob > 0.01) {
      productUnprotected *= (1 - prob);
      if (prob >= 0.15) {
        supportingSites.push(siteId);
      }
    }
  }

  const combinedProtection = Math.max(0, Math.min(1.0, 1.0 - productUnprotected));

  return {
    combinedProtection: Math.round(combinedProtection * 1000) / 1000,
    supportingSites,
    individualProbabilities
  };
}
