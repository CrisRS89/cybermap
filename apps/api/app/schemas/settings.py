from typing import Any

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictStr


class SettingsValues(BaseModel):
    """Valores conocidos de CyberMap settings.

    Propósito:
    - mantener compatibilidad con payloads parciales
    - rechazar campos desconocidos
    - validar tipos básicos antes de persistir JSON local
    """

    model_config = ConfigDict(extra="forbid")

    theme: StrictStr | None = None
    background: StrictStr | None = None
    language: StrictStr | None = None
    aiProvider: StrictStr | None = None
    aiModel: StrictStr | None = None
    aiBaseUrl: StrictStr | None = None
    thinkingMode: StrictStr | None = None
    aiTemperature: StrictStr | None = None
    aiMaxTokens: StrictStr | None = None
    aiPrivacyMode: StrictStr | None = None
    aiApiKeyConfigured: StrictBool | None = None
    agentPreset: StrictStr | None = None
    agentIntegrationType: StrictStr | None = None
    agentCommand: StrictStr | None = None
    agentWorkingDirectory: StrictStr | None = None
    agentTimeoutSeconds: StrictStr | None = None
    agentRequiresApproval: StrictBool | None = None
    agentSandboxEnabled: StrictBool | None = None
    agentNetworkAccess: StrictBool | None = None
    mcpEnabled: StrictBool | None = None
    mcpServerName: StrictStr | None = None
    mcpTransport: StrictStr | None = None
    mcpCommand: StrictStr | None = None
    mcpArgs: StrictStr | None = None
    mcpUrl: StrictStr | None = None
    mcpAllowedTools: StrictStr | None = None
    mcpRequiresApproval: StrictBool | None = None
    connectorEnabled: StrictBool | None = None
    connectorPreset: StrictStr | None = None
    connectorBaseUrl: StrictStr | None = None
    connectorAuthMode: StrictStr | None = None
    connectorSecretConfigured: StrictBool | None = None
    connectorSyncIntervalMinutes: StrictStr | None = None
    connectorIngestFindings: StrictBool | None = None
    connectorIngestAssets: StrictBool | None = None
    connectorRequiresApproval: StrictBool | None = None
    requireHumanApproval: StrictBool | None = None
    sandboxEnabled: StrictBool | None = None
    auditLogsEnabled: StrictBool | None = None


class SettingsPayload(BaseModel):
    """Payload recibido por PUT /settings."""

    values: SettingsValues = Field(default_factory=SettingsValues)


class SettingsResponse(BaseModel):
    values: dict[str, Any]
