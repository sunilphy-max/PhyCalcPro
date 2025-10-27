from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now allow all; later limit to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running fine!"}

@app.get("/bolt")
def bolt_calc(diameter: float = 10.0, load: float = 1000.0):
    stress = load / (3.1416 * (diameter / 2) ** 2)
    return {"diameter": diameter, "load": load, "stress": stress}
