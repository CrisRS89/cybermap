export const MAX_NMAP_XML_FILE_BYTES = 1024 * 1024 * 5;

const ACCEPTED_NMAP_XML_MIME_TYPES = new Set(["application/xml", "text/xml"]);

export function isAcceptedNmapXmlFile(
  file: Pick<File, "name" | "size" | "type">
): boolean {
  const fileName = file.name.toLowerCase();
  const hasXmlExtension = fileName.endsWith(".xml");
  const hasAcceptedMimeType = ACCEPTED_NMAP_XML_MIME_TYPES.has(
    file.type.toLowerCase()
  );

  return hasXmlExtension || hasAcceptedMimeType;
}

export function validateNmapXmlFile(
  file: Pick<File, "name" | "size" | "type">
): string | null {
  if (!isAcceptedNmapXmlFile(file)) {
    return "Seleccioná un archivo .xml generado por Nmap.";
  }

  if (file.size === 0) {
    return "El archivo XML está vacío.";
  }

  if (file.size > MAX_NMAP_XML_FILE_BYTES) {
    return "El XML supera el tamaño máximo permitido.";
  }

  return null;
}
