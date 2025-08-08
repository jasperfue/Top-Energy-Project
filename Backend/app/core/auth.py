import tepyapi
from tepyapi import apis, ApiException
import logging

from .config import get_tepy_configuration

log = logging.getLogger('uvicorn.error')


def login():
    cfg = get_tepy_configuration()
    try:
        with tepyapi.ApiClient(cfg) as client:
            api = apis.EfUserManagementApi(client)
            log.info("🔑 Logging in …")
            cfg.api_key["api_key"] = api.login(lang="de")
            log.info("✅ Login OK")
    except ApiException as e:
        log.error("🚨 Login failed: %s – %s", e.status, e.reason, exc_info=True)
        raise RuntimeError("Startup aborted: login to tepy failed") from e
    except Exception as e:
        log.exception("Unexpected error during login")
        raise


def logout():
    cfg = get_tepy_configuration()
    key = cfg.api_key.get("api_key")
    if not key:
        return
    try:
        with tepyapi.ApiClient(cfg) as client:
            api = apis.EfUserManagementApi(client)
            log.info("🔒 Logging out …")
            api.logout()
            log.info("✅ Logout OK")
    except ApiException as e:
        log.warning("Logout failed: %s – %s", e.status, e.reason, exc_info=True)
    except Exception:
        log.exception("Unexpected error during logout")
