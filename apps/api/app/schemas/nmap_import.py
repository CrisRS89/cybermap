from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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
    assetsSkipped: int
    servicesCreated: int
    servicesSkipped: int
    hostsSeen: int
    openPortsSeen: int
    warnings: list[str]


class NmapImportResponse(BaseModel):
    """Response HTTP completa para POST /exploration/imports/nmap."""

    model_config = ConfigDict(extra="forbid")

    summary: NmapImportSummaryResponse


class NmapScanRequest(BaseModel):
    """Solicitud para ejecutar un escaneo Nmap dentro del alcance autorizado."""

    model_config = ConfigDict(extra="forbid")

    target: str = Field(min_length=1, max_length=45)
    profile: Literal["standard", "fast"] = "standard"
    ports: str | None = Field(default=None, max_length=256)
    authorized: Literal[True]


class NmapScanResponse(BaseModel):
    """Resultado del escaneo e importación automática."""

    model_config = ConfigDict(extra="forbid")

    target: str
    summary: NmapImportSummaryResponse
