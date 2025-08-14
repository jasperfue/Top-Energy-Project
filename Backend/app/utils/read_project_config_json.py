import json
import logging
from pathlib import Path

import aiofiles

log = logging.getLogger('uvicorn.error')


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
