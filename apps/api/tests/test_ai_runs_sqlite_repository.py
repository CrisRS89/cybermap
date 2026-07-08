import json
import sqlite3

from app.repositories.ai_runs_sqlite_repository import AiRunsSQLiteRepository
from app.schemas.ai import AgentRunEvidenceUsed, AgentRunStatus
from app.schemas.ai_run import AiRunCreate


def build_ai_run_create(
    *,
    task: str = "Analizar superficie detectada",
    summary: str = "Resumen IA",
) -> AiRunCreate:
    return AiRunCreate(
        agentId="exploration_analyst",
        providerId="mock",
        model="mock-security-model",
        task=task,
        status=AgentRunStatus.COMPLETED,
        summary=summary,
        recommendations=[
            {
                "title": "Revisar exposición HTTP",
                "severity": "medium",
                "rationale": "Se detectó un servicio web.",
                "suggestedFinding": True,
            }
        ],
        evidenceUsed=AgentRunEvidenceUsed(
            assets=4,
            services=3,
            findings=0,
        ),
    )


def test_ai_runs_repository_creates_ai_run(tmp_path):
    repository = AiRunsSQLiteRepository(tmp_path / "cybermap.db")

    ai_run = repository.create_ai_run(build_ai_run_create())

    assert ai_run.id.startswith("ai_run_")
    assert ai_run.agentId == "exploration_analyst"
    assert ai_run.providerId == "mock"
    assert ai_run.model == "mock-security-model"
    assert ai_run.status == AgentRunStatus.COMPLETED
    assert ai_run.evidenceUsed.assets == 4
    assert ai_run.recommendations[0]["title"] == "Revisar exposición HTTP"


def test_ai_runs_repository_lists_ai_runs_newest_first(tmp_path):
    repository = AiRunsSQLiteRepository(tmp_path / "cybermap.db")

    first = repository.create_ai_run(
        build_ai_run_create(
            task="Primera ejecución",
            summary="Primera respuesta",
        )
    )
    second = repository.create_ai_run(
        build_ai_run_create(
            task="Segunda ejecución",
            summary="Segunda respuesta",
        )
    )

    runs = repository.list_ai_runs()

    assert [run.id for run in runs] == [second.id, first.id]


def test_ai_runs_repository_finds_ai_run_by_id(tmp_path):
    repository = AiRunsSQLiteRepository(tmp_path / "cybermap.db")

    created = repository.create_ai_run(build_ai_run_create())

    found = repository.find_ai_run_by_id(created.id)

    assert found is not None
    assert found.id == created.id
    assert found.summary == "Resumen IA"


def test_ai_runs_repository_returns_none_for_missing_ai_run(tmp_path):
    repository = AiRunsSQLiteRepository(tmp_path / "cybermap.db")

    found = repository.find_ai_run_by_id("ai_run_missing")

    assert found is None


def test_ai_runs_repository_persists_json_payloads(tmp_path):
    database_path = tmp_path / "cybermap.db"
    repository = AiRunsSQLiteRepository(database_path)

    created = repository.create_ai_run(build_ai_run_create())

    with sqlite3.connect(database_path) as connection:
        row = connection.execute(
            """
            SELECT recommendations_json, evidence_used_json
            FROM ai_runs
            WHERE id = ?
            """,
            (created.id,),
        ).fetchone()

    recommendations = json.loads(row[0])
    evidence_used = json.loads(row[1])

    assert recommendations == [
        {
            "title": "Revisar exposición HTTP",
            "severity": "medium",
            "rationale": "Se detectó un servicio web.",
            "suggestedFinding": True,
        }
    ]
    assert evidence_used == {
        "assets": 4,
        "services": 3,
        "findings": 0,
    }


def test_ai_runs_repository_applies_migrations(tmp_path):
    database_path = tmp_path / "cybermap.db"

    AiRunsSQLiteRepository(database_path)

    with sqlite3.connect(database_path) as connection:
        tables = {
            row[0]
            for row in connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                """
            ).fetchall()
        }

    assert "ai_runs" in tables
    assert "schema_migrations" in tables
