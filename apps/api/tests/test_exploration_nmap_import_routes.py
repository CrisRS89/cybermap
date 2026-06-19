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
