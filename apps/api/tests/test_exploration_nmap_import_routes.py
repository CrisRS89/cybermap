from pathlib import Path
from typing import Callable

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.routes import exploration


@pytest.fixture
def client_with_temp_db(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> TestClient:
    """Crea un cliente HTTP con SQLite aislado por test.

    Decisión:
    - No usamos app.dependency_overrides porque get_exploration_service()
      no está conectado mediante Depends(...).
    - Las rutas actuales llaman get_exploration_service() directamente.
    - Por eso se parchea la función en el módulo exploration.
    """

    db_path = tmp_path / "cybermap-test.db"

    def override_service() -> ExplorationSQLiteRepository:
        return ExplorationSQLiteRepository(db_path)

    monkeypatch.setattr(
        exploration,
        "get_exploration_service",
        override_service,
    )

    return TestClient(app)


def test_import_nmap_xml_returns_summary_and_creates_asset(
    client_with_temp_db: TestClient,
) -> None:
    xml = """
    <nmaprun>
      <host>
        <status state="up" />
        <address addr="192.168.1.10" addrtype="ipv4" />
        <hostnames>
          <hostname name="web-01.local" />
        </hostnames>
        <ports>
          <port protocol="tcp" portid="80">
            <state state="open" />
            <service name="http" />
          </port>
          <port protocol="tcp" portid="443">
            <state state="open" />
            <service name="https" />
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": xml},
    )

    assert response.status_code == 200
    assert response.json() == {
        "summary": {
            "assetsCreated": 1,
            "hostsSeen": 1,
            "openPortsSeen": 2,
            "warnings": [],
        }
    }

    assets_response = client_with_temp_db.get("/exploration/assets")

    assert assets_response.status_code == 200
    assets_payload = assets_response.json()
    assets = assets_payload["items"]

    assert len(assets) == 1
    assert assets[0]["kind"] == "ip"
    assert assets[0]["value"] == "192.168.1.10"
    assert assets[0]["name"] == "web-01.local"
    assert assets[0]["environment"] == "unknown"
    assert assets[0]["criticality"] == "medium"


def test_import_nmap_xml_empty_xml_returns_400(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": ""},
    )

    assert response.status_code == 400
    assert "detail" in response.json()


def test_import_nmap_xml_malformed_xml_returns_400(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": "<nmaprun><host></nmaprun>"},
    )

    assert response.status_code == 400
    assert "detail" in response.json()


def test_import_nmap_xml_with_dtd_returns_400(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": "<!DOCTYPE nmaprun><nmaprun></nmaprun>"},
    )

    assert response.status_code == 400
    assert "detail" in response.json()


def test_import_nmap_xml_with_entity_returns_400(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": "<!ENTITY xxe SYSTEM 'file:///etc/passwd'><nmaprun></nmaprun>"},
    )

    assert response.status_code == 400
    assert "detail" in response.json()


def test_import_nmap_xml_too_large_returns_413(
    client_with_temp_db: TestClient,
) -> None:
    oversized_xml = "<nmaprun>" + (" " * (1024 * 1024 + 1)) + "</nmaprun>"

    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": oversized_xml},
    )

    assert response.status_code == 413
    assert "detail" in response.json()


def test_import_nmap_xml_with_extra_field_returns_422(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={
            "xml": "<nmaprun></nmaprun>",
            "path": "/tmp/scan.xml",
        },
    )

    assert response.status_code == 422


def test_import_nmap_xml_realistic_scan_persists_multiple_assets(
    client_with_temp_db: TestClient,
) -> None:
    """Valida un flujo E2E backend con XML de Nmap más realista.

    Cubre:
    - múltiples hosts;
    - host con hostname;
    - host sin hostname;
    - puertos abiertos;
    - puertos cerrados ignorados;
    - host sin address reportado como warning;
    - persistencia observable vía GET /exploration/assets.
    """

    xml = """
    <nmaprun scanner="nmap" args="nmap -sV -oX scan.xml 192.168.1.0/24">
      <host>
        <status state="up" reason="syn-ack" />
        <address addr="192.168.1.10" addrtype="ipv4" />
        <hostnames>
          <hostname name="web-01.local" type="PTR" />
        </hostnames>
        <ports>
          <port protocol="tcp" portid="22">
            <state state="closed" reason="reset" />
            <service name="ssh" />
          </port>
          <port protocol="tcp" portid="80">
            <state state="open" reason="syn-ack" />
            <service name="http" product="nginx" version="1.24.0" />
          </port>
          <port protocol="tcp" portid="443">
            <state state="open" reason="syn-ack" />
            <service name="https" product="nginx" />
          </port>
        </ports>
      </host>

      <host>
        <status state="up" reason="syn-ack" />
        <address addr="192.168.1.20" addrtype="ipv4" />
        <ports>
          <port protocol="tcp" portid="22">
            <state state="open" reason="syn-ack" />
            <service name="ssh" product="OpenSSH" />
          </port>
          <port protocol="tcp" portid="3389">
            <state state="closed" reason="reset" />
            <service name="ms-wbt-server" />
          </port>
        </ports>
      </host>

      <host>
        <status state="up" reason="user-set" />
        <hostnames>
          <hostname name="no-address.local" type="user" />
        </hostnames>
      </host>
    </nmaprun>
    """

    response = client_with_temp_db.post(
        "/exploration/imports/nmap",
        json={"xml": xml},
    )

    assert response.status_code == 200

    body = response.json()
    summary = body["summary"]

    assert summary["assetsCreated"] == 2
    assert summary["hostsSeen"] == 2
    assert summary["openPortsSeen"] == 3
    assert len(summary["warnings"]) == 1

    assets_response = client_with_temp_db.get("/exploration/assets")

    assert assets_response.status_code == 200

    assets = assets_response.json()["items"]

    assert len(assets) == 2

    assets_by_value = {asset["value"]: asset for asset in assets}

    assert assets_by_value["192.168.1.10"]["kind"] == "ip"
    assert assets_by_value["192.168.1.10"]["name"] == "web-01.local"
    assert assets_by_value["192.168.1.10"]["environment"] == "unknown"
    assert assets_by_value["192.168.1.10"]["criticality"] == "medium"

    assert assets_by_value["192.168.1.20"]["kind"] == "ip"
    assert assets_by_value["192.168.1.20"]["name"] == "192.168.1.20"
    assert assets_by_value["192.168.1.20"]["environment"] == "unknown"
    assert assets_by_value["192.168.1.20"]["criticality"] == "medium"
