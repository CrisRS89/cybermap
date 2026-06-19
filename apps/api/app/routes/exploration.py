from pathlib import Path
from sqlite3 import IntegrityError

from fastapi import APIRouter, HTTPException

from app.schemas.exploration import (
    AssetCreate,
    AssetListResponse,
    AssetRead,
    FindingCreate,
    FindingListResponse,
    FindingRead,
)
from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository

router = APIRouter(prefix="/exploration", tags=["exploration"])


def get_exploration_service() -> ExplorationSQLiteRepository:
    """Crea el repositorio SQLite de Exploration.

    La ruta se resuelve desde este archivo para evitar depender del
    directorio actual desde donde se ejecute Uvicorn.
    """

    api_root = Path(__file__).resolve().parents[2]
    return ExplorationSQLiteRepository(api_root / "data" / "cybermap.db")


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
    """Crea un finding manual.

    Si `assetId` apunta a un asset inexistente, SQLite rechaza la FK.
    La API traduce ese error de persistencia a una respuesta HTTP controlada.
    """

    service = get_exploration_service()

    try:
        return service.create_finding(payload)
    except IntegrityError as error:
        raise HTTPException(
            status_code=400,
            detail="Associated asset does not exist",
        ) from error
