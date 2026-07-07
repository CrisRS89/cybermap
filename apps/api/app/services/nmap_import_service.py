from dataclasses import dataclass, field
from typing import Protocol

from app.schemas.exploration import (
    AssetCreate,
    AssetCriticality,
    AssetEnvironment,
    AssetKind,
    ExplorationServiceCreate,
    ServiceProtocol,
    ServiceSource,
)
from app.services.nmap_parser import NmapParseError, ParsedNmapHost, parse_nmap_xml


class AssetRepository(Protocol):
    """Puerto mínimo requerido para persistir datos desde importadores."""

    def create_asset(self, payload: AssetCreate):
        """Crea un asset y devuelve la entidad persistida."""

    def find_asset_by_kind_and_value(
        self,
        kind: AssetKind,
        value: str,
    ):
        """Devuelve un asset existente por kind + value o None."""

    def create_service(self, payload: ExplorationServiceCreate):
        """Crea un servicio detectado y devuelve la entidad persistida."""

    def find_service_by_asset_protocol_port(
        self,
        asset_id: str,
        protocol: ServiceProtocol,
        port: int,
    ):
        """Devuelve un servicio existente por asset + protocolo + puerto o None."""


@dataclass(frozen=True)
class NmapImportSummary:
    """Resumen observable de una importación Nmap XML."""

    assets_created: int
    assets_skipped: int
    services_created: int
    services_skipped: int
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
        assets_skipped = 0
        services_created = 0
        services_skipped = 0

        for host in parsed_result.hosts:
            asset_payload = _host_to_asset_create(host)
            asset = self._asset_repository.find_asset_by_kind_and_value(
                asset_payload.kind,
                asset_payload.value,
            )

            if asset is not None:
                assets_skipped += 1
            else:
                asset = self._asset_repository.create_asset(asset_payload)
                assets_created += 1

            for open_port in host.open_ports:
                service_payload = _port_to_service_create(
                    asset_id=asset.id,
                    protocol=open_port.protocol,
                    port=open_port.port,
                    service_name=open_port.service,
                    product=open_port.product,
                    version=open_port.version,
                )

                existing_service = (
                    self._asset_repository.find_service_by_asset_protocol_port(
                        service_payload.assetId,
                        service_payload.protocol,
                        service_payload.port,
                    )
                )

                if existing_service is not None:
                    services_skipped += 1
                    continue

                self._asset_repository.create_service(service_payload)
                services_created += 1

        return NmapImportSummary(
            assets_created=assets_created,
            assets_skipped=assets_skipped,
            services_created=services_created,
            services_skipped=services_skipped,
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


def _port_to_service_create(
    asset_id: str,
    protocol: str,
    port: int,
    service_name: str | None,
    product: str | None,
    version: str | None,
) -> ExplorationServiceCreate:
    """Convierte un puerto abierto Nmap en ExplorationServiceCreate.

    Decisión:
    - solo se persisten puertos abiertos porque el parser ya filtró por state=open;
    - `product` y `version` se propagan si Nmap los informó;
    - protocolos no soportados por el schema son rechazados explícitamente.
    """

    try:
        parsed_protocol = ServiceProtocol(protocol)
    except ValueError as error:
        raise NmapParseError(f"Unsupported service protocol: {protocol}") from error

    return ExplorationServiceCreate(
        assetId=asset_id,
        protocol=parsed_protocol,
        port=port,
        name=service_name,
        product=product,
        version=version,
        source=ServiceSource.NMAP,
    )
