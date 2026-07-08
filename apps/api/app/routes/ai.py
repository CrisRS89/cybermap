from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.ai.agents.base import AgentContext, AgentResult
from app.ai.orchestrator import AIOrchestrator
from app.repositories.ai_runs_sqlite_repository import AiRunsSQLiteRepository
from app.routes.exploration import get_exploration_service
from app.schemas.ai import (
    AgentRecommendationResponse,
    AgentRunEvidenceUsed,
    AgentRunRequest,
    AgentRunResponse,
    AgentRunStatus,
)
from app.schemas.ai_run import AiRunCreate, AiRunListResponse

router = APIRouter(prefix="/ai", tags=["ai"])


def get_ai_runs_repository() -> AiRunsSQLiteRepository:
    """Crea el repositorio SQLite de ejecuciones IA.

    Se usa la misma base local que Exploration para mantener trazabilidad
    entre evidencia y análisis generados.
    """

    api_root = Path(__file__).resolve().parents[2]
    return AiRunsSQLiteRepository(api_root / "data" / "cybermap.db")


@router.get("/runs", response_model=AiRunListResponse)
def list_ai_runs() -> AiRunListResponse:
    """Lista ejecuciones IA persistidas.

    Propósito:
    - exponer historial básico de análisis;
    - permitir auditoría y trazabilidad;
    - preparar UI futura de historial IA.
    """

    repository = get_ai_runs_repository()
    return AiRunListResponse(items=repository.list_ai_runs())


@router.post("/runs", response_model=AgentRunResponse)
def run_ai_agent(payload: AgentRunRequest) -> AgentRunResponse:
    """Ejecuta un agente IA con contexto controlado y persiste la ejecución.

    Seguridad:
    - no ejecuta comandos del sistema;
    - no ejecuta escaneos activos;
    - no llama a proveedores reales en esta fase;
    - usa provider mock por defecto mediante el orquestador;
    - limita evidencia según scope;
    - persiste solo resultados estructurados.
    """

    repository = get_exploration_service()
    ai_runs_repository = get_ai_runs_repository()
    context = _build_agent_context(payload, repository)
    orchestrator = AIOrchestrator()

    try:
        result = orchestrator.run_agent(
            agent_id=payload.agentId,
            provider_id=payload.providerId,
            model=payload.model,
            context=context,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    evidence_used = AgentRunEvidenceUsed(
        assets=len(context.assets),
        services=len(context.services),
        findings=len(context.findings),
    )

    persisted_run = ai_runs_repository.create_ai_run(
        AiRunCreate(
            agentId=result.agent_id,
            providerId=result.provider_id,
            model=result.model,
            task=payload.task,
            status=AgentRunStatus.COMPLETED,
            summary=result.summary,
            recommendations=[
                {
                    "title": recommendation.title,
                    "severity": recommendation.severity,
                    "rationale": recommendation.rationale,
                    "suggestedFinding": recommendation.suggested_finding,
                }
                for recommendation in result.recommendations
            ],
            evidenceUsed=evidence_used,
        )
    )

    return _agent_result_to_response(
        run_id=persisted_run.id,
        result=result,
        evidence_used=evidence_used,
    )


def _build_agent_context(
    payload: AgentRunRequest,
    repository,
) -> AgentContext:
    """Construye contexto de agente a partir de Exploration.

    Decisión:
    - el agente no consulta DB directamente;
    - la ruta selecciona y filtra evidencia;
    - `assetIds` funciona como scope restrictivo.
    """

    assets = repository.list_assets() if payload.scope.includeAssets else []
    services = repository.list_services() if payload.scope.includeServices else []
    findings = repository.list_findings() if payload.scope.includeFindings else []

    allowed_asset_ids = set(payload.scope.assetIds)

    if allowed_asset_ids:
        assets = [asset for asset in assets if asset.id in allowed_asset_ids]
        services = [
            service for service in services if service.assetId in allowed_asset_ids
        ]
        findings = [
            finding
            for finding in findings
            if finding.assetId is not None and finding.assetId in allowed_asset_ids
        ]

    return AgentContext(
        task=payload.task,
        assets=[asset.model_dump(mode="json") for asset in assets],
        services=[service.model_dump(mode="json") for service in services],
        findings=[finding.model_dump(mode="json") for finding in findings],
    )


def _agent_result_to_response(
    run_id: str,
    result: AgentResult,
    evidence_used: AgentRunEvidenceUsed,
) -> AgentRunResponse:
    """Convierte resultado interno de agente a contrato HTTP."""

    return AgentRunResponse(
        runId=run_id,
        agentId=result.agent_id,
        providerId=result.provider_id,
        model=result.model,
        status=AgentRunStatus.COMPLETED,
        summary=result.summary,
        recommendations=[
            AgentRecommendationResponse(
                title=recommendation.title,
                severity=recommendation.severity,
                rationale=recommendation.rationale,
                suggestedFinding=recommendation.suggested_finding,
            )
            for recommendation in result.recommendations
        ],
        evidenceUsed=evidence_used,
    )
