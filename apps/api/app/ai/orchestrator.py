import os

from app.ai.agents.base import Agent, AgentContext, AgentResult
from app.ai.agents.exploration_analyst import ExplorationAnalystAgent
from app.ai.providers.base import AIProvider
from app.ai.providers.mock_provider import MockAIProvider
from app.ai.providers.openai_compatible_provider import OpenAICompatibleProvider


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
        self._providers = providers or _configured_providers()
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


def _configured_providers() -> dict[str, AIProvider]:
    """Construye proveedores a partir de configuración del servidor.

    Las claves API nunca llegan desde Settings ni desde el navegador. El mock
    permanece disponible para desarrollo sin proveedor externo.
    """

    providers: dict[str, AIProvider] = {"mock": MockAIProvider()}
    configurations = [
        ("openai", "OPENAI_BASE_URL", "OPENAI_API_KEY", "https://api.openai.com/v1"),
        ("openrouter", "OPENROUTER_BASE_URL", "OPENROUTER_API_KEY", "https://openrouter.ai/api/v1"),
        ("ollama", "OLLAMA_BASE_URL", None, "http://localhost:11434/v1"),
        ("lm_studio", "LM_STUDIO_BASE_URL", None, "http://localhost:1234/v1"),
        ("custom", "CYBERMAP_AI_CUSTOM_BASE_URL", "CYBERMAP_AI_CUSTOM_API_KEY", None),
    ]

    for provider_id, base_url_variable, key_variable, default_base_url in configurations:
        base_url = os.getenv(base_url_variable, default_base_url)
        api_key = os.getenv(key_variable) if key_variable else None

        if not base_url or (key_variable and not api_key):
            continue

        providers[provider_id] = OpenAICompatibleProvider(
            provider_id=provider_id,
            base_url=base_url,
            api_key=api_key,
        )

    return providers
