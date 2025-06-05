# Backend Service

This directory contains the backend service for the project, built with FastAPI and managed via the `uv` CLI tool.

## Prerequisites

- `uv` CLI installed globally (see UV Documentation below)

## Managing Dependencies

Dependencies are managed using the `uv` command:

- **Add a dependency**  
    ```bash 
  uv add <package-name>
    ```

* **Remove a dependency**

  ```bash
  uv remove <package-name>
  ```

When you run `uv add`, the package will be installed and recorded in your project’s dependency manifest. Similarly, `uv remove` uninstalls the package and updates the manifest.

## Running the Server

To start the FastAPI development server, run:

```bash
  uv run fastapi dev
```

This will launch the application in development mode, with automatic reload on code changes. By default, the server will be available at `http://127.0.0.1:8000/`.


## Environment Variables


## Documentation

* **UV CLI Documentation**
  [https://docs.astral.sh/uv/guides/projects/](https://docs.astral.sh/uv/guides/projects/)

* **FastAPI Documentation**
  [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
