from fastapi import APIRouter

from app.schemas.settings import SettingsPayload, SettingsResponse
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings() -> SettingsResponse:
    service = SettingsService()
    return SettingsResponse(values=service.get_settings())


@router.put("", response_model=SettingsResponse)
def update_settings(payload: SettingsPayload) -> SettingsResponse:
    service = SettingsService()
    saved = service.save_settings(payload.values.model_dump(exclude_none=True))
    return SettingsResponse(values=saved)
