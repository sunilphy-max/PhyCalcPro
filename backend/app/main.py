from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from app.calculators.straight_beam import straight_beam_analysis
from app.plotting.static_plot import generate_plot
from app.reporting.pdf_report import generate_pdf_report

class BeamInput(BaseModel):
    load: float
    length: float
    width: float
    height: float

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
@app.post("/beam/report")
def beam_report(data: BeamInput):

    x, shear, moment, max_stress = straight_beam_analysis(
        data.load, data.length, data.width, data.height
    )

    pdf_bytes = generate_pdf_report(x, moment, max_stress)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=beam_report.pdf"
        },
    )