import pytest
from pydantic import ValidationError

from app.schemas.exploration import AssetCreate, FindingCreate


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
