from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, StrictStr

from app.schemas.ai import AgentRunEvidenceUsed, AgentRunStatus


class AiRunCreate(BaseModel):
    """Payload interno para persistir una ejecución IA.

    Propósito:
    - separar contrato HTTP de contrato de persistencia;
    - guardar recomendaciones como estructura validada antes de serializar;
    - mantener trazabilidad mínima de agente, provider, modelo y tarea.
    """

    model_config = ConfigDict(extra="forbid")

    agentId: StrictStr = Field(min_length=1)
    providerId: StrictStr = Field(min_length=1)
    model: StrictStr = Field(min_length=1)
    task: StrictStr = Field(min_length=1)
    status: AgentRunStatus
    summary: StrictStr
    recommendations: list[dict[str, Any]]
    evidenceUsed: AgentRunEvidenceUsed


class AiRunRead(BaseModel):
    """Ejecución IA leída desde SQLite."""

    model_config = ConfigDict(extra="forbid")

    id: StrictStr
    agentId: StrictStr
    providerId: StrictStr
    model: StrictStr
    task: StrictStr
    status: AgentRunStatus
    summary: StrictStr
    recommendations: list[dict[str, Any]]
    evidenceUsed: AgentRunEvidenceUsed
    createdAt: datetime
    updatedAt: datetime


class AiRunListResponse(BaseModel):
    """Respuesta HTTP para listar ejecuciones IA persistidas."""

    model_config = ConfigDict(extra="forbid")

    items: list[AiRunRead]
