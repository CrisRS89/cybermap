from app.ai.agents.base import Agent, AgentContext, AgentResult
from app.ai.agents.exploration_analyst import ExplorationAnalystAgent
from app.ai.providers.base import AIProvider
from app.ai.providers.mock_provider import MockAIProvider


class AIOrchestrator:
    """Orquestador central de agentes IA.

    Responsabilidad:
    - resolver agente;
    - resolver proveedor;
    - ejecutar el flujo;
    - mantener desacoplados módulos funcionales y proveedores externos.
    """

    def __init__(
        self,
        providers: dict[str, AIProvider] | None = None,
        agents: dict[str, Agent] | None = None,
    ) -> None:
        self._providers = providers or {
            "mock": MockAIProvider(),
        }
        self._agents = agents or {
            "exploration_analyst": ExplorationAnalystAgent(),
        }

    def run_agent(
        self,
        agent_id: str,
        provider_id: str,
        model: str,
        context: AgentContext,
    ) -> AgentResult:
        """Ejecuta un agente con proveedor y contexto explícitos."""

        agent = self._agents.get(agent_id)

        if agent is None:
            raise ValueError(f"Unknown agent: {agent_id}")

        provider = self._providers.get(provider_id)

        if provider is None:
            raise ValueError(f"Unknown provider: {provider_id}")

        return agent.run(
            context=context,
            provider=provider,
            model=model,
        )
