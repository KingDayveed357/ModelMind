# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

# Import all routers
from app.api.routes import datasets as datasets_routes
from app.api.routes import train as train_routes
from app.api.routes import predict as predict_routes
from app.api.routes import history as history_routes
from app.api.routes import models as models_routes
from app.api.routes import users as users_routes
from app.api.routes import test_supabase
from app.core.cors import get_cors_kwargs
from app.api.errors import register_exception_handlers


def create_app() -> FastAPI:
    app = FastAPI(title="ModelMind API", version="0.1.0")

    # CORS
    app.add_middleware(CORSMiddleware, **get_cors_kwargs())

    # Routers
    app.include_router(datasets_routes.router, prefix="/api/datasets", tags=["datasets"])
    app.include_router(train_routes.router, prefix="/api/train", tags=["train"])
    app.include_router(predict_routes.router, prefix="/api/predict", tags=["predict"])
    app.include_router(history_routes.router, prefix="/api/history", tags=["history"])
    app.include_router(models_routes.router, prefix="/api", tags=["models"])
    app.include_router(users_routes.router, prefix="/api", tags=["users"])
    app.include_router(test_supabase.router, prefix="/api/test", tags=["test"])

    # Exceptions
    register_exception_handlers(app)

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()