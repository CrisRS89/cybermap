import pytest
from pydantic import ValidationError

from app.schemas.ai import (
    AgentRecommendationResponse,
    AgentRunEvidenceUsed,
    AgentRunRequest,
    AgentRunResponse,
    AgentRunScope,
    AgentRunStatus,
)


def test_agent_run_request_accepts_minimal_valid_payload():
    payload = AgentRunRequest(
        agentId="exploration_analyst",
        providerId="mock",
        model="mock-security-model",
        task="Analizar superficie detectada",
    )

    assert payload.agentId == "exploration_analyst"
    assert payload.providerId == "mock"
    assert payload.model == "mock-security-model"
    assert payload.task == "Analizar superficie detectada"
    assert payload.scope.assetIds == []
    assert payload.scope.includeAssets is True
    assert payload.scope.includeServices is True
    assert payload.scope.includeFindings is True


def test_agent_run_request_normalizes_text_fields():
    payload = AgentRunRequest(
        agentId=" exploration_analyst ",
        providerId=" mock ",
        model=" mock-security-model ",
        task=" Analizar superficie detectada ",
    )

    assert payload.agentId == "exploration_analyst"
    assert payload.providerId == "mock"
    assert payload.model == "mock-security-model"
    assert payload.task == "Analizar superficie detectada"


def test_agent_run_request_rejects_blank_required_fields():
    with pytest.raises(ValidationError):
        AgentRunRequest(
            agentId=" ",
            providerId="mock",
            model="mock-security-model",
            task="Analizar",
        )


def test_agent_run_request_rejects_extra_fields():
    with pytest.raises(ValidationError):
        AgentRunRequest(
            agentId="exploration_analyst",
            providerId="mock",
            model="mock-security-model",
            task="Analizar",
            unexpected=True,
        )


def test_agent_run_scope_rejects_empty_asset_ids():
    with pytest.raises(ValidationError):
        AgentRunScope(assetIds=["asset_1", " "])


def test_agent_run_scope_rejects_extra_fields():
    with pytest.raises(ValidationError):
        AgentRunScope(
            includeAssets=True,
            includeServices=True,
            includeFindings=True,
            unexpected=True,
        )


def test_agent_run_response_serializes_http_contract():
    response = AgentRunResponse(
        runId="ai_run_1",
        agentId="exploration_analyst",
        providerId="mock",
        model="mock-security-model",
        status=AgentRunStatus.COMPLETED,
        summary="Análisis generado correctamente.",
        recommendations=[
            AgentRecommendationResponse(
                title="Revisar exposición HTTP",
                severity="medium",
                rationale="Se detectó un servicio web expuesto.",
                suggestedFinding=True,
            )
        ],
        evidenceUsed=AgentRunEvidenceUsed(
            assets=1,
            services=1,
            findings=0,
        ),
    )

    assert response.model_dump(mode="json") == {
        "runId": "ai_run_1",
        "agentId": "exploration_analyst",
        "providerId": "mock",
        "model": "mock-security-model",
        "status": "completed",
        "summary": "Análisis generado correctamente.",
        "recommendations": [
            {
                "title": "Revisar exposición HTTP",
                "severity": "medium",
                "rationale": "Se detectó un servicio web expuesto.",
                "suggestedFinding": True,
            }
        ],
        "evidenceUsed": {
            "assets": 1,
            "services": 1,
            "findings": 0,
        },
    }
