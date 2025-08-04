import tepyapi
from fastapi import HTTPException, APIRouter
from tepyapi import apis, ApiException

from app.core.config import get_tepy_configuration

router = APIRouter()

@router.get("/login", status_code=204)
async def login():
    configuration = get_tepy_configuration()
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


@router.post("/logout", status_code=204)
async def logout():
    configuration = get_tepy_configuration()
    with tepyapi.ApiClient(configuration) as api_client:
        user_api = apis.EfUserManagementApi(api_client)
        try:
            current_key = configuration.api_key.get("api_key")
            if not current_key:
                return
            print("Logout ... ", end="", flush=True)
            user_api.logout()
            print("OK")
            return
        except ApiException as e:
            print("FAILURE!")
            raise HTTPException(
                status_code=e.status,
                detail={
                    "error": "Logout failed",
                    "reason": e.reason,
                    "details": e.details or str(e),
                },
            )
        except Exception as e:
            print("FAILURE!")
            raise HTTPException(status_code=500, detail=str(e))
