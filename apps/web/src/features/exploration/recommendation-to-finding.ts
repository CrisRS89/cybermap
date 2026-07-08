import type { FindingSeverity } from "./exploration-types";

const VALID_FINDING_SEVERITIES = new Set<string>(["critical", "high", "medium", "low"]);

export function mapRecommendationSeverityToFinding(
  recommendationSeverity: string
): FindingSeverity {
  if (VALID_FINDING_SEVERITIES.has(recommendationSeverity.toLowerCase())) {
    return recommendationSeverity.toLowerCase() as FindingSeverity;
  }

  return "medium";
}
