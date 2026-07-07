import sqlite3

from app.storage.sqlite_migrations import (
    EXPLORATION_INITIAL_VERSION,
    EXPLORATION_SERVICES_VERSION,
    apply_sqlite_migrations,
)


def test_sqlite_migrations_create_schema_migrations_table(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)

        rows = connection.execute(
            """
            SELECT version
            FROM schema_migrations
            ORDER BY version ASC
            """
        ).fetchall()

    assert rows == [
        (EXPLORATION_INITIAL_VERSION,),
        (EXPLORATION_SERVICES_VERSION,),
    ]


def test_sqlite_migrations_create_exploration_tables(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)

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

    assert "schema_migrations" in tables
    assert "exploration_assets" in tables
    assert "exploration_findings" in tables
    assert "exploration_services" in tables


def test_sqlite_migrations_are_idempotent(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)
        apply_sqlite_migrations(connection)

        rows = connection.execute(
            """
            SELECT version
            FROM schema_migrations
            WHERE version = ?
            """,
            (EXPLORATION_INITIAL_VERSION,),
        ).fetchall()

    assert len(rows) == 1


def test_sqlite_migrations_create_expected_indexes(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)

        indexes = {
            row[0]
            for row in connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'index'
                """
            ).fetchall()
        }

    assert "idx_exploration_assets_kind" in indexes
    assert "idx_exploration_findings_severity" in indexes
    assert "idx_exploration_findings_status" in indexes
    assert "idx_exploration_findings_asset_id" in indexes
    assert "idx_exploration_services_asset_id" in indexes
    assert "idx_exploration_services_port" in indexes
    assert "idx_exploration_services_asset_protocol_port" in indexes


def test_sqlite_migrations_create_services_foreign_key(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)

        foreign_keys = connection.execute(
            """
            PRAGMA foreign_key_list(exploration_services)
            """
        ).fetchall()

    assert any(
        row[2] == "exploration_assets"
        and row[3] == "asset_id"
        and row[4] == "id"
        and row[6].upper() == "CASCADE"
        for row in foreign_keys
    )


def test_sqlite_migrations_enforce_unique_service_per_asset_protocol_port(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)
        connection.execute("PRAGMA foreign_keys = ON")

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
                "asset_1",
                "Web server",
                "ip",
                "192.168.1.10",
                "unknown",
                "medium",
                "2026-01-01T00:00:00+00:00",
                "2026-01-01T00:00:00+00:00",
            ),
        )

        service_values = (
            "service_1",
            "asset_1",
            "tcp",
            80,
            "http",
            None,
            None,
            "open",
            "nmap",
            "2026-01-01T00:00:00+00:00",
            "2026-01-01T00:00:00+00:00",
        )

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
            service_values,
        )

        try:
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
                    "service_2",
                    "asset_1",
                    "tcp",
                    80,
                    "http",
                    None,
                    None,
                    "open",
                    "nmap",
                    "2026-01-01T00:00:00+00:00",
                    "2026-01-01T00:00:00+00:00",
                ),
            )
        except sqlite3.IntegrityError:
            duplicated = True
        else:
            duplicated = False

    assert duplicated is True


def test_sqlite_migrations_ignore_duplicate_version_registration(tmp_path):
    database_path = tmp_path / "cybermap.db"

    with sqlite3.connect(database_path) as connection:
        apply_sqlite_migrations(connection)

        connection.execute(
            """
            INSERT OR IGNORE INTO schema_migrations (version, applied_at)
            VALUES (?, ?)
            """,
            (EXPLORATION_INITIAL_VERSION, "2026-01-01T00:00:00+00:00"),
        )

        apply_sqlite_migrations(connection)

        rows = connection.execute(
            """
            SELECT version, COUNT(*)
            FROM schema_migrations
            GROUP BY version
            ORDER BY version ASC
            """
        ).fetchall()

    assert rows == [
        (EXPLORATION_INITIAL_VERSION, 1),
        (EXPLORATION_SERVICES_VERSION, 1),
    ]
