from app.core.config import get_api_settings
from app.storage.json_store import JsonStore


SETTINGS_FILENAME = "settings.json"


class SettingsService:
    """Servicio de dominio para settings persistidos.

    Propósito:
    - aislar la API del mecanismo de persistencia
    - permitir reemplazar JSON por SQLite más adelante
    """

    def __init__(self) -> None:
        api_settings = get_api_settings()
        self.store = JsonStore(api_settings.data_dir)

    def get_settings(self) -> dict:
        return self.store.read(SETTINGS_FILENAME, default={})

    def save_settings(self, values: dict) -> dict:
        return self.store.write(SETTINGS_FILENAME, values)
