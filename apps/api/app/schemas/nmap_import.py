from pydantic import BaseModel, ConfigDict


class NmapImportRequest(BaseModel):
    """Request HTTP para importar XML de Nmap.

    Decisión:
    - No se usa min_length=1 para permitir que el parser detecte XML vacío
      y devuelva un error HTTP 400 controlado, en lugar de 422 de Pydantic.
    - Se prohíben campos extra para mantener contrato estricto.
    """

    model_config = ConfigDict(extra="forbid")

    xml: str


class NmapImportSummaryResponse(BaseModel):
    """Resumen HTTP de la importación Nmap en camelCase."""

    model_config = ConfigDict(extra="forbid")

    assetsCreated: int
    hostsSeen: int
    openPortsSeen: int
    warnings: list[str]


class NmapImportResponse(BaseModel):
    """Response HTTP completa para POST /exploration/imports/nmap."""

    model_config = ConfigDict(extra="forbid")

    summary: NmapImportSummaryResponse
