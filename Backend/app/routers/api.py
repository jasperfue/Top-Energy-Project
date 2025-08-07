import asyncio
from pathlib import Path
from typing import List

import tepyapi
from app.core.config import get_tepy_configuration
from app.utils import waitForApiFinished
from fastapi import APIRouter, HTTPException
from tepyapi import models, apis

router = APIRouter()

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
    if not project_path.exists():
        raise HTTPException(status_code=404, detail=f"Projekt '{project_name}' nicht gefunden")
    if not (project_path / f"{project_name}.te-proj").is_file():
        raise HTTPException(status_code=400, detail=f"'{project_name}' ist kein gültiges Projekt")
    configuration = get_tepy_configuration()
    try:
        with tepyapi.ApiClient(configuration) as api_client:
            process_api = apis.EfProcessManagementApi(api_client)
            print("Load project ... ", end='', flush=True)
            prj_data = models.ApiProjectData(
                str((project_path / f"{project_name}.te-proj")),
                sourceType="file",
                readonly=True
            )
            api_response = process_api.load_project(project_data=prj_data)
            waitForApiFinished("", process_api, False)

            # Update the project
            print("Update project ... ", end='', flush=True)
            process_api.update_project()
            waitForApiFinished("", process_api, True)

            print("Update messages:")
            update_messages = process_api.get_update_messages()
            print(update_messages)

            return api_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Lesen des Projekts: {str(e)}")
