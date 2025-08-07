import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import List

import jsonschema
from app.core.config import get_tepy_configuration
from app.utils import project_schema, load_and_update_project, read_json
from fastapi import APIRouter, HTTPException

router = APIRouter()

executor = ThreadPoolExecutor(max_workers=4)

PROJECTS_DIR = Path(__file__).resolve().parent.parent.parent / "projects"


def _list_project_files() -> List[str]:
    if not PROJECTS_DIR.exists():
        raise FileNotFoundError(f"Projects directory {PROJECTS_DIR} does not exist")
    if not PROJECTS_DIR.is_dir():
        raise NotADirectoryError(f"{PROJECTS_DIR} is not a directory")

    names = []
    for entry in PROJECTS_DIR.iterdir():
        if entry.name.startswith("."):
            continue
        if entry.is_dir():
            names.append(entry.name)
    return sorted(names)


@router.get("/projects")
async def get_projects():
    print(PROJECTS_DIR)
    loop = asyncio.get_running_loop()
    try:
        names = await loop.run_in_executor(None, _list_project_files)
        return {"projects": names}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Projects-Verzeichnis nicht gefunden")
    except NotADirectoryError:
        raise HTTPException(status_code=500, detail="Projects-Pfad ist kein Verzeichnis")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Keine Berechtigung auf das Projects-Verzeichnis")
    except Exception:
        raise HTTPException(status_code=500, detail="Unbekannter Fehler beim Einlesen der Projekte")


@router.get("/projects/{project_name}")
async def get_project(project_name: str):
    project_path = PROJECTS_DIR / project_name
    top_energy_project_path = project_path / f"{project_name}.te-proj"
    json_path = project_path / f"{project_name}.json"

    if not project_path.exists():
        raise HTTPException(status_code=404, detail=f"Projekt '{project_name}' nicht gefunden")
    if not top_energy_project_path.is_file():
        raise HTTPException(status_code=400, detail=f"'{project_name}' ist kein gültiges Projekt")

    configuration = get_tepy_configuration()
    try:
        loop = asyncio.get_running_loop()
        first_read_task = asyncio.create_task(read_json(json_path))
        update_messages = await loop.run_in_executor(
            executor, load_and_update_project, project_path, configuration
        )
        print(update_messages)
        data = await first_read_task
        jsonschema.validate(instance=data, schema=project_schema)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Lesen des Projekts: {str(e)}")
