import { describe, expect, it } from "vitest";

import {
  MAX_NMAP_XML_FILE_BYTES,
  isAcceptedNmapXmlFile,
  validateNmapXmlFile,
} from "./nmap-file";

describe("nmap-file", () => {
  it("accepts xml files by extension and content type", () => {
    const xmlFile = {
      name: "scan-real.xml",
      size: 512,
      type: "application/xml",
    } as Pick<File, "name" | "size" | "type">;

    expect(isAcceptedNmapXmlFile(xmlFile)).toBe(true);
    expect(validateNmapXmlFile(xmlFile)).toBeNull();
  });

  it("rejects unsupported extensions and content types", () => {
    const txtFile = {
      name: "scan.txt",
      size: 512,
      type: "text/plain",
    } as Pick<File, "name" | "size" | "type">;

    expect(isAcceptedNmapXmlFile(txtFile)).toBe(false);
    expect(validateNmapXmlFile(txtFile)).toBe(
      "Seleccioná un archivo .xml generado por Nmap."
    );
  });

  it("rejects files that exceed the maximum allowed size", () => {
    const oversizedFile = {
      name: "scan.xml",
      size: MAX_NMAP_XML_FILE_BYTES + 1,
      type: "application/xml",
    } as Pick<File, "name" | "size" | "type">;

    expect(validateNmapXmlFile(oversizedFile)).toBe(
      "El XML supera el tamaño máximo permitido."
    );
  });
});
