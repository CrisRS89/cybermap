import sqlite3

from app.storage.sqlite_migrations import (
    EXPLORATION_INITIAL_VERSION,
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

    assert rows == [(EXPLORATION_INITIAL_VERSION,)]


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
