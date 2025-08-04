from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import (get_settings)
from app.routers import auth

app = FastAPI()

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

app.include_router(auth.router, prefix="/auth", tags=["auth"])
