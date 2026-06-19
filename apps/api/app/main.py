from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.exploration import router as exploration_router
from app.routes.settings import router as settings_router


def create_app() -> FastAPI:
    """Crea y configura la aplicacion FastAPI."""

    app = FastAPI(title="CyberMap API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(settings_router)
    app.include_router(exploration_router)

    return app


app = create_app()
