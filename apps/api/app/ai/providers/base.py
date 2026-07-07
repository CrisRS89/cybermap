from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AIMessage:
    """Mensaje normalizado enviado a un proveedor de IA.

    Propósito:
    - desacoplar CyberMap de APIs concretas como OpenAI, Gemini, Claude u Ollama;
    - permitir que cualquier proveedor reciba una estructura común.
    """

    role: str
    content: str


@dataclass(frozen=True)
class AICompletionRequest:
    """Solicitud normalizada hacia un proveedor de IA."""

    model: str
    messages: list[AIMessage]
    temperature: float = 0.2


@dataclass(frozen=True)
class AICompletionResponse:
    """Respuesta normalizada desde un proveedor de IA."""

    content: str
    provider: str
    model: str


class AIProvider(Protocol):
    """Contrato mínimo que debe cumplir cualquier proveedor IA."""

    provider_id: str

    def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        """Ejecuta una completación de texto sobre un proveedor IA concreto."""
