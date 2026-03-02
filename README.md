# PhyCalcPro

A simple physics calculator web app with a FastAPI backend and React/Vite frontend.

## Project Structure

```
backend/    # FastAPI server
frontend/   # Vite + React app
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ / npm

### Backend setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### Building for production

1. From `frontend/` run `npm run build` (a postbuild script copies output into `backend/static`).
2. Start the backend as above; it will serve the static files.

## Environment variables

- `CORS_ORIGINS` – comma-separated list of allowed origins (defaults to `*`).

## Deployment

A `Procfile` is included for platforms such as Heroku/Render:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## License

MIT License.
