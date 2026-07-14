from types import SimpleNamespace

import pytest

from app.services.nmap_import_service import NmapImportSummary
from app.services.nmap_scan_service import NmapScanError, NmapScanService


class ImporterStub:
    def __init__(self) -> None:
        self.received_xml: str | None = None

    def import_xml(self, xml_content: str) -> NmapImportSummary:
        self.received_xml = xml_content
        return NmapImportSummary(
            assets_created=1,
            assets_skipped=0,
            services_created=1,
            services_skipped=0,
            hosts_seen=1,
            open_ports_seen=1,
        )


def test_scan_runs_nmap_without_shell_and_imports_xml(monkeypatch: pytest.MonkeyPatch):
    importer = ImporterStub()
    service = NmapScanService(importer)  # type: ignore[arg-type]
    observed: dict[str, object] = {}

    def fake_run(command: list[str], **kwargs: object) -> SimpleNamespace:
        observed["command"] = command
        observed["kwargs"] = kwargs
        return SimpleNamespace(returncode=0, stdout="<nmaprun />", stderr="")

    monkeypatch.setattr("app.services.nmap_scan_service.subprocess.run", fake_run)

    summary = service.scan(target="127.0.0.1", profile="fast", ports="80,443")

    assert summary.assets_created == 1
    assert importer.received_xml == "<nmaprun />"
    assert observed["command"] == [
        "nmap",
        "-sV",
        "-oX",
        "-",
        "-F",
        "-p",
        "80,443",
        "127.0.0.1",
    ]
    assert observed["kwargs"] == {
        "check": False,
        "capture_output": True,
        "text": True,
        "timeout": 120,
    }


def test_scan_rejects_target_outside_default_scope():
    service = NmapScanService(ImporterStub())  # type: ignore[arg-type]

    with pytest.raises(NmapScanError, match="outside the configured Nmap scope"):
        service.scan(target="192.168.1.10", profile="standard", ports=None)


def test_scan_rejects_ports_with_command_injection_characters():
    service = NmapScanService(ImporterStub())  # type: ignore[arg-type]

    with pytest.raises(NmapScanError, match="Ports must contain"):
        service.scan(target="127.0.0.1", profile="standard", ports="80;--script")