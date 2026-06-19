from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4
import sqlite3

from app.schemas.exploration import AssetCreate, AssetRead, FindingCreate, FindingRead
from app.storage.sqlite_migrations import apply_sqlite_migrations


class ExplorationSQLiteRepository:
    """Repositorio SQLite local-first para Exploration.

    Proposito:
    - reemplazar progresivamente el storage JSON temporal
    - mantener contrato de dominio con schemas Pydantic
    - usar queries parametrizadas para evitar inyeccion SQL
    """

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_schema()

    def list_assets(self) -> list[AssetRead]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    name,
                    kind,
                    value,
                    environment,
                    criticality,
                    created_at,
                    updated_at
                FROM exploration_assets
                ORDER BY created_at ASC
                """
            ).fetchall()

        return [
            AssetRead(
                id=row["id"],
                name=row["name"],
                kind=row["kind"],
                value=row["value"],
                environment=row["environment"],
                criticality=row["criticality"],
                createdAt=datetime.fromisoformat(row["created_at"]),
                updatedAt=datetime.fromisoformat(row["updated_at"]),
            )
            for row in rows
        ]

    def create_asset(self, payload: AssetCreate) -> AssetRead:
        now = self._now()
        asset = AssetRead(
            id=f"asset_{uuid4().hex}",
            createdAt=now,
            updatedAt=now,
            **payload.model_dump(),
        )

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO exploration_assets (
                    id,
                    name,
                    kind,
                    value,
                    environment,
                    criticality,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    asset.id,
                    asset.name,
                    asset.kind,
                    asset.value,
                    asset.environment,
                    asset.criticality,
                    asset.createdAt.isoformat(),
                    asset.updatedAt.isoformat(),
                ),
            )

        return asset

    def list_findings(self) -> list[FindingRead]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    title,
                    description,
                    severity,
                    status,
                    asset_id,
                    source,
                    evidence,
                    recommendation,
                    created_at,
                    updated_at
                FROM exploration_findings
                ORDER BY created_at ASC
                """
            ).fetchall()

        return [
            FindingRead(
                id=row["id"],
                title=row["title"],
                description=row["description"],
                severity=row["severity"],
                status=row["status"],
                assetId=row["asset_id"],
                source=row["source"],
                evidence=row["evidence"],
                recommendation=row["recommendation"],
                createdAt=datetime.fromisoformat(row["created_at"]),
                updatedAt=datetime.fromisoformat(row["updated_at"]),
            )
            for row in rows
        ]

    def create_finding(self, payload: FindingCreate) -> FindingRead:
        now = self._now()
        finding = FindingRead(
            id=f"finding_{uuid4().hex}",
            createdAt=now,
            updatedAt=now,
            **payload.model_dump(),
        )

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO exploration_findings (
                    id,
                    title,
                    description,
                    severity,
                    status,
                    asset_id,
                    source,
                    evidence,
                    recommendation,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    finding.id,
                    finding.title,
                    finding.description,
                    finding.severity,
                    finding.status,
                    finding.assetId,
                    finding.source,
                    finding.evidence,
                    finding.recommendation,
                    finding.createdAt.isoformat(),
                    finding.updatedAt.isoformat(),
                ),
            )

        return finding

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def _initialize_schema(self) -> None:
        with self._connect() as connection:
            apply_sqlite_migrations(connection)

    def _now(self) -> datetime:
        return datetime.now(UTC)
