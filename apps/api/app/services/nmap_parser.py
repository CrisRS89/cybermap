from dataclasses import dataclass, field
import xml.etree.ElementTree as ET


MAX_NMAP_XML_BYTES = 1024 * 1024


class NmapParseError(ValueError):
    """Error controlado de parseo Nmap XML."""


@dataclass(frozen=True)
class ParsedNmapPort:
    """Puerto abierto detectado en un host Nmap."""

    port: int
    protocol: str
    service: str | None = None


@dataclass(frozen=True)
class ParsedNmapHost:
    """Host normalizado desde Nmap XML."""

    address: str
    hostnames: list[str] = field(default_factory=list)
    open_ports: list[ParsedNmapPort] = field(default_factory=list)


@dataclass(frozen=True)
class ParsedNmapResult:
    """Resultado normalizado del parser Nmap XML."""

    hosts: list[ParsedNmapHost]
    warnings: list[str] = field(default_factory=list)

    @property
    def hosts_seen(self) -> int:
        return len(self.hosts)

    @property
    def open_ports_seen(self) -> int:
        return sum(len(host.open_ports) for host in self.hosts)


def parse_nmap_xml(xml_content: str) -> ParsedNmapResult:
    """Parsea XML de Nmap de forma defensiva.

    Proposito:
    - aceptar XML Nmap como string
    - extraer hosts, hostnames y puertos abiertos
    - rechazar payloads inseguros o malformados

    Seguridad:
    - no se resuelven rutas ni URLs
    - se rechaza DTD antes de parsear
    - se rechazan entidades antes de parsear
    - se limita el tamano del payload
    """

    _validate_xml_payload(xml_content)

    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as error:
        raise NmapParseError("Malformed Nmap XML") from error

    if _strip_namespace(root.tag) != "nmaprun":
        raise NmapParseError("Expected nmaprun root element")

    hosts: list[ParsedNmapHost] = []
    warnings: list[str] = []

    for host_element in _children_named(root, "host"):
        parsed_host = _parse_host(host_element)

        if parsed_host is None:
            warnings.append("Skipped host without address")
            continue

        hosts.append(parsed_host)

    return ParsedNmapResult(hosts=hosts, warnings=warnings)


def _validate_xml_payload(xml_content: str) -> None:
    if not xml_content.strip():
        raise NmapParseError("Nmap XML payload is empty")

    size = len(xml_content.encode("utf-8"))

    if size > MAX_NMAP_XML_BYTES:
        raise NmapParseError("Nmap XML payload exceeds maximum size")

    lowered = xml_content.lower()

    if "<!doctype" in lowered:
        raise NmapParseError("Nmap XML with DTD is not allowed")

    if "<!entity" in lowered:
        raise NmapParseError("Nmap XML with entities is not allowed")


def _parse_host(host_element: ET.Element) -> ParsedNmapHost | None:
    address = _extract_primary_address(host_element)

    if address is None:
        return None

    return ParsedNmapHost(
        address=address,
        hostnames=_extract_hostnames(host_element),
        open_ports=_extract_open_ports(host_element),
    )


def _extract_primary_address(host_element: ET.Element) -> str | None:
    for address_element in _children_named(host_element, "address"):
        address = address_element.attrib.get("addr")

        if address:
            return address

    return None


def _extract_hostnames(host_element: ET.Element) -> list[str]:
    hostnames: list[str] = []

    for hostnames_element in _children_named(host_element, "hostnames"):
        for hostname_element in _children_named(hostnames_element, "hostname"):
            hostname = hostname_element.attrib.get("name")

            if hostname:
                hostnames.append(hostname)

    return hostnames


def _extract_open_ports(host_element: ET.Element) -> list[ParsedNmapPort]:
    ports: list[ParsedNmapPort] = []

    for ports_element in _children_named(host_element, "ports"):
        for port_element in _children_named(ports_element, "port"):
            state_element = _first_child_named(port_element, "state")
            state = state_element.attrib.get("state") if state_element is not None else None

            if state != "open":
                continue

            port_id = port_element.attrib.get("portid")
            protocol = port_element.attrib.get("protocol")

            if port_id is None or protocol is None:
                continue

            try:
                port_number = int(port_id)
            except ValueError:
                continue

            service_element = _first_child_named(port_element, "service")
            service_name = (
                service_element.attrib.get("name")
                if service_element is not None
                else None
            )

            ports.append(
                ParsedNmapPort(
                    port=port_number,
                    protocol=protocol,
                    service=service_name,
                )
            )

    return ports


def _children_named(element: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in list(element) if _strip_namespace(child.tag) == name]


def _first_child_named(element: ET.Element, name: str) -> ET.Element | None:
    for child in list(element):
        if _strip_namespace(child.tag) == name:
            return child

    return None


def _strip_namespace(tag: str) -> str:
    if "}" in tag:
        return tag.rsplit("}", 1)[1]

    return tag
