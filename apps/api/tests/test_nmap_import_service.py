import pytest

from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.schemas.exploration import (
    AssetCriticality,
    AssetEnvironment,
    AssetKind,
    ServiceProtocol,
    ServiceSource,
    ServiceState,
)
from app.services.nmap_import_service import NmapImportService
from app.services.nmap_parser import NmapParseError


def test_nmap_import_service_creates_asset_from_host_with_hostname(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="192.168.1.10" addrtype="ipv4"/>
        <hostnames>
          <hostname name="server.local" type="user"/>
        </hostnames>
        <ports>
          <port protocol="tcp" portid="22">
            <state state="open"/>
            <service name="ssh"/>
          </port>
          <port protocol="tcp" portid="443">
            <state state="open"/>
            <service name="https" product="nginx" version="1.24.0"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    assets = repository.list_assets()

    assert summary.assets_created == 1
    assert summary.assets_skipped == 0
    assert summary.services_created == 2
    assert summary.services_skipped == 0
    assert summary.hosts_seen == 1
    assert summary.open_ports_seen == 2
    assert summary.warnings == []

    assert len(assets) == 1
    assert assets[0].name == "server.local"
    assert assets[0].kind == AssetKind.IP
    assert assets[0].value == "192.168.1.10"
    assert assets[0].environment == AssetEnvironment.UNKNOWN
    assert assets[0].criticality == AssetCriticality.MEDIUM


def test_nmap_import_service_uses_address_as_name_when_hostname_is_missing(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="10.0.0.5" addrtype="ipv4"/>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    assets = repository.list_assets()
    services = repository.list_services()

    assert summary.assets_created == 1
    assert summary.services_created == 0
    assert summary.services_skipped == 0
    assert summary.hosts_seen == 1
    assert summary.open_ports_seen == 0

    assert len(assets) == 1
    assert assets[0].name == "10.0.0.5"
    assert assets[0].value == "10.0.0.5"
    assert services == []


def test_nmap_import_service_preserves_parser_warnings(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <status state="up"/>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)

    assert summary.assets_created == 0
    assert summary.services_created == 0
    assert summary.services_skipped == 0
    assert summary.hosts_seen == 0
    assert summary.open_ports_seen == 0
    assert summary.warnings == ["Skipped host without address"]
    assert repository.list_assets() == []


def test_nmap_import_service_creates_multiple_assets(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="10.0.0.1" addrtype="ipv4"/>
      </host>
      <host>
        <address addr="10.0.0.2" addrtype="ipv4"/>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    assets = repository.list_assets()

    assert summary.assets_created == 2
    assert summary.services_created == 0
    assert summary.services_skipped == 0
    assert summary.hosts_seen == 2
    assert [asset.value for asset in assets] == ["10.0.0.1", "10.0.0.2"]


def test_nmap_import_service_propagates_controlled_parser_error(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    with pytest.raises(NmapParseError, match="Malformed"):
        service.import_xml("<nmaprun><host></nmaprun>")

    assert repository.list_assets() == []


def test_nmap_import_service_creates_services_from_open_ports(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="192.168.1.10" addrtype="ipv4"/>
        <hostnames>
          <hostname name="server.local" type="user"/>
        </hostnames>
        <ports>
          <port protocol="tcp" portid="22">
            <state state="open"/>
            <service name="ssh"/>
          </port>
          <port protocol="tcp" portid="443">
            <state state="open"/>
            <service name="https" product="nginx" version="1.24.0"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    assets = repository.list_assets()
    services = repository.list_services()

    assert summary.assets_created == 1
    assert summary.assets_skipped == 0
    assert summary.services_created == 2
    assert summary.services_skipped == 0
    assert summary.open_ports_seen == 2

    assert len(assets) == 1
    assert len(services) == 2

    assert [
        (item.port, item.protocol, item.name, item.product, item.version)
        for item in services
    ] == [
        (22, ServiceProtocol.TCP, "ssh", None, None),
        (443, ServiceProtocol.TCP, "https", "nginx", "1.24.0"),
    ]
    assert all(item.assetId == assets[0].id for item in services)
    assert all(item.state == ServiceState.OPEN for item in services)
    assert all(item.source == ServiceSource.NMAP for item in services)


def test_nmap_import_service_skips_existing_services_on_reimport(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="192.168.1.10" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="80">
            <state state="open"/>
            <service name="http"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    first_summary = service.import_xml(xml)
    second_summary = service.import_xml(xml)

    assets = repository.list_assets()
    services = repository.list_services()

    assert first_summary.assets_created == 1
    assert first_summary.assets_skipped == 0
    assert first_summary.services_created == 1
    assert first_summary.services_skipped == 0

    assert second_summary.assets_created == 0
    assert second_summary.assets_skipped == 1
    assert second_summary.services_created == 0
    assert second_summary.services_skipped == 1

    assert len(assets) == 1
    assert len(services) == 1
    assert services[0].assetId == assets[0].id
    assert services[0].protocol == ServiceProtocol.TCP
    assert services[0].port == 80
    assert services[0].name == "http"


def test_nmap_import_service_persists_service_product_and_version(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    xml = """<nmaprun>
      <host>
        <address addr="192.168.1.50" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="443">
            <state state="open"/>
            <service name="https" product="nginx" version="1.24.0"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    services = repository.list_services()

    assert summary.services_created == 1
    assert len(services) == 1
    assert services[0].name == "https"
    assert services[0].product == "nginx"
    assert services[0].version == "1.24.0"
