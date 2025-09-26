from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import (get_settings)
from .core.auth import login, logout
from .routers import projects
from .routers.chat import test_custom_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    test_custom_agent()
    login()
    yield
    logout()


app = FastAPI(lifespan=lifespan)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(projects.router, prefix="/api", tags=["api"])
