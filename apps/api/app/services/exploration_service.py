from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4
import json

from app.schemas.exploration import AssetCreate, AssetRead, FindingCreate, FindingRead


class ExplorationService:
    """Servicio de persistencia local temporal para Exploration.

    Proposito:
    - mantener el primer vertical slice simple
    - permitir tests aislados con directorio temporal
    - preparar una futura migracion a SQLite sin acoplar rutas HTTP
    """

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.assets_path = data_dir / "exploration-assets.json"
        self.findings_path = data_dir / "exploration-findings.json"

    def list_assets(self) -> list[AssetRead]:
        return [AssetRead(**item) for item in self._read_items(self.assets_path)]

    def create_asset(self, payload: AssetCreate) -> AssetRead:
        now = self._now()
        asset = AssetRead(
            id=f"asset_{uuid4().hex}",
            createdAt=now,
            updatedAt=now,
            **payload.model_dump(),
        )

        items = self._read_items(self.assets_path)
        items.append(asset.model_dump(mode="json"))
        self._write_items(self.assets_path, items)

        return asset

    def list_findings(self) -> list[FindingRead]:
        return [FindingRead(**item) for item in self._read_items(self.findings_path)]

    def create_finding(self, payload: FindingCreate) -> FindingRead:
        now = self._now()
        finding = FindingRead(
            id=f"finding_{uuid4().hex}",
            createdAt=now,
            updatedAt=now,
            **payload.model_dump(),
        )

        items = self._read_items(self.findings_path)
        items.append(finding.model_dump(mode="json"))
        self._write_items(self.findings_path, items)

        return finding

    def _read_items(self, path: Path) -> list[dict]:
        if not path.exists():
            return []

        raw = path.read_text(encoding="utf-8").strip()
        if not raw:
            return []

        data = json.loads(raw)
        if not isinstance(data, list):
            raise ValueError(f"Expected list JSON in {path}")

        return data

    def _write_items(self, path: Path, items: list[dict]) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(items, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def _now(self) -> datetime:
        return datetime.now(UTC)
