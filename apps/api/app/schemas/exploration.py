from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, StrictStr


class AssetKind(StrEnum):
    HOST = "host"
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    SERVICE = "service"


class AssetEnvironment(StrEnum):
    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"
    UNKNOWN = "unknown"


class AssetCriticality(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingSeverity(StrEnum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingStatus(StrEnum):
    OPEN = "open"
    TRIAGED = "triaged"
    ACCEPTED = "accepted"
    FIXED = "fixed"
    FALSE_POSITIVE = "false_positive"


class FindingSource(StrEnum):
    MANUAL = "manual"
    IMPORT = "import"
    SCANNER = "scanner"


class AssetCreate(BaseModel):
    """Payload para crear un asset manual."""

    model_config = ConfigDict(extra="forbid")

    name: StrictStr = Field(min_length=1)
    kind: AssetKind
    value: StrictStr = Field(min_length=1)
    environment: AssetEnvironment = AssetEnvironment.UNKNOWN
    criticality: AssetCriticality = AssetCriticality.MEDIUM


class AssetRead(AssetCreate):
    """Asset devuelto por la API."""

    id: StrictStr
    createdAt: datetime
    updatedAt: datetime


class FindingCreate(BaseModel):
    """Payload para crear un finding manual."""

    model_config = ConfigDict(extra="forbid")

    title: StrictStr = Field(min_length=1)
    description: StrictStr = ""
    severity: FindingSeverity
    status: FindingStatus = FindingStatus.OPEN
    assetId: StrictStr | None = None
    source: FindingSource = FindingSource.MANUAL
    evidence: StrictStr = ""
    recommendation: StrictStr = ""


class FindingRead(FindingCreate):
    """Finding devuelto por la API."""

    id: StrictStr
    createdAt: datetime
    updatedAt: datetime


class AssetListResponse(BaseModel):
    items: list[AssetRead]


class FindingListResponse(BaseModel):
    items: list[FindingRead]
