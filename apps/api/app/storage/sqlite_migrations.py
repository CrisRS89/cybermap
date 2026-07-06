from datetime import UTC, datetime
import sqlite3


EXPLORATION_INITIAL_VERSION = "001_exploration_initial"
EXPLORATION_SERVICES_VERSION = "002_exploration_services"


EXPLORATION_INITIAL_SQL = """
CREATE TABLE IF NOT EXISTS exploration_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    value TEXT NOT NULL,
    environment TEXT NOT NULL,
    criticality TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exploration_findings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    asset_id TEXT NULL,
    source TEXT NOT NULL,
    evidence TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (asset_id)
        REFERENCES exploration_assets(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exploration_assets_kind
    ON exploration_assets(kind);

CREATE INDEX IF NOT EXISTS idx_exploration_findings_severity
    ON exploration_findings(severity);

CREATE INDEX IF NOT EXISTS idx_exploration_findings_status
    ON exploration_findings(status);

CREATE INDEX IF NOT EXISTS idx_exploration_findings_asset_id
    ON exploration_findings(asset_id);
"""

EXPLORATION_SERVICES_SQL = """
CREATE TABLE IF NOT EXISTS exploration_services (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    protocol TEXT NOT NULL,
    port INTEGER NOT NULL,
    name TEXT NULL,
    product TEXT NULL,
    version TEXT NULL,
    state TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (asset_id)
        REFERENCES exploration_assets(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exploration_services_asset_id
    ON exploration_services(asset_id);

CREATE INDEX IF NOT EXISTS idx_exploration_services_port
    ON exploration_services(port);

CREATE UNIQUE INDEX IF NOT EXISTS idx_exploration_services_asset_protocol_port
    ON exploration_services(asset_id, protocol, port);
"""




MIGRATIONS: tuple[tuple[str, str], ...] = (
    (EXPLORATION_INITIAL_VERSION, EXPLORATION_INITIAL_SQL),
    (EXPLORATION_SERVICES_VERSION, EXPLORATION_SERVICES_SQL),
)


def apply_sqlite_migrations(connection: sqlite3.Connection) -> None:
    """Aplica migraciones SQLite pendientes.

    Proposito:
    - versionar cambios de schema
    - evitar depender de inicializaciones implicitas dispersas
    - mantener una ruta futura para migraciones incrementales

    Seguridad:
    - las migraciones son SQL interno controlado por la aplicacion
    - no se concatena input de usuario
    """

    connection.execute("PRAGMA foreign_keys = ON")
    _ensure_schema_migrations_table(connection)

    applied_versions = _get_applied_versions(connection)

    for version, sql in MIGRATIONS:
        if version in applied_versions:
            continue

        connection.executescript(sql)
        connection.execute(
            """
            INSERT INTO schema_migrations (version, applied_at)
            VALUES (?, ?)
            """,
            (version, datetime.now(UTC).isoformat()),
        )


def _ensure_schema_migrations_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        )
        """
    )


def _get_applied_versions(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        "SELECT version FROM schema_migrations ORDER BY version ASC"
    ).fetchall()

    return {row[0] for row in rows}
