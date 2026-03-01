from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import calc

app = FastAPI(title="PhyCalcPro API")

# Optional: allow frontend requests from same origin or different domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include calculator routes
app.include_router(calc.router, prefix="/api")

# Serve frontend static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")