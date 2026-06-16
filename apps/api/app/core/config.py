from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApiSettings(BaseSettings):
    """Configuración runtime de la API.

    Propósito:
    - centralizar variables de entorno
    - evitar secretos hardcodeados
    - permitir instalación reproducible en otros equipos
    """

    app_name: str = "CyberMap API"
    environment: str = "local"
    cors_origins: str = "http://localhost:3000"
    data_dir: Path = Path("data")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="CYBERMAP_API_",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_api_settings() -> ApiSettings:
    return ApiSettings()
