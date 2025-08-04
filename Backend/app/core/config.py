from functools import lru_cache

import tepyapi
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    top_energy_username: str
    top_energy_password: str
    top_energy_host: str
    allowed_origins: str

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

@lru_cache()
def get_settings() -> Settings:
    return Settings()  # type: ignore

@lru_cache()
def get_tepy_configuration():
    settings = get_settings()
    return tepyapi.Configuration(
        username=settings.top_energy_username,
        password=settings.top_energy_password,
        host=settings.top_energy_host,
    )
