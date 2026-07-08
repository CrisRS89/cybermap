from datetime import UTC, datetime
import json
from pathlib import Path
import sqlite3
from uuid import uuid4

from app.schemas.ai import AgentRunEvidenceUsed, AgentRunStatus
from app.schemas.ai_run import AiRunCreate, AiRunRead
from app.storage.sqlite_migrations import apply_sqlite_migrations


class AiRunsSQLiteRepository:
    """Repositorio SQLite para auditoría de ejecuciones IA.

    Propósito:
    - persistir cada ejecución de agente;
    - permitir historial y trazabilidad;
    - evitar que los resultados IA existan solo en memoria o en la UI.

    Seguridad:
    - usa queries parametrizadas;
    - no ejecuta contenido generado por IA;
    - JSON se guarda como texto serializado desde estructuras validadas.
    """

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_schema()

    def create_ai_run(self, payload: AiRunCreate) -> AiRunRead:
        """Persiste una ejecución IA y devuelve la lectura normalizada."""

        now = self._now()
        ai_run = AiRunRead(
            id=f"ai_run_{uuid4().hex}",
            agentId=payload.agentId,
            providerId=payload.providerId,
            model=payload.model,
            task=payload.task,
            status=payload.status,
            summary=payload.summary,
            recommendations=payload.recommendations,
            evidenceUsed=payload.evidenceUsed,
            createdAt=now,
            updatedAt=now,
        )

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO ai_runs (
                    id,
                    agent_id,
                    provider_id,
                    model,
                    task,
                    status,
                    summary,
                    recommendations_json,
                    evidence_used_json,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ai_run.id,
                    ai_run.agentId,
                    ai_run.providerId,
                    ai_run.model,
                    ai_run.task,
                    ai_run.status.value,
                    ai_run.summary,
                    json.dumps(ai_run.recommendations, ensure_ascii=False),
                    json.dumps(
                        ai_run.evidenceUsed.model_dump(mode="json"),
                        ensure_ascii=False,
                    ),
                    ai_run.createdAt.isoformat(),
                    ai_run.updatedAt.isoformat(),
                ),
            )

        return ai_run

    def list_ai_runs(self) -> list[AiRunRead]:
        """Lista ejecuciones IA en orden de creación descendente."""

        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    agent_id,
                    provider_id,
                    model,
                    task,
                    status,
                    summary,
                    recommendations_json,
                    evidence_used_json,
                    created_at,
                    updated_at
                FROM ai_runs
                ORDER BY created_at DESC
                """
            ).fetchall()

        return [self._row_to_ai_run(row) for row in rows]

    def find_ai_run_by_id(self, ai_run_id: str) -> AiRunRead | None:
        """Busca una ejecución IA por ID."""

        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT
                    id,
                    agent_id,
                    provider_id,
                    model,
                    task,
                    status,
                    summary,
                    recommendations_json,
                    evidence_used_json,
                    created_at,
                    updated_at
                FROM ai_runs
                WHERE id = ?
                LIMIT 1
                """,
                (ai_run_id,),
            ).fetchone()

        if row is None:
            return None

        return self._row_to_ai_run(row)

    def _initialize_schema(self) -> None:
        with self._connect() as connection:
            apply_sqlite_migrations(connection)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    @staticmethod
    def _now() -> datetime:
        return datetime.now(UTC)

    @staticmethod
    def _row_to_ai_run(row: sqlite3.Row | tuple) -> AiRunRead:
        recommendations = json.loads(row[7])
        evidence_used = AgentRunEvidenceUsed(**json.loads(row[8]))

        return AiRunRead(
            id=row[0],
            agentId=row[1],
            providerId=row[2],
            model=row[3],
            task=row[4],
            status=AgentRunStatus(row[5]),
            summary=row[6],
            recommendations=recommendations,
            evidenceUsed=evidence_used,
            createdAt=datetime.fromisoformat(row[9]),
            updatedAt=datetime.fromisoformat(row[10]),
        )
