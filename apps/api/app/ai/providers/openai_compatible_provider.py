"""Adaptador para proveedores compatibles con OpenAI Chat Completions."""

import json
from dataclasses import asdict
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.ai.providers.base import (
    AICompletionRequest,
    AICompletionResponse,
    AIProvider,
)


class AIProviderError(Exception):
    """Error controlado al comunicarse con un proveedor IA externo."""


class OpenAICompatibleProvider(AIProvider):
    """Proveedor HTTP sin SDK para APIs compatibles con Chat Completions."""

    def __init__(
        self,
        *,
        provider_id: str,
        base_url: str,
        api_key: str | None = None,
    ) -> None:
        self.provider_id = provider_id
        self._endpoint = f"{base_url.rstrip('/')}/chat/completions"
        self._api_key = api_key

    def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        payload = json.dumps(
            {
                "model": request.model,
                "messages": [asdict(message) for message in request.messages],
                "temperature": request.temperature,
            }
        ).encode("utf-8")
        headers = {"Content-Type": "application/json", "Accept": "application/json"}

        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        try:
            with urlopen(
                Request(self._endpoint, data=payload, headers=headers, method="POST"),
                timeout=45,
            ) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            raise AIProviderError(
                f"{self.provider_id} returned HTTP {error.code}"
            ) from error
        except URLError as error:
            raise AIProviderError(f"Could not reach {self.provider_id}") from error
        except TimeoutError as error:
            raise AIProviderError(f"{self.provider_id} request timed out") from error
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise AIProviderError(f"{self.provider_id} returned invalid JSON") from error

        try:
            content = response_payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as error:
            raise AIProviderError(
                f"{self.provider_id} response did not contain a completion"
            ) from error

        if not isinstance(content, str) or not content.strip():
            raise AIProviderError(f"{self.provider_id} returned an empty completion")

        return AICompletionResponse(
            content=content,
            provider=self.provider_id,
            model=request.model,
        )