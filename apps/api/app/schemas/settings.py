from typing import Any

from pydantic import BaseModel, Field


class SettingsPayload(BaseModel):
    """Payload flexible para settings del frontend.

    En esta fase aceptamos un diccionario porque el contrato detallado vive
    todavía en el frontend. Luego conviene sincronizarlo con un DTO formal.
    """

    values: dict[str, Any] = Field(default_factory=dict)


class SettingsResponse(BaseModel):
    values: dict[str, Any]
