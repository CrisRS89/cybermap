from pathlib import Path
from sqlite3 import IntegrityError

from fastapi import APIRouter, HTTPException

from app.repositories.exploration_sqlite_repository import ExplorationSQLiteRepository
from app.schemas.exploration import (
    AssetCreate,
    AssetListResponse,
    AssetRead,
    FindingCreate,
    FindingListResponse,
    FindingRead,
)
from app.schemas.nmap_import import (
    NmapImportRequest,
    NmapImportResponse,
    NmapImportSummaryResponse,
)
from app.services.nmap_import_service import NmapImportService
from app.services.nmap_parser import NmapParseError

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


@router.post("/imports/nmap", response_model=NmapImportResponse)
def import_nmap_xml(payload: NmapImportRequest) -> NmapImportResponse:
    """Importa XML de Nmap y crea Assets de Exploration.

    Seguridad:
    - No ejecuta Nmap.
    - No acepta rutas locales.
    - No descarga URLs.
    - El XML recibido se delega al parser seguro.
    - Los errores de parsing se traducen a HTTP controlado.
    """

    service = NmapImportService(get_exploration_service())

    try:
        summary = service.import_xml(payload.xml)
    except NmapParseError as error:
        status_code = 413 if "maximum size" in str(error) else 400
        raise HTTPException(status_code=status_code, detail=str(error)) from error

    return NmapImportResponse(
        summary=NmapImportSummaryResponse(
            assetsCreated=summary.assets_created,
            hostsSeen=summary.hosts_seen,
            openPortsSeen=summary.open_ports_seen,
            warnings=summary.warnings,
        )
    )
