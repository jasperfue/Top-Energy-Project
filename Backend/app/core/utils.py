import json
import time
import logging
from pathlib import Path

import aiofiles
import tepyapi
from tepyapi import models, apis

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


async def read_json(path: Path):
    log.info("Reading JSON...")
    async with aiofiles.open(path, "r", encoding="utf-8") as f:
        content = await f.read()
    return json.loads(content)


project_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "elements": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "input": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string"
                                },
                                "unit": {
                                    "type": "string"
                                }
                            },
                            "required": ["name", "unit"],
                            "additionalProperties": False
                        }
                    },
                    "output": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string"
                                },
                                "unit": {
                                    "type": "string"
                                }
                            },
                            "required": ["name", "unit"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["name", "input", "output"],
                "additionalProperties": False
            }
        }
    },
    "required": ["elements"],
    "additionalProperties": False
}
