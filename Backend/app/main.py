from fastapi import FastAPI
from pydantic_settings import BaseSettings, SettingsConfigDict

app = FastAPI()

class Settings(BaseSettings):
    top_energy_username: str
    top_energy_password: str
    top_energy_host: str
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

configuration = tepyapi.Configuration(
    username = settings.top_energy_username,
    password = settings.top_energy_password,
    host = settings.top_energy_host
)

@app.get("/")
async def root():
    return {"message": "Hello World"}
