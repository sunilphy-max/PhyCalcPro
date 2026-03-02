from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import calc

app = FastAPI(title="PhyCalcPro API")

# CORS configuration: allow requests from origins listed in CORS_ORIGINS env var
# (comma-separated). Defaults to all origins for development convenience.
origins = [o.strip() for o in __import__("os").getenv("CORS_ORIGINS", "*").split(",")] if __import__("os").getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include calculator routes
app.include_router(calc.router, prefix="/api")

# Serve frontend static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")