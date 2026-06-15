import { describe, expect, it } from "vitest";
import { SETTINGS_SECTION_SCHEMAS } from "./settings-schema";
import { settingsNavigationItems } from "./settings-navigation";

describe("settings navigation", () => {
  it("derives navigation ids from section schema order", () => {
    expect(settingsNavigationItems.map((item) => item.id)).toEqual(
      SETTINGS_SECTION_SCHEMAS.map((section) => section.id)
    );
  });

  it("keeps navigation labels derived from section eyebrows", () => {
    expect(settingsNavigationItems.map((item) => item.label)).toEqual(
      SETTINGS_SECTION_SCHEMAS.map((section) => section.eyebrow)
    );
  });

  it("defines a short description for every navigation item", () => {
    for (const item of settingsNavigationItems) {
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});
