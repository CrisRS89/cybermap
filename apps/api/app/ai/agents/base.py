from dataclasses import dataclass, field
from typing import Protocol

from app.ai.providers.base import AIProvider


@dataclass(frozen=True)
class AgentContext:
    """Contexto normalizado que recibe un agente.

    Propósito:
    - evitar que cada agente consulte la base de datos por su cuenta;
    - entregar datos ya filtrados y autorizados;
    - facilitar auditoría y tests.
    """

    assets: list[dict]
    services: list[dict]
    findings: list[dict]
    task: str


@dataclass(frozen=True)
class AgentRecommendation:
    """Recomendación estructurada emitida por un agente."""

    title: str
    severity: str
    rationale: str
    suggested_finding: bool = False


@dataclass(frozen=True)
class AgentResult:
    """Resultado normalizado emitido por un agente."""

    agent_id: str
    provider_id: str
    model: str
    summary: str
    recommendations: list[AgentRecommendation] = field(default_factory=list)


class Agent(Protocol):
    """Contrato mínimo para agentes CyberMap."""

    agent_id: str

    def run(
        self,
        context: AgentContext,
        provider: AIProvider,
        model: str,
    ) -> AgentResult:
        """Ejecuta el agente con contexto autorizado y proveedor IA."""
