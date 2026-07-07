from app.ai.agents.base import AgentContext, AgentRecommendation, AgentResult
from app.ai.providers.base import AICompletionRequest, AIMessage, AIProvider


class ExplorationAnalystAgent:
    """Agente especializado en análisis inicial de superficie de ataque.

    Responsabilidad:
    - leer assets, servicios y findings ya normalizados;
    - pedir al proveedor IA una síntesis;
    - devolver recomendaciones estructuradas;
    - no ejecutar escaneos activos;
    - no modificar persistencia.
    """

    agent_id = "exploration_analyst"

    def run(
        self,
        context: AgentContext,
        provider: AIProvider,
        model: str,
    ) -> AgentResult:
        prompt = _build_prompt(context)

        completion = provider.complete(
            AICompletionRequest(
                model=model,
                messages=[
                    AIMessage(
                        role="system",
                        content=(
                            "Sos un analista técnico de ciberseguridad defensiva. "
                            "Analizás superficie de ataque ya recolectada. "
                            "No sugerís explotación activa ni acciones fuera de scope."
                        ),
                    ),
                    AIMessage(role="user", content=prompt),
                ],
                temperature=0.2,
            )
        )

        recommendations = _build_recommendations(context)

        return AgentResult(
            agent_id=self.agent_id,
            provider_id=completion.provider,
            model=completion.model,
            summary=completion.content,
            recommendations=recommendations,
        )


def _build_prompt(context: AgentContext) -> str:
    """Construye un prompt compacto y auditable para el proveedor IA."""

    return (
        f"Tarea: {context.task}\n"
        f"Assets detectados: {len(context.assets)}\n"
        f"Servicios detectados: {len(context.services)}\n"
        f"Findings existentes: {len(context.findings)}\n"
        f"Servicios: {context.services}"
    )


def _build_recommendations(context: AgentContext) -> list[AgentRecommendation]:
    """Genera recomendaciones mínimas determinísticas.

    Decisión:
    - en esta fase inicial no dependemos de que el LLM devuelva JSON perfecto;
    - el agente produce recomendaciones estructuradas desde reglas simples;
    - más adelante se puede combinar con salida estructurada del proveedor real.
    """

    recommendations: list[AgentRecommendation] = []

    exposed_http_services = [
        service
        for service in context.services
        if service.get("name") in {"http", "https"} or service.get("port") in {80, 443}
    ]

    if exposed_http_services:
        recommendations.append(
            AgentRecommendation(
                title="Revisar exposición de servicios HTTP/HTTPS",
                severity="medium",
                rationale=(
                    "Se detectaron servicios web expuestos. Conviene validar TLS, "
                    "headers de seguridad, versiones del producto y superficie pública."
                ),
                suggested_finding=True,
            )
        )

    exposed_ssh_services = [
        service
        for service in context.services
        if service.get("name") == "ssh" or service.get("port") == 22
    ]

    if exposed_ssh_services:
        recommendations.append(
            AgentRecommendation(
                title="Validar endurecimiento de SSH",
                severity="medium",
                rationale=(
                    "Se detectó SSH expuesto. Conviene revisar autenticación, "
                    "deshabilitar password login si aplica, limitar origen y auditar versión."
                ),
                suggested_finding=True,
            )
        )

    if not recommendations:
        recommendations.append(
            AgentRecommendation(
                title="Completar inventario de superficie",
                severity="info",
                rationale=(
                    "No se detectaron servicios relevantes en el contexto recibido. "
                    "Conviene ampliar inventario o importar nuevos resultados."
                ),
                suggested_finding=False,
            )
        )

    return recommendations
