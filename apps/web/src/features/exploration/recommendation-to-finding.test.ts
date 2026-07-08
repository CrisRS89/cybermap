import { describe, expect, it } from "vitest";

import { mapRecommendationSeverityToFinding } from "./recommendation-to-finding";

describe("recommendation-to-finding", () => {
  it("maps known severities correctly", () => {
    expect(mapRecommendationSeverityToFinding("critical")).toBe("critical");
    expect(mapRecommendationSeverityToFinding("high")).toBe("high");
    expect(mapRecommendationSeverityToFinding("medium")).toBe("medium");
    expect(mapRecommendationSeverityToFinding("low")).toBe("low");
  });

  it("defaults to medium for unknown severities", () => {
    expect(mapRecommendationSeverityToFinding("unknown")).toBe("medium");
    expect(mapRecommendationSeverityToFinding("")).toBe("medium");
    expect(mapRecommendationSeverityToFinding("extreme")).toBe("medium");
  });
});
