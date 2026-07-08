import type { ImportNmapXmlSummary } from "./exploration-imports-api";

export function getNmapImportNotice(summary: ImportNmapXmlSummary | null): string | null {
  if (!summary) {
    return null;
  }

  if (summary.hostsSeen > 0 && summary.openPortsSeen === 0) {
    return "El XML fue importado correctamente, pero Nmap no detectó puertos abiertos. Por eso no se crearon servicios.";
  }

  return null;
}
