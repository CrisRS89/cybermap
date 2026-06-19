from app.schemas.exploration import AssetCreate, FindingCreate
from app.services.exploration_service import ExplorationService


def test_create_and_list_asset(tmp_path):
    service = ExplorationService(tmp_path)

    created = service.create_asset(
        AssetCreate(
            name="Localhost",
            kind="host",
            value="localhost",
            environment="dev",
            criticality="medium",
        )
    )

    assets = service.list_assets()

    assert created.id.startswith("asset_")
    assert len(assets) == 1
    assert assets[0].id == created.id
    assert assets[0].name == "Localhost"
    assert assets[0].kind == "host"


def test_create_and_list_finding(tmp_path):
    service = ExplorationService(tmp_path)

    created = service.create_finding(
        FindingCreate(
            title="Example finding",
            severity="medium",
            status="open",
            source="manual",
            evidence="example evidence",
        )
    )

    findings = service.list_findings()

    assert created.id.startswith("finding_")
    assert len(findings) == 1
    assert findings[0].id == created.id
    assert findings[0].title == "Example finding"
    assert findings[0].severity == "medium"


def test_service_starts_empty(tmp_path):
    service = ExplorationService(tmp_path)

    assert service.list_assets() == []
    assert service.list_findings() == []


def test_service_persists_assets_between_instances(tmp_path):
    first = ExplorationService(tmp_path)
    first.create_asset(
        AssetCreate(
            name="Example",
            kind="domain",
            value="example.com",
        )
    )

    second = ExplorationService(tmp_path)

    assert len(second.list_assets()) == 1
    assert second.list_assets()[0].value == "example.com"


def test_service_persists_findings_between_instances(tmp_path):
    first = ExplorationService(tmp_path)
    first.create_finding(
        FindingCreate(
            title="Persisted finding",
            severity="high",
        )
    )

    second = ExplorationService(tmp_path)

    assert len(second.list_findings()) == 1
    assert second.list_findings()[0].title == "Persisted finding"
