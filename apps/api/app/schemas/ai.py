from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictStr, field_validator


class AgentRunStatus(StrEnum):
    """Estados observables de una ejecución de agente IA."""

    COMPLETED = "completed"
    FAILED = "failed"


class AgentRunScope(BaseModel):
    """Scope de evidencia permitido para una ejecución IA.

    Propósito:
    - evitar que el agente acceda a todo por defecto sin control explícito;
    - preparar filtros por asset;
    - permitir activar/desactivar tipos de evidencia.
    """

    model_config = ConfigDict(extra="forbid")

    assetIds: list[StrictStr] = Field(default_factory=list)
    includeAssets: StrictBool = True
    includeServices: StrictBool = True
    includeFindings: StrictBool = True

    @field_validator("assetIds")
    @classmethod
    def asset_ids_must_not_contain_empty_values(
        cls,
        values: list[str],
    ) -> list[str]:
        """Normaliza IDs y rechaza strings vacíos."""

        normalized_values = [value.strip() for value in values]

        if any(not value for value in normalized_values):
            raise ValueError("assetIds must not contain empty values")

        return normalized_values


class AgentRunRequest(BaseModel):
    """Request HTTP para ejecutar un agente IA.

    Decisión:
    - `providerId` permite usar mock, OpenAI, Gemini, Claude, OpenRouter u Ollama;
    - `model` queda explícito para auditar qué modelo se usó;
    - `task` representa la intención del usuario;
    - `scope` limita qué evidencia puede entrar al contexto.
    """

    model_config = ConfigDict(extra="forbid")

    agentId: StrictStr = Field(min_length=1)
    providerId: StrictStr = Field(min_length=1)
    model: StrictStr = Field(min_length=1)
    task: StrictStr = Field(min_length=1)
    scope: AgentRunScope = Field(default_factory=AgentRunScope)

    @field_validator("agentId", "providerId", "model", "task")
    @classmethod
    def text_fields_must_not_be_blank(cls, value: str) -> str:
        """Evita campos compuestos solo por espacios."""

        normalized = value.strip()

        if not normalized:
            raise ValueError("field must not be blank")

        return normalized


class AgentRecommendationResponse(BaseModel):
    """Recomendación HTTP emitida por un agente."""

    model_config = ConfigDict(extra="forbid")

    title: StrictStr
    severity: StrictStr
    rationale: StrictStr
    suggestedFinding: StrictBool = False


class AgentRunEvidenceUsed(BaseModel):
    """Resumen cuantitativo de evidencia usada por el agente."""

    model_config = ConfigDict(extra="forbid")

    assets: int
    services: int
    findings: int


class AgentRunResponse(BaseModel):
    """Response HTTP de una ejecución de agente IA."""

    model_config = ConfigDict(extra="forbid")

    agentId: StrictStr
    providerId: StrictStr
    model: StrictStr
    status: AgentRunStatus
    summary: StrictStr
    recommendations: list[AgentRecommendationResponse]
    evidenceUsed: AgentRunEvidenceUsed
