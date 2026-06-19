import pytest

from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.schemas.exploration import AssetCriticality, AssetEnvironment, AssetKind
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
            <service name="https"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    summary = service.import_xml(xml)
    assets = repository.list_assets()

    assert summary.assets_created == 1
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

    assert summary.assets_created == 1
    assert summary.hosts_seen == 1
    assert summary.open_ports_seen == 0

    assert len(assets) == 1
    assert assets[0].name == "10.0.0.5"
    assert assets[0].value == "10.0.0.5"


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
    assert summary.hosts_seen == 2
    assert [asset.value for asset in assets] == ["10.0.0.1", "10.0.0.2"]


def test_nmap_import_service_propagates_controlled_parser_error(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")
    service = NmapImportService(repository)

    with pytest.raises(NmapParseError, match="Malformed"):
        service.import_xml("<nmaprun><host></nmaprun>")

    assert repository.list_assets() == []
