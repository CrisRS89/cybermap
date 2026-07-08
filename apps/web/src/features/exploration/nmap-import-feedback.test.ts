import { describe, expect, it } from "vitest";

import { getNmapImportNotice } from "./nmap-import-feedback";

describe("nmap-import-feedback", () => {
  it("returns a notice when hosts were seen but no open ports were detected", () => {
    const notice = getNmapImportNotice({
      assetsCreated: 1,
      assetsSkipped: 0,
      servicesCreated: 0,
      servicesSkipped: 0,
      hostsSeen: 1,
      openPortsSeen: 0,
      warnings: [],
    });

    expect(notice).toBe(
      "El XML fue importado correctamente, pero Nmap no detectó puertos abiertos. Por eso no se crearon servicios."
    );
  });

  it("returns null when the import created services or had no hosts", () => {
    expect(
      getNmapImportNotice({
        assetsCreated: 0,
        assetsSkipped: 1,
        servicesCreated: 1,
        servicesSkipped: 0,
        hostsSeen: 1,
        openPortsSeen: 1,
        warnings: [],
      })
    ).toBeNull();

    expect(
      getNmapImportNotice({
        assetsCreated: 0,
        assetsSkipped: 0,
        servicesCreated: 0,
        servicesSkipped: 0,
        hostsSeen: 0,
        openPortsSeen: 0,
        warnings: [],
      })
    ).toBeNull();
  });
});
