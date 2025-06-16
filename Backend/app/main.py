from fastapi import FastAPI, HTTPException
import tepyapi
from tepyapi import apis
from tepyapi import ApiException
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi.middleware.cors import CORSMiddleware

class Settings(BaseSettings):
    top_energy_username: str
    top_energy_password: str
    top_energy_host: str
    allowed_origins: str
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings() # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

configuration = tepyapi.Configuration(
    username = settings.top_energy_username,
    password = settings.top_energy_password,
    host = settings.top_energy_host
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/login", status_code=204)
async def login():
    with tepyapi.ApiClient(configuration) as api_client:
        user_api = apis.EfUserManagementApi(api_client)
        try:
            print("Login user ... ", end="", flush=True)
            api_key = user_api.login(lang="de")
            configuration.api_key["api_key"] = api_key
            print("OK")
            return
        except ApiException as e:
            print("FAILURE!")
            raise HTTPException(
                status_code=e.status,
                detail={
                    "error": "Login failed",
                    "reason": e.reason,
                    "details": e.details or str(e)
                }
            )
        except Exception as e:
            print("FAILURE!")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            print("Logout ... ", end="", flush=True)
            try:
                user_api.logout()
                print("OK")
            except:
                print("FAILURE!")
            print("Ready")
