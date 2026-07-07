from app.ai.providers.base import (
    AICompletionRequest,
    AICompletionResponse,
    AIProvider,
)


class MockAIProvider(AIProvider):
    """Proveedor IA simulado para validar arquitectura sin APIs externas.

    Decisión:
    - no llama a internet;
    - no usa claves API;
    - devuelve una respuesta determinística;
    - permite testear agentes y orquestador.
    """

    provider_id = "mock"

    def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        user_messages = [
            message.content for message in request.messages if message.role == "user"
        ]

        context_preview = user_messages[-1] if user_messages else "Sin contexto."

        return AICompletionResponse(
            provider=self.provider_id,
            model=request.model,
            content=(
                "Análisis mock generado por CyberMap. "
                "El contexto recibido fue procesado correctamente. "
                f"Resumen de entrada: {context_preview[:240]}"
            ),
        )
