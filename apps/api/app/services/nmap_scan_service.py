"""Ejecución local y acotada de Nmap para objetivos explícitamente permitidos."""

import ipaddress
import os
import re
import subprocess

from app.services.nmap_import_service import NmapImportService, NmapImportSummary

DEFAULT_ALLOWED_NETWORKS = "127.0.0.0/8,::1/128"
PORTS_PATTERN = re.compile(r"^[0-9,-]+$")


class NmapScanError(Exception):
    """Error controlado al validar o ejecutar un escaneo Nmap."""


class NmapScanService:
    """Ejecuta perfiles mínimos de Nmap y delega su XML al importador existente.

    Los objetivos se limitan a direcciones IP incluidas en
    ``CYBERMAP_NMAP_ALLOWED_NETWORKS``. Sin configuración explícita, solo se
    permite loopback para evitar que un despliegue nuevo habilite escaneo de red.
    """

    def __init__(self, importer: NmapImportService) -> None:
        self._importer = importer

    def scan(
        self,
        *,
        target: str,
        profile: str,
        ports: str | None,
    ) -> NmapImportSummary:
        target_address = self._validate_target(target)
        command = self._build_command(str(target_address), profile, ports)

        try:
            completed = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
                timeout=120,
            )
        except FileNotFoundError as error:
            raise NmapScanError("Nmap is not installed on the server") from error
        except subprocess.TimeoutExpired as error:
            raise NmapScanError("Nmap scan timed out after 120 seconds") from error

        if completed.returncode != 0:
            detail = completed.stderr.strip() or "unknown Nmap execution error"
            raise NmapScanError(f"Nmap scan failed: {detail}")

        if not completed.stdout.strip():
            raise NmapScanError("Nmap did not produce XML output")

        return self._importer.import_xml(completed.stdout)

    @staticmethod
    def _build_command(target: str, profile: str, ports: str | None) -> list[str]:
        command = ["nmap", "-sV", "-oX", "-"]

        if profile == "fast":
            command.append("-F")

        if ports:
            if not PORTS_PATTERN.fullmatch(ports):
                raise NmapScanError("Ports must contain only numbers, commas and ranges")
            command.extend(["-p", ports])

        command.append(target)
        return command

    @staticmethod
    def _validate_target(target: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address:
        try:
            target_address = ipaddress.ip_address(target)
        except ValueError as error:
            raise NmapScanError("Target must be a literal IP address") from error

        allowed_networks = os.getenv(
            "CYBERMAP_NMAP_ALLOWED_NETWORKS", DEFAULT_ALLOWED_NETWORKS
        ).split(",")

        try:
            allowed = any(
                target_address in ipaddress.ip_network(network.strip(), strict=False)
                for network in allowed_networks
                if network.strip()
            )
        except ValueError as error:
            raise NmapScanError("Invalid CYBERMAP_NMAP_ALLOWED_NETWORKS configuration") from error

        if not allowed:
            raise NmapScanError("Target is outside the configured Nmap scope")

        return target_address