import logging
import time
from pathlib import Path

import tepyapi
from tepyapi import models, apis

from ..utils.to_jsonable import to_jsonable

log = logging.getLogger('uvicorn.error')


def wait_for_api_finished(api, interval=0.5, backoff=1.2, max_interval=5.0):
    """Exponential back-off: first all 0.5 s, then up to 5 s distance."""
    next_wait = interval
    while api.get_operation_state().state != "NoOpInProgress":
        time.sleep(next_wait)
        next_wait = min(next_wait * backoff, max_interval)


def load_and_update_project(project_path: Path, configuration):
    """Blocking routine that loads and updates the project.
    Runs in a thread so that the event loop remains free."""
    with tepyapi.ApiClient(configuration) as api_client:
        process_api = apis.EfProcessManagementApi(api_client)

        prj_data = models.ApiProjectData(
            str(project_path / f"{project_path.name}.te-proj"),
            sourceType="file",
            readonly=True,
        )
        log.info("Load project ...")
        process_api.load_project(project_data=prj_data)
        wait_for_api_finished(process_api)

        log.info("Update project ...")
        process_api.update_project()
        wait_for_api_finished(process_api)

        update_messages = process_api.get_update_messages()
        return update_messages


def fetch_value(component: str, variable: str, configuration: tepyapi.Configuration):
    try:
        with tepyapi.ApiClient(configuration) as api_client:
            data_api = apis.EfDataManagementApi(api_client)
            res = data_api.get_data_from_component(f"Ist-Fall.eSim.Scheme.{component}", variable)
            return to_jsonable(res)
    except tepyapi.ApiException as e:
        log.error("Wertabfrage fehlgeschlagen | component=%s variable=%s | %s", component, variable, e)
        return None
    except Exception:
        log.exception("Unerwarteter Fehler bei Wertabfrage | component=%s variable=%s", component, variable)
        return None
