from fastapi import APIRouter, HTTPException
from typing import List
from pathlib import Path
import asyncio

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
        if entry.is_file():
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
