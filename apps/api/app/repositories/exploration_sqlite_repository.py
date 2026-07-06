from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4
import sqlite3

from app.schemas.exploration import (
    AssetCreate,
    AssetKind,
    AssetRead,
    ExplorationServiceCreate,
    ExplorationServiceRead,
    FindingCreate,
    FindingRead,
    ServiceProtocol,
)
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

        return [self._row_to_asset(row) for row in rows]

    def find_asset_by_kind_and_value(
        self,
        kind: AssetKind,
        value: str,
    ) -> AssetRead | None:
        """Busca un asset existente por tipo y valor técnico.

        Propósito:
        - soportar deduplicación conservadora en importadores;
        - evitar crear assets repetidos para el mismo identificador técnico.

        No normaliza `value`.
        La normalización, si corresponde, debe ocurrir antes de llamar al repositorio.
        """

        with self._connect() as connection:
            row = connection.execute(
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
                WHERE kind = ? AND value = ?
                ORDER BY created_at ASC
                LIMIT 1
                """,
                (kind.value, value),
            ).fetchone()

        if row is None:
            return None

        return self._row_to_asset(row)

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

    def list_services(self) -> list[ExplorationServiceRead]:
        """Lista servicios detectados ordenados por creación.

        Propósito:
        - exponer superficie de ataque observable;
        - permitir que capas superiores consulten puertos/servicios persistidos.
        """

        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    asset_id,
                    protocol,
                    port,
                    name,
                    product,
                    version,
                    state,
                    source,
                    created_at,
                    updated_at
                FROM exploration_services
                ORDER BY created_at ASC
                """
            ).fetchall()

        return [self._row_to_service(row) for row in rows]

    def find_service_by_asset_protocol_port(
        self,
        asset_id: str,
        protocol: ServiceProtocol,
        port: int,
    ) -> ExplorationServiceRead | None:
        """Busca un servicio existente por asset + protocolo + puerto.

        Esta clave lógica evita duplicados al reimportar XML de Nmap.
        """

        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT
                    id,
                    asset_id,
                    protocol,
                    port,
                    name,
                    product,
                    version,
                    state,
                    source,
                    created_at,
                    updated_at
                FROM exploration_services
                WHERE asset_id = ? AND protocol = ? AND port = ?
                ORDER BY created_at ASC
                LIMIT 1
                """,
                (asset_id, protocol.value, port),
            ).fetchone()

        if row is None:
            return None

        return self._row_to_service(row)

    def create_service(
        self,
        payload: ExplorationServiceCreate,
    ) -> ExplorationServiceRead:
        """Crea un servicio detectado asociado a un asset existente."""

        now = self._now()
        service = ExplorationServiceRead(
            id=f"service_{uuid4().hex}",
            createdAt=now,
            updatedAt=now,
            **payload.model_dump(),
        )

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO exploration_services (
                    id,
                    asset_id,
                    protocol,
                    port,
                    name,
                    product,
                    version,
                    state,
                    source,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    service.id,
                    service.assetId,
                    service.protocol,
                    service.port,
                    service.name,
                    service.product,
                    service.version,
                    service.state,
                    service.source,
                    service.createdAt.isoformat(),
                    service.updatedAt.isoformat(),
                ),
            )

        return service

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

    def _row_to_service(self, row: sqlite3.Row) -> ExplorationServiceRead:
        """Convierte una fila SQLite de exploration_services en ExplorationServiceRead."""

        return ExplorationServiceRead(
            id=row["id"],
            assetId=row["asset_id"],
            protocol=row["protocol"],
            port=row["port"],
            name=row["name"],
            product=row["product"],
            version=row["version"],
            state=row["state"],
            source=row["source"],
            createdAt=datetime.fromisoformat(row["created_at"]),
            updatedAt=datetime.fromisoformat(row["updated_at"]),
        )

    def _row_to_asset(self, row: sqlite3.Row) -> AssetRead:
        """Convierte una fila SQLite de exploration_assets en AssetRead."""

        return AssetRead(
            id=row["id"],
            name=row["name"],
            kind=row["kind"],
            value=row["value"],
            environment=row["environment"],
            criticality=row["criticality"],
            createdAt=datetime.fromisoformat(row["created_at"]),
            updatedAt=datetime.fromisoformat(row["updated_at"]),
        )

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
