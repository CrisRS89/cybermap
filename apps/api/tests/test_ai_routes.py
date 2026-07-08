from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.ai_runs_sqlite_repository import AiRunsSQLiteRepository
from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.routes import ai
from app.schemas.exploration import (
    AssetCreate,
    AssetKind,
    ExplorationServiceCreate,
    ServiceProtocol,
    ServiceSource,
)


@pytest.fixture
def client_with_temp_db(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> TestClient:
    """Crea cliente HTTP con SQLite aislado para rutas IA."""

    db_path = tmp_path / "cybermap-ai-test.db"

    def override_exploration_service() -> ExplorationSQLiteRepository:
        return ExplorationSQLiteRepository(db_path)

    def override_ai_runs_repository() -> AiRunsSQLiteRepository:
        return AiRunsSQLiteRepository(db_path)

    monkeypatch.setattr(
        ai,
        "get_exploration_service",
        override_exploration_service,
    )
    monkeypatch.setattr(
        ai,
        "get_ai_runs_repository",
        override_ai_runs_repository,
    )

    return TestClient(app)


def test_run_ai_agent_with_mock_provider_uses_exploration_context(
    client_with_temp_db: TestClient,
) -> None:
    repository = ai.get_exploration_service()

    asset = repository.create_asset(
        AssetCreate(
            name="web-01.local",
            kind=AssetKind.IP,
            value="192.168.1.10",
        )
    )

    repository.create_service(
        ExplorationServiceCreate(
            assetId=asset.id,
            protocol=ServiceProtocol.TCP,
            port=443,
            name="https",
            product="nginx",
            version="1.24.0",
            source=ServiceSource.NMAP,
        )
    )

    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "exploration_analyst",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["runId"].startswith("ai_run_")
    assert body["agentId"] == "exploration_analyst"
    assert body["providerId"] == "mock"
    assert body["model"] == "mock-security-model"
    assert body["status"] == "completed"
    assert "Análisis mock generado por CyberMap" in body["summary"]
    assert body["evidenceUsed"] == {
        "assets": 1,
        "services": 1,
        "findings": 0,
    }
    assert body["recommendations"][0]["title"] == (
        "Revisar exposición de servicios HTTP/HTTPS"
    )
    assert body["recommendations"][0]["suggestedFinding"] is True


def test_run_ai_agent_persists_successful_run(
    client_with_temp_db: TestClient,
) -> None:
    repository = ai.get_exploration_service()
    ai_runs_repository = ai.get_ai_runs_repository()

    asset = repository.create_asset(
        AssetCreate(
            name="web-01.local",
            kind=AssetKind.IP,
            value="192.168.1.10",
        )
    )

    repository.create_service(
        ExplorationServiceCreate(
            assetId=asset.id,
            protocol=ServiceProtocol.TCP,
            port=443,
            name="https",
            source=ServiceSource.NMAP,
        )
    )

    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "exploration_analyst",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
        },
    )

    assert response.status_code == 200

    body = response.json()
    persisted = ai_runs_repository.find_ai_run_by_id(body["runId"])

    assert persisted is not None
    assert persisted.id == body["runId"]
    assert persisted.agentId == "exploration_analyst"
    assert persisted.providerId == "mock"
    assert persisted.model == "mock-security-model"
    assert persisted.task == "Analizar superficie detectada"
    assert persisted.evidenceUsed.assets == 1
    assert persisted.evidenceUsed.services == 1
    assert persisted.evidenceUsed.findings == 0
    assert persisted.recommendations[0]["suggestedFinding"] is True


def test_run_ai_agent_rejects_unknown_agent(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "missing_agent",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Unknown agent: missing_agent",
    }


def test_run_ai_agent_rejects_unknown_provider(
    client_with_temp_db: TestClient,
) -> None:
    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "exploration_analyst",
            "providerId": "missing_provider",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Unknown provider: missing_provider",
    }


def test_run_ai_agent_respects_disabled_services_scope(
    client_with_temp_db: TestClient,
) -> None:
    repository = ai.get_exploration_service()

    asset = repository.create_asset(
        AssetCreate(
            name="web-01.local",
            kind=AssetKind.IP,
            value="192.168.1.10",
        )
    )

    repository.create_service(
        ExplorationServiceCreate(
            assetId=asset.id,
            protocol=ServiceProtocol.TCP,
            port=443,
            name="https",
            source=ServiceSource.NMAP,
        )
    )

    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "exploration_analyst",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
            "scope": {
                "includeAssets": True,
                "includeServices": False,
                "includeFindings": True,
                "assetIds": [],
            },
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["evidenceUsed"] == {
        "assets": 1,
        "services": 0,
        "findings": 0,
    }
    assert body["recommendations"][0]["title"] == "Completar inventario de superficie"


def test_run_ai_agent_filters_context_by_asset_ids(
    client_with_temp_db: TestClient,
) -> None:
    repository = ai.get_exploration_service()

    selected_asset = repository.create_asset(
        AssetCreate(
            name="selected.local",
            kind=AssetKind.IP,
            value="192.168.1.10",
        )
    )
    ignored_asset = repository.create_asset(
        AssetCreate(
            name="ignored.local",
            kind=AssetKind.IP,
            value="192.168.1.20",
        )
    )

    repository.create_service(
        ExplorationServiceCreate(
            assetId=selected_asset.id,
            protocol=ServiceProtocol.TCP,
            port=443,
            name="https",
            source=ServiceSource.NMAP,
        )
    )
    repository.create_service(
        ExplorationServiceCreate(
            assetId=ignored_asset.id,
            protocol=ServiceProtocol.TCP,
            port=22,
            name="ssh",
            source=ServiceSource.NMAP,
        )
    )

    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "exploration_analyst",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar solo asset seleccionado",
            "scope": {
                "assetIds": [selected_asset.id],
                "includeAssets": True,
                "includeServices": True,
                "includeFindings": True,
            },
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["evidenceUsed"] == {
        "assets": 1,
        "services": 1,
        "findings": 0,
    }
    assert body["recommendations"][0]["title"] == (
        "Revisar exposición de servicios HTTP/HTTPS"
    )


def test_run_ai_agent_does_not_persist_failed_validation(
    client_with_temp_db: TestClient,
) -> None:
    ai_runs_repository = ai.get_ai_runs_repository()

    response = client_with_temp_db.post(
        "/ai/runs",
        json={
            "agentId": "missing_agent",
            "providerId": "mock",
            "model": "mock-security-model",
            "task": "Analizar superficie detectada",
        },
    )

    assert response.status_code == 400
    assert ai_runs_repository.list_ai_runs() == []
