from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_api_settings
from app.routes.health import router as health_router
from app.routes.settings import router as settings_router


def create_app() -> FastAPI:
    settings = get_api_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(settings_router)

    return app


app = create_app()
