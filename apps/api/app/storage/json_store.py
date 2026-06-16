import json
from pathlib import Path
from typing import Any


class JsonStore:
    """Persistencia JSON local simple.

    Propósito:
    - ofrecer storage mínimo para MVP
    - evitar dependencia inicial de base de datos
    - mantener archivos humanos e inspeccionables

    No usar para secretos reales en producción.
    """

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def read(self, filename: str, default: dict[str, Any]) -> dict[str, Any]:
        path = self.data_dir / filename

        if not path.exists():
            return default

        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default

    def write(self, filename: str, payload: dict[str, Any]) -> dict[str, Any]:
        path = self.data_dir / filename
        path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return payload
