import sqlite3

import pytest

from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.schemas.exploration import AssetCreate, FindingCreate


def test_sqlite_repository_starts_empty(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    assert repository.list_assets() == []
    assert repository.list_findings() == []


def test_sqlite_repository_creates_and_lists_asset(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    created = repository.create_asset(
        AssetCreate(
            name="Localhost",
            kind="host",
            value="localhost",
            environment="dev",
            criticality="medium",
        )
    )

    assets = repository.list_assets()

    assert created.id.startswith("asset_")
    assert len(assets) == 1
    assert assets[0].id == created.id
    assert assets[0].name == "Localhost"
    assert assets[0].kind == "host"


def test_sqlite_repository_persists_assets_between_instances(tmp_path):
    database_path = tmp_path / "cybermap.db"

    first = ExplorationSQLiteRepository(database_path)
    first.create_asset(
        AssetCreate(
            name="Example",
            kind="domain",
            value="example.com",
        )
    )

    second = ExplorationSQLiteRepository(database_path)

    assert len(second.list_assets()) == 1
    assert second.list_assets()[0].value == "example.com"


def test_sqlite_repository_creates_and_lists_finding_without_asset(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    created = repository.create_finding(
        FindingCreate(
            title="Example finding",
            severity="medium",
            status="open",
            source="manual",
            evidence="example evidence",
        )
    )

    findings = repository.list_findings()

    assert created.id.startswith("finding_")
    assert len(findings) == 1
    assert findings[0].id == created.id
    assert findings[0].title == "Example finding"
    assert findings[0].assetId is None


def test_sqlite_repository_creates_finding_with_existing_asset(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    asset = repository.create_asset(
        AssetCreate(
            name="Localhost",
            kind="host",
            value="localhost",
        )
    )

    finding = repository.create_finding(
        FindingCreate(
            title="Associated finding",
            severity="high",
            assetId=asset.id,
        )
    )

    findings = repository.list_findings()

    assert finding.assetId == asset.id
    assert findings[0].assetId == asset.id


def test_sqlite_repository_rejects_finding_with_missing_asset(tmp_path):
    repository = ExplorationSQLiteRepository(tmp_path / "cybermap.db")

    with pytest.raises(sqlite3.IntegrityError):
        repository.create_finding(
            FindingCreate(
                title="Invalid association",
                severity="high",
                assetId="asset_missing",
            )
        )


def test_sqlite_repository_persists_findings_between_instances(tmp_path):
    database_path = tmp_path / "cybermap.db"

    first = ExplorationSQLiteRepository(database_path)
    first.create_finding(
        FindingCreate(
            title="Persisted finding",
            severity="high",
        )
    )

    second = ExplorationSQLiteRepository(database_path)

    assert len(second.list_findings()) == 1
    assert second.list_findings()[0].title == "Persisted finding"


def test_sqlite_repository_preserves_existing_data_after_reinitialization(tmp_path):
    database_path = tmp_path / "cybermap.db"

    first = ExplorationSQLiteRepository(database_path)
    asset = first.create_asset(
        AssetCreate(
            name="Existing Asset",
            kind="host",
            value="existing.local",
        )
    )

    second = ExplorationSQLiteRepository(database_path)
    assets = second.list_assets()

    assert len(assets) == 1
    assert assets[0].id == asset.id
    assert assets[0].name == "Existing Asset"


def test_sqlite_repository_does_not_duplicate_migration_records(tmp_path):
    database_path = tmp_path / "cybermap.db"

    ExplorationSQLiteRepository(database_path)
    ExplorationSQLiteRepository(database_path)

    import sqlite3

    with sqlite3.connect(database_path) as connection:
        rows = connection.execute(
            """
            SELECT version, COUNT(*)
            FROM schema_migrations
            GROUP BY version
            """
        ).fetchall()

    assert rows == [("001_exploration_initial", 1)]
