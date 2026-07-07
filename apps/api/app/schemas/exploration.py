from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, StrictStr, field_validator


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


class ServiceProtocol(StrEnum):
    TCP = "tcp"
    UDP = "udp"


class ServiceState(StrEnum):
    OPEN = "open"


class ServiceSource(StrEnum):
    MANUAL = "manual"
    NMAP = "nmap"


class ExplorationServiceCreate(BaseModel):
    """Payload para crear un servicio detectado asociado a un asset."""

    model_config = ConfigDict(extra="forbid")

    assetId: StrictStr
    protocol: ServiceProtocol
    port: int
    name: StrictStr | None = None
    product: StrictStr | None = None
    version: StrictStr | None = None
    state: ServiceState = ServiceState.OPEN
    source: ServiceSource = ServiceSource.MANUAL

    @field_validator("assetId")
    @classmethod
    def asset_id_must_not_be_empty(cls, value: str) -> str:
        """Evita servicios sin relación con un asset existente."""

        normalized = value.strip()

        if not normalized:
            raise ValueError("assetId is required")

        return normalized

    @field_validator("port")
    @classmethod
    def port_must_be_valid(cls, value: int) -> int:
        """Valida el rango TCP/UDP estándar."""

        if value < 1 or value > 65535:
            raise ValueError("port must be between 1 and 65535")

        return value

    @field_validator("name", "product", "version")
    @classmethod
    def optional_text_must_be_normalized(cls, value: str | None) -> str | None:
        """Normaliza textos opcionales vacíos a None."""

        if value is None:
            return None

        normalized = value.strip()

        if not normalized:
            return None

        return normalized


class ExplorationServiceRead(ExplorationServiceCreate):
    """Servicio detectado persistido y devuelto por la API."""

    id: StrictStr
    createdAt: datetime
    updatedAt: datetime


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


class ExplorationServiceListResponse(BaseModel):
    items: list[ExplorationServiceRead]
