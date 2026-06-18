from fastapi.testclient import TestClient

from app.core.config import get_api_settings
from app.main import create_app


def test_settings_can_be_saved_and_read(tmp_path, monkeypatch) -> None:
    # Propósito:
    # - aislar storage del test usando un directorio temporal
    # - evitar escribir en apps/api/data durante pruebas automatizadas
    monkeypatch.setenv("CYBERMAP_API_DATA_DIR", str(tmp_path))
    get_api_settings.cache_clear()

    client = TestClient(create_app())

    payload = {
        "values": {
            "theme": "Dark Pro",
            "aiProvider": "OpenAI",
        }
    }

    save_response = client.put("/settings", json=payload)
    read_response = client.get("/settings")

    assert save_response.status_code == 200
    assert read_response.status_code == 200
    assert read_response.json()["values"] == payload["values"]

    get_api_settings.cache_clear()


def test_settings_rejects_unknown_fields(tmp_path, monkeypatch) -> None:
    # Propósito:
    # - asegurar que el backend no persiste claves fuera del contrato
    # - evitar drift silencioso entre frontend TypeScript y backend Pydantic
    monkeypatch.setenv("CYBERMAP_API_DATA_DIR", str(tmp_path))
    get_api_settings.cache_clear()

    client = TestClient(create_app())

    response = client.put(
        "/settings",
        json={
            "values": {
                "theme": "Dark Pro",
                "unknownSetting": "should not be accepted",
            }
        },
    )

    assert response.status_code == 422

    get_api_settings.cache_clear()


def test_settings_rejects_invalid_boolean_type(tmp_path, monkeypatch) -> None:
    # Propósito:
    # - asegurar validación estricta de booleanos
    # - evitar coerciones ambiguas como "true" -> True
    monkeypatch.setenv("CYBERMAP_API_DATA_DIR", str(tmp_path))
    get_api_settings.cache_clear()

    client = TestClient(create_app())

    response = client.put(
        "/settings",
        json={
            "values": {
                "mcpEnabled": "true",
            }
        },
    )

    assert response.status_code == 422

    get_api_settings.cache_clear()
