from fastapi import FastAPI
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

@app.get("/login")
async def login():
    # Enter a context with an instance of the API client
    with tepyapi.ApiClient(configuration) as api_client:
        # Create an instance of the API class
        user_api = apis.EfUserManagementApi(api_client)
        process_api = apis.EfProcessManagementApi(api_client)
        data_api = apis.EfDataManagementApi(api_client)

        api_error = ''

        try:
            # Login to server
            print("Login user ... ", end = '', flush = True)
            api_key = user_api.login(lang='de') # 'de' or 'en', path names corresponding to the language
            configuration.api_key['api_key'] = api_key
            print("OK")

            return {"message": f"Successfully logged in as {settings.top_energy_username}"}
        except ApiException as e:
            print("FAILURE!")
            print("Status Code: %i" % e.status)
            print("Reason: %s" % e.reason)
            if (not e.details is None):
                print("Error Code: %i" % e.details['code'])
                print("Message: %s" % e.details['msg'])
            return {"error": "Login failed", "details": str(e)}

        except Exception as e:
            print("FAILURE!")
            print("Exception caught: %s" % e)
            return {"error": "Login failed", "details": str(e)}

        finally:
            # Logout
            print("Logout ... ", end = '', flush = True)
            try:
                user_api.logout()
                print("OK")
            except:
                print("FAILURE!")
            print("Ready")
