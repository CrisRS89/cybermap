from pathlib import Path

from fastapi import APIRouter

from app.schemas.exploration import (
    AssetCreate,
    AssetListResponse,
    AssetRead,
    FindingCreate,
    FindingListResponse,
    FindingRead,
)
from app.services.exploration_service import ExplorationService

router = APIRouter(prefix="/exploration", tags=["exploration"])


def get_exploration_service() -> ExplorationService:
    """Crea el servicio de Exploration usando storage local del MVP.

    La ruta se resuelve desde este archivo para evitar depender del
    directorio actual desde donde se ejecute Uvicorn.
    """

    api_root = Path(__file__).resolve().parents[2]
    return ExplorationService(api_root / "data")


@router.get("/assets", response_model=AssetListResponse)
def list_assets() -> AssetListResponse:
    """Lista assets registrados."""

    service = get_exploration_service()
    return AssetListResponse(items=service.list_assets())


@router.post("/assets", response_model=AssetRead)
def create_asset(payload: AssetCreate) -> AssetRead:
    """Crea un asset manual."""

    service = get_exploration_service()
    return service.create_asset(payload)


@router.get("/findings", response_model=FindingListResponse)
def list_findings() -> FindingListResponse:
    """Lista findings registrados."""

    service = get_exploration_service()
    return FindingListResponse(items=service.list_findings())


@router.post("/findings", response_model=FindingRead)
def create_finding(payload: FindingCreate) -> FindingRead:
    """Crea un finding manual."""

    service = get_exploration_service()
    return service.create_finding(payload)
