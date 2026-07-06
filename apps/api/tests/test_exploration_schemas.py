import pytest
from pydantic import ValidationError

from app.schemas.exploration import (
    AssetCreate,
    ExplorationServiceCreate,
    FindingCreate,
    ServiceProtocol,
    ServiceSource,
    ServiceState,
)


def test_asset_create_accepts_valid_payload():
    asset = AssetCreate(
        name="Localhost",
        kind="host",
        value="localhost",
        environment="dev",
        criticality="medium",
    )

    assert asset.name == "Localhost"
    assert asset.kind == "host"
    assert asset.value == "localhost"


def test_asset_create_rejects_unknown_fields():
    with pytest.raises(ValidationError):
        AssetCreate(
            name="Localhost",
            kind="host",
            value="localhost",
            unexpected=True,
        )


def test_asset_create_rejects_empty_name():
    with pytest.raises(ValidationError):
        AssetCreate(
            name="",
            kind="host",
            value="localhost",
        )


def test_finding_create_accepts_valid_payload():
    finding = FindingCreate(
        title="Example finding",
        severity="medium",
        status="open",
        source="manual",
    )

    assert finding.title == "Example finding"
    assert finding.severity == "medium"
    assert finding.status == "open"
    assert finding.source == "manual"


def test_finding_create_rejects_invalid_severity():
    with pytest.raises(ValidationError):
        FindingCreate(
            title="Example finding",
            severity="danger",
            status="open",
            source="manual",
        )


def test_finding_create_rejects_unknown_fields():
    with pytest.raises(ValidationError):
        FindingCreate(
            title="Example finding",
            severity="medium",
            status="open",
            source="manual",
            command="rm -rf /",
        )


def test_exploration_service_create_accepts_valid_payload():
    service = ExplorationServiceCreate(
        assetId="asset_123",
        protocol=ServiceProtocol.TCP,
        port=443,
        name="https",
        product="nginx",
        version="1.24.0",
        source=ServiceSource.NMAP,
    )

    assert service.assetId == "asset_123"
    assert service.protocol == ServiceProtocol.TCP
    assert service.port == 443
    assert service.name == "https"
    assert service.product == "nginx"
    assert service.version == "1.24.0"
    assert service.state == ServiceState.OPEN
    assert service.source == ServiceSource.NMAP


def test_exploration_service_create_rejects_invalid_port():
    with pytest.raises(ValueError):
        ExplorationServiceCreate(
            assetId="asset_123",
            protocol=ServiceProtocol.TCP,
            port=70000,
        )


def test_exploration_service_create_requires_asset_id():
    with pytest.raises(ValueError):
        ExplorationServiceCreate(
            assetId="   ",
            protocol=ServiceProtocol.TCP,
            port=80,
        )


def test_exploration_service_create_normalizes_optional_empty_text():
    service = ExplorationServiceCreate(
        assetId=" asset_123 ",
        protocol=ServiceProtocol.TCP,
        port=80,
        name="   ",
        product="",
        version=None,
    )

    assert service.assetId == "asset_123"
    assert service.name is None
    assert service.product is None
    assert service.version is None
