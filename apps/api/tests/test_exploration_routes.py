from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.routes import exploration
from app.services.exploration_service import ExplorationService
from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository


def test_exploration_assets_flow(tmp_path):
    def override_service():
        return ExplorationService(tmp_path)

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        initial = client.get("/exploration/assets")
        assert initial.status_code == 200
        assert initial.json() == {"items": []}

        created = client.post(
            "/exploration/assets",
            json={
                "name": "Localhost",
                "kind": "host",
                "value": "localhost",
                "environment": "dev",
                "criticality": "medium",
            },
        )

        assert created.status_code == 200
        assert created.json()["id"].startswith("asset_")

        listed = client.get("/exploration/assets")
        assert listed.status_code == 200
        assert len(listed.json()["items"]) == 1
        assert listed.json()["items"][0]["name"] == "Localhost"
    finally:
        exploration.get_exploration_service = original


def test_exploration_findings_flow(tmp_path):
    def override_service():
        return ExplorationService(tmp_path)

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        initial = client.get("/exploration/findings")
        assert initial.status_code == 200
        assert initial.json() == {"items": []}

        created = client.post(
            "/exploration/findings",
            json={
                "title": "Example finding",
                "severity": "high",
                "status": "open",
                "source": "manual",
                "evidence": "example evidence",
            },
        )

        assert created.status_code == 200
        assert created.json()["id"].startswith("finding_")

        listed = client.get("/exploration/findings")
        assert listed.status_code == 200
        assert len(listed.json()["items"]) == 1
        assert listed.json()["items"][0]["title"] == "Example finding"
    finally:
        exploration.get_exploration_service = original


def test_exploration_rejects_invalid_asset_payload(tmp_path):
    def override_service():
        return ExplorationService(tmp_path)

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        response = client.post(
            "/exploration/assets",
            json={
                "name": "Localhost",
                "kind": "invalid",
                "value": "localhost",
            },
        )

        assert response.status_code == 422
    finally:
        exploration.get_exploration_service = original


def test_exploration_rejects_invalid_finding_payload(tmp_path):
    def override_service():
        return ExplorationService(tmp_path)

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        response = client.post(
            "/exploration/findings",
            json={
                "title": "Example finding",
                "severity": "danger",
            },
        )

        assert response.status_code == 422
    finally:
        exploration.get_exploration_service = original


def test_exploration_creates_finding_associated_with_asset(tmp_path):
    def override_service():
        return ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        asset_response = client.post(
            "/exploration/assets",
            json={
                "name": "Associated Host",
                "kind": "host",
                "value": "associated.local",
                "environment": "dev",
                "criticality": "high",
            },
        )

        assert asset_response.status_code == 200
        asset_id = asset_response.json()["id"]

        finding_response = client.post(
            "/exploration/findings",
            json={
                "title": "Associated finding",
                "severity": "high",
                "status": "open",
                "source": "manual",
                "assetId": asset_id,
                "evidence": "Finding associated with an existing asset",
            },
        )

        assert finding_response.status_code == 200
        assert finding_response.json()["assetId"] == asset_id

        listed = client.get("/exploration/findings")

        assert listed.status_code == 200
        assert len(listed.json()["items"]) == 1
        assert listed.json()["items"][0]["assetId"] == asset_id
    finally:
        exploration.get_exploration_service = original


def test_exploration_rejects_finding_associated_with_missing_asset(tmp_path):
    def override_service():
        return ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    original = exploration.get_exploration_service
    exploration.get_exploration_service = override_service

    try:
        client = TestClient(app)

        response = client.post(
            "/exploration/findings",
            json={
                "title": "Invalid associated finding",
                "severity": "high",
                "status": "open",
                "source": "manual",
                "assetId": "asset_missing",
            },
        )

        assert response.status_code == 400
        assert response.json() == {
            "detail": "Associated asset does not exist",
        }
    finally:
        exploration.get_exploration_service = original
