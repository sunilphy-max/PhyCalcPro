# PhyCalcPro - Complete Project Documentation

**Last Updated:** March 2, 2026  
**Project Type:** Full-stack web application (FastAPI backend + React/Vite frontend)  
**Deployment Target:** Render (Heroku-compatible)  
**Current URL:** https://phycalcpro-gncq.onrender.com/

---

## 📋 PROJECT OVERVIEW

PhyCalcPro is a full-stack physics calculator web application with:
- **Backend:** FastAPI REST API that handles calculations (uses NumPy, Matplotlib, Plotly)
- **Frontend:** React app built with Vite for fast development and optimized production builds
- **Static Serving:** Backend serves the compiled frontend assets (HTML/JS/CSS)
- **Deployment:** Single Python/FastAPI deployment on Render (no separate Node.js service needed)

---

## 📁 COMPLETE FOLDER STRUCTURE

```
phycalcpro/
├── .git/                          # Git repository (not shown in detail)
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── .gitignore                     # Git ignore patterns
├── README.md                      # User-facing project documentation
├── PROJECT_SETUP.md               # THIS FILE - Complete technical documentation
│
├── backend/                       # FastAPI application
│   ├── .venv/                     # Python virtual environment (git ignored)
│   ├── app/
│   │   ├── __init__.py            # Empty - marks app/ as Python package
│   │   ├── main.py                # FastAPI app initialization & CORS config
│   │   ├── api/
│   │   │   └── calc.py            # Example calculation endpoint (/api/example)
│   │   └── utils/
│   │       └── plotting.py        # Plotting utility - generates base64 PNG images
│   ├── static/                    # Compiled frontend assets (committed to git)
│   │   ├── index.html             # React root HTML (references JS/CSS bundles)
│   │   └── assets/
│   │       ├── index-[hash].js    # Compiled React app bundle
│   │       └── index-[hash].css   # Compiled styles bundle
│   ├── Procfile                   # Deployment config for Render/Heroku
│   └── requirements.txt           # Python dependencies
│
└── frontend/                      # Vite + React application
    ├── node_modules/              # npm packages (git ignored)
    ├── dist/                      # Build output (git ignored)
    ├── src/
    │   ├── main.jsx               # React entry point
    │   ├── App.jsx                # Main React component - API call & rendering
    │   ├── index.css              # Global styles
    │   └── components/
    │       └── PlotCard.jsx       # Presentational component for plots
    ├── index.html                 # HTML template (Vite uses this as source)
    ├── vite.config.js             # Vite build configuration
    ├── package.json               # npm metadata, dependencies, build scripts
    └── package-lock.json          # Locked npm versions (auto-generated)
```

---

## 📄 DETAILED FILE DESCRIPTIONS

### Root Level Files

#### `.gitignore`
**Purpose:** Prevent committing unnecessary/sensitive files  
**Current Rules:**
- Python: `__pycache__/`, `*.pyc`, `.env`, virtual environments
- Frontend: `node_modules/`, `frontend/dist/`, npm logs
- Misc: `.DS_Store`

⚠️ **Important:** `backend/static/` is NOT ignored - compiled frontend is committed

---

#### `README.md`
**Purpose:** User-facing project documentation  
**Contains:**
- Project description
- Quick setup instructions (backend & frontend)
- Build for production flow
- Environment variables
- Deployment info & Procfile

---

#### `PROJECT_SETUP.md` (this file)
**Purpose:** Complete technical documentation for developers/AI  
**Contains:** Full architecture, file-by-file purpose, data flow, build process

---

### Backend Files

#### `backend/Procfile`
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
**Purpose:** Tells Render how to start the application  
**What it does:**
- Launches FastAPI with uvicorn ASGI server
- Listens on `0.0.0.0` (all interfaces) and port from `$PORT` env var

---

#### `backend/requirements.txt`
```
fastapi           # Web framework
uvicorn[standard] # ASGI server with extra features
numpy             # Numerical computing
matplotlib        # Plotting library
plotly            # Interactive plotting (currently unused but available)
```
**Purpose:** Python package management  
**How it's used:** `pip install -r requirements.txt` installs all dependencies

---

#### `backend/app/__init__.py`
**Purpose:** Marks `app/` directory as a Python package  
**Current state:** Empty (just needs to exist)

---

#### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import calc

app = FastAPI(title="PhyCalcPro API")

# CORS config - reads from CORS_ORIGINS env var, defaults to "*"
origins = [o.strip() for o in __import__("os").getenv("CORS_ORIGINS", "*").split(",")] \
          if __import__("os").getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

# Include calculation API routes
app.include_router(calc.router, prefix="/api")

# Serve frontend static files (compiled React app)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

**Purpose:** FastAPI application initialization & routing  
**Key features:**
- Creates the FastAPI app instance
- Configures CORS (allows cross-origin requests; configurable via `CORS_ORIGINS` env var)
- Mounts the `calc` router at `/api` prefix
- Serves static files from `backend/static/` directory
- `html=True` means requests to unknown paths fallback to `index.html` (required for React SPA routing)

---

#### `backend/app/api/calc.py`
```python
from fastapi import APIRouter
import numpy as np
from app.utils import plotting

router = APIRouter()

@router.get("/example")
def example_calc(x: float = 2.0):
    y = np.sqrt(x) + np.sin(x)
    plot_url = plotting.simple_plot([x], [y])
    return {"x": x, "y": y, "plot": plot_url}
```

**Purpose:** API endpoint definitions  
**Current endpoint:**
- `GET /api/example?x=4` - Example calculation
  - Takes query parameter `x` (default 2.0)
  - Performs calculation: `y = √x + sin(x)`
  - Generates a plot using the plotting utility
  - Returns JSON: `{"x": 4.0, "y": ..., "plot": "data:image/png;base64,..."}`

**How it's used:** Frontend calls `fetch("/api/example?x=4")` to get data

---

#### `backend/app/utils/plotting.py`
```python
def simple_plot(x, y):
    # Creates matplotlib plot
    # Saves as PNG to bytes buffer
    # Encodes as base64
    # Returns data URI: "data:image/png;base64,..."
```

**Purpose:** Utility function for generating plot images  
**Process:**
1. Creates matplotlib figure with `x` and `y` data
2. Saves figure to in-memory buffer as PNG
3. Encodes PNG bytes to base64
4. Returns as data URI (can be used directly in `<img src="..."`)

**Usage:** Called by `calc.py` to generate plots for API responses

---

#### `backend/static/`
**Purpose:** Compiled frontend assets served by FastAPI  
**Contents:**
- `index.html` - React root HTML with script/style references
- `assets/index-[hash].js` - React app compiled to JavaScript (Vite hashes filenames for cache busting)
- `assets/index-[hash].css` - Compiled CSS styles

**How it gets populated:**
1. Run `npm run build` in `frontend/` directory
2. Vite creates `frontend/dist/` with built files
3. `postbuild` script runs: `cpx "dist/**/*" ../backend/static`
4. Files are copied to `backend/static/`
5. Developer must commit these files to git (they're not git-ignored)

**In production:**
- Render deploys the Python app
- FastAPI serves `backend/static/index.html` at `/`
- Browser downloads React bundle and styles
- React app runs in browser and calls `/api/*` endpoints

---

### Frontend Files

#### `frontend/package.json`
```json
{
  "scripts": {
    "dev": "vite",                    // Dev server: hot module reload at http://localhost:5173
    "build": "vite build",            // Compile to dist/ directory
    "postbuild": "cpx dist/**/* ../backend/static",  // Copy to backend after build
    "preview": "vite preview"         // Preview production build
  },
  "dependencies": {
    "react": "^18.2.0",               // React library
    "react-dom": "^18.2.0"            // React DOM rendering
  },
  "devDependencies": {
    "vite": "^4.3.9",                 // Build tool & dev server
    "@vitejs/plugin-react": "^3.1.0", // Vite React plugin (JSX support)
    "cpx": "^1.5.0"                   // Copy utility (postbuild script)
  }
}
```

**Purpose:** npm package management & build scripts  
**Key scripts:**
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Create production build → triggers `postbuild` → copies to backend
- `npm run preview` - Test production build locally

---

#### `frontend/vite.config.js`
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],           // Enable JSX transformation
  base: "/",                    // Base URL for assets (important for Render)
});
```

**Purpose:** Vite build configuration  
**Key settings:**
- `plugins: [react()]` - Enables JSX support
- `base: "/"` - Assets are served from root (not a subdirectory)

---

#### `frontend/index.html`
```html
<!DOCTYPE html>
<html …>
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PhyCalcPro</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

**Purpose:** HTML template for React application  
**Key parts:**
- `<div id="root">` - React mounts here
- `<script type="module" src="/src/main.jsx">` - Vite entry point

**⚠️ Important:** This is the SOURCE template. During build, Vite transforms it and outputs to `dist/index.html` with compiled script/style references.

---

#### `frontend/src/main.jsx`
```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Purpose:** React application entry point  
**What it does:**
1. Imports React and ReactDOM
2. Imports main `App` component and global styles
3. Finds `<div id="root">` in HTML
4. Renders `<App>` component into it
5. Wrapped in `<StrictMode>` for development warnings

---

#### `frontend/src/App.jsx`
```javascript
import React, { useEffect, useState } from "react";
import PlotCard from "./components/PlotCard";

function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/example?x=4")      // Call backend API
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to PhyCalcPro</h1>
      {result && (
        <div>
          <p>Example Calculation: x = {result.x}, y = {result.y.toFixed(3)}</p>
          <PlotCard src={result.plot} />
        </div>
      )}
    </div>
  );
}

export default App;
```

**Purpose:** Main React component  
**Behavior:**
1. On component mount (`useEffect`), calls `GET /api/example?x=4`
2. Stores response in `result` state
3. Displays calculation results and plot using `PlotCard` component
4. Renders nothing while loading

**Data flow:** `App` → API call → `PlotCard` receives base64 image

---

#### `frontend/src/components/PlotCard.jsx`
```javascript
import React from "react";

function PlotCard({ src }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
      <img src={src} alt="Plot" />
    </div>
  );
}

export default PlotCard;
```

**Purpose:** Presentational component for displaying plots  
**Props:**
- `src` - Data URI of base64-encoded PNG image from backend

**Rendering:** Simple `<div>` with bordered `<img>` that displays the plot

---

#### `frontend/src/index.css`
**Current state:** Empty or minimal  
**Purpose:** Global CSS styles for the application  
**Used by:** `main.jsx` imports this for all pages

---

### CI/CD Configuration

#### `.github/workflows/ci.yml`
**Purpose:** Automated testing/building on GitHub push/PR  
**Trigger:** Push to `main` or PR against `main`

**Jobs:**

1. **Backend Job:**
   - Sets up Python 3.11
   - Installs dependencies from `requirements.txt`
   - Runs `pytest` (currently placeholder - will fail silently)

2. **Frontend Job:**
   - Sets up Node.js 18
   - Runs `npm ci` (clean install - uses lock file)
   - Runs `npm run build`
   - Copies `frontend/dist/*` → `backend/static/`

**Result:** Both backend and frontend are built, and static files are ready for deployment

---

## 🔄 DATA FLOW

### Development Workflow

1. **Frontend Dev:**
   ```
   npm run dev
   → Vite dev server at http://localhost:5173
   → API calls to `/api/example` (proxied to backend or called when backend runs)
   ```

2. **Backend Dev:**
   ```
   cd backend
   uvicorn app.main:app --reload
   → FastAPI at http://localhost:8000
   → Serves /api/* endpoints
   → Serves frontend static files from static/
   ```

### Production Workflow

1. **Build Frontend:**
   ```
   npm run build
   → Vite compiles React to frontend/dist/
   → Hash filenames for cache busting
   → Generate optimized JS/CSS bundles
   → postbuild: copy dist/ → backend/static/
   ```

2. **Commit to Git:**
   ```
   git add backend/static/
   git commit "Production build"
   git push origin main
   ```

3. **Deploy to Render:**
   ```
   Render detects push
   → Installs Python dependencies
   → Runs uvicorn app.main:app (from Procfile)
   → Serves backend/static/index.html at /
   → API endpoints available at /api/*
   ```

4. **Browser Request:**
   ```
   Browser: GET https://phycalcpro-gncq.onrender.com/
   ↓
   Backend returns: backend/static/index.html
   ↓
   Browser downloads: /assets/index-[hash].js, /assets/index-[hash].css
   ↓
   React app runs in browser
   ↓
   Browser: fetch("/api/example?x=4")
   ↓
   Backend processes request, returns JSON + base64 plot
   ↓
   React updates DOM with results
   ```

---

## 🔌 API ENDPOINTS

### Current Endpoints

**`GET /api/example?x=4`**
- Query parameter: `x` (float, default 2.0)
- Response:
  ```json
  {
    "x": 4.0,
    "y": 3.5822,
    "plot": "data:image/png;base64,iVBORw0KGgo..."
  }
  ```
- Purpose: Example calculation with plot generation

### Future Endpoints

Other calculation endpoints would be added to `backend/app/api/calc.py` following the same pattern:
```python
@router.get("/another-calc")
def another_calc(param1: float, param2: float):
    result = compute_something(param1, param2)
    return {"result": result}
```

---

## ⚙️ ENVIRONMENT VARIABLES

### Backend

- **`CORS_ORIGINS`** (optional)
  - Type: Comma-separated string
  - Default: `*` (allow all origins)
  - Example: `CORS_ORIGINS=https://myapp.com,https://test.myapp.com`
  - Usage: Controls which domains can make requests to the API

- **`PORT`** (provided by Render)
  - Type: Integer
  - Default: 8000 (local development)
  - Set by: Deployment platform (not user-configurable)

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Current Setup

```
GitHub Repository
    ↓ (push to main)
GitHub Actions CI/CD
    ├─ Backend: Install Python deps, run tests
    └─ Frontend: Build Vite, copy assets to backend/static
    ↓ (on success)
Render.com
    ├─ Detects Python (Procfile)
    ├─ Installs Python dependencies
    ├─ Runs: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    └─ Serves backend/static/ at /
```

### Why Built Assets are Committed

- Render is a Python-only runtime in this setup
- Node.js is not available during deployment
- Frontend must be pre-built and committed to git
- When Render starts the app, static files are already present

### Alternative: Multi-buildpack Approach

Could use Render's multi-buildpack to also build Node:
```yaml
# Not currently configured, but possible future optimization
- Python + Node both installed
- npm run build runs during deployment
- Can remove static/ from git (auto-generated)
```

---

## 🔧 COMMON TASKS

### Adding a New Backend Endpoint

1. Open `backend/app/api/calc.py`
2. Add new function with `@router.get()` decorator:
   ```python
   @router.get("/my-calc")
   def my_calc(input: float):
       result = some_calculation(input)
       return {"result": result}
   ```
3. Restart backend server (auto-reload will pick it up)
4. Frontend can call `fetch("/api/my-calc?input=5")`

### Building for Production

1. `cd frontend && npm run build` (creates dist/, copies to backend/static/)
2. `git add backend/static/` (commit built assets)
3. `git commit -m "Production build"`
4. `git push origin main` (triggers CI/CD)

### Testing Locally Before Deployment

1. Run `npm run build` in frontend/
2. Run `uvicorn app.main:app --reload` from backend/
3. Visit `http://localhost:8000/` in browser
4. Verify app works as expected

### Updating Dependencies

**Frontend:**
```bash
cd frontend
npm install some-new-package
npm run build
git add package.json package-lock.json backend/static/
git commit -m "Add new frontend dependency"
```

**Backend:**
```bash
cd backend
source .venv/Scripts/activate
pip install new-package
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add new backend dependency"
```

---

## ✅ HEALTH CHECKS

### Is the project working?

1. **Frontend loads:**
   - Visit https://phycalcpro-gncq.onrender.com/
   - Should see "Welcome to PhyCalcPro" heading
   - Should see calculation results and a plot

2. **API is responding:**
   - `curl https://phycalcpro-gncq.onrender.com/api/example`
   - Should return JSON with x, y, and base64 plot

3. **Static files are served:**
   - `curl -i https://phycalcpro-gncq.onrender.com/`
   - Should return 200 OK with HTML containing `<script src="/assets/index-...js">`
   - **NOT** the placeholder "The frontend will be copied..." message

---

## 📝 NOTES & CONVENTIONS

- **Python style:** Following standard FastAPI patterns (decorators for routes)
- **React style:** Functional components with hooks (useState, useEffect)
- **File naming:**
  - Components: PascalCase (PlotCard.jsx)
  - Utilities: snake_case (plotting.py)
  - Files: kebab-case for config (vite.config.js)
- **Git strategy:** `main` branch is deployment branch; all changes committed (including static assets)
- **Build artifacts:** `frontend/dist/` is git-ignored (ephemeral), but `backend/static/` is committed

---

## 🐛 TROUBLESHOOTING

**Issue:** White screen in production
- **Cause:** `backend/static/` is empty or missing built assets
- **Fix:** Run `npm run build` in frontend, commit `backend/static/`, push

**Issue:** API calls failing (404 on /api/example)
- **Cause:** Backend not running or route not included
- **Fix:** Verify `backend/app/api/calc.py` exists and `app.include_router(calc.router)` is in main.py

**Issue:** Build fails locally
- **Cause:** Missing dependencies
- **Fix:** `npm install` (frontend) or `pip install -r requirements.txt` (backend)

**Issue:** React state not updating
- **Cause:** API response structure different than expected
- **Fix:** Check browser console for errors, verify API returns correct JSON structure

---

## 📚 USEFUL COMMANDS REFERENCE

```bash
# Frontend development
cd frontend
npm install              # Install deps once
npm run dev             # Start dev server (http://localhost:5173)
npm run build           # Build for production

# Backend development
cd backend
python -m venv .venv
source .venv/Scripts/activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload  # Start dev server (http://localhost:8000)

# Testing
curl http://localhost:8000/api/example

# Git operations
git status              # Check changes
git add .              # Stage all changes
git status             # Verify
git commit -m "message" # Commit
git push origin main   # Deploy to Render
```

---

## 🎯 SUMMARY

**PhyCalcPro** is a full-stack application where:
- **Backend** (FastAPI) handles computations and serves static files
- **Frontend** (React/Vite) runs in browser and calls backend APIs
- **Deployment** is simple: single Python service that serves both API and static files
- **Build process** pre-compiles frontend and commits assets so deployment only needs Python

Any AI, developer, or service can now understand the complete architecture from this document.
