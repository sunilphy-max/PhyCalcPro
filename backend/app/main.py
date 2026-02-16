from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.calculators.straight_beam import straight_beam_analysis
from app.plotting.static_plot import generate_plot

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/beam/data")
def beam_data(load: float, length: float, width: float, height: float):

    x, shear, moment, max_stress = straight_beam_analysis(
        load, length, width, height
    )

    return {
        "x": x.tolist(),
        "shear": shear.tolist(),
        "moment": moment.tolist(),
        "max_stress": max_stress
    }

@app.post("/beam/moment-plot")
def moment_plot(load: float, length: float, width: float, height: float):

    x, shear, moment, _ = straight_beam_analysis(
        load, length, width, height
    )

    return generate_plot(x, moment, "Length (m)", "Moment (Nm)", "Bending Moment Diagram")
