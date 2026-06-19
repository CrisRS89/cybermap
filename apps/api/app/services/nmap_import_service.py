from dataclasses import dataclass, field
from typing import Protocol

from app.schemas.exploration import (
    AssetCreate,
    AssetCriticality,
    AssetEnvironment,
    AssetKind,
)
from app.services.nmap_parser import NmapParseError, ParsedNmapHost, parse_nmap_xml


class AssetRepository(Protocol):
    """Puerto mínimo requerido para persistir assets desde importadores."""

    def create_asset(self, payload: AssetCreate):
        """Crea un asset y devuelve la entidad persistida."""


@dataclass(frozen=True)
class NmapImportSummary:
    """Resumen observable de una importación Nmap XML."""

    assets_created: int
    hosts_seen: int
    open_ports_seen: int
    warnings: list[str] = field(default_factory=list)


class NmapImportService:
    """Servicio de aplicación para importar Nmap XML hacia Exploration.

    Propósito:
    - coordinar parser Nmap XML
    - convertir hosts en assets
    - persistir assets mediante un repositorio inyectado

    No hace:
    - ejecución de nmap
    - lectura de rutas locales
    - descarga de URLs
    - creación automática de findings
    """

    def __init__(self, asset_repository: AssetRepository) -> None:
        self._asset_repository = asset_repository

    def import_xml(self, xml_content: str) -> NmapImportSummary:
        """Importa XML Nmap y crea assets IP.

        Raises:
            NmapParseError: si el XML es inválido, inseguro o malformado.
        """

        parsed_result = parse_nmap_xml(xml_content)

        assets_created = 0

        for host in parsed_result.hosts:
            asset_payload = _host_to_asset_create(host)
            self._asset_repository.create_asset(asset_payload)
            assets_created += 1

        return NmapImportSummary(
            assets_created=assets_created,
            hosts_seen=parsed_result.hosts_seen,
            open_ports_seen=parsed_result.open_ports_seen,
            warnings=parsed_result.warnings,
        )


def _host_to_asset_create(host: ParsedNmapHost) -> AssetCreate:
    """Convierte un host Nmap normalizado en AssetCreate.

    Decisión MVP:
    - `kind=ip` porque el valor principal viene de `<address addr="...">`.
    - `name` usa el primer hostname si existe.
    - si no hay hostname, `name` cae a la dirección IP.
    """

    display_name = host.hostnames[0] if host.hostnames else host.address

    return AssetCreate(
        name=display_name,
        kind=AssetKind.IP,
        value=host.address,
        environment=AssetEnvironment.UNKNOWN,
        criticality=AssetCriticality.MEDIUM,
    )
