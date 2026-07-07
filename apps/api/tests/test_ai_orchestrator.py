import pytest

from app.ai.agents.base import AgentContext
from app.ai.orchestrator import AIOrchestrator


def test_ai_orchestrator_runs_exploration_analyst_with_mock_provider():
    orchestrator = AIOrchestrator()

    result = orchestrator.run_agent(
        agent_id="exploration_analyst",
        provider_id="mock",
        model="mock-security-model",
        context=AgentContext(
            task="Analizar superficie detectada",
            assets=[
                {
                    "id": "asset_1",
                    "name": "web-01.local",
                    "kind": "ip",
                    "value": "192.168.1.10",
                }
            ],
            services=[
                {
                    "id": "service_1",
                    "assetId": "asset_1",
                    "protocol": "tcp",
                    "port": 443,
                    "name": "https",
                    "product": "nginx",
                    "version": "1.24.0",
                    "state": "open",
                    "source": "nmap",
                }
            ],
            findings=[],
        ),
    )

    assert result.agent_id == "exploration_analyst"
    assert result.provider_id == "mock"
    assert result.model == "mock-security-model"
    assert "Análisis mock generado por CyberMap" in result.summary
    assert len(result.recommendations) == 1
    assert result.recommendations[0].title == (
        "Revisar exposición de servicios HTTP/HTTPS"
    )
    assert result.recommendations[0].severity == "medium"
    assert result.recommendations[0].suggested_finding is True


def test_ai_orchestrator_rejects_unknown_agent():
    orchestrator = AIOrchestrator()

    with pytest.raises(ValueError, match="Unknown agent"):
        orchestrator.run_agent(
            agent_id="missing_agent",
            provider_id="mock",
            model="mock-security-model",
            context=AgentContext(
                task="Analizar",
                assets=[],
                services=[],
                findings=[],
            ),
        )


def test_ai_orchestrator_rejects_unknown_provider():
    orchestrator = AIOrchestrator()

    with pytest.raises(ValueError, match="Unknown provider"):
        orchestrator.run_agent(
            agent_id="exploration_analyst",
            provider_id="missing_provider",
            model="mock-security-model",
            context=AgentContext(
                task="Analizar",
                assets=[],
                services=[],
                findings=[],
            ),
        )
