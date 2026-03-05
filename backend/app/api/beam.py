from fastapi import APIRouter
from pydantic import BaseModel
from app.core.beam.solver import simply_supported_point_load

router = APIRouter()


class BeamInput(BaseModel):
    L: float
    P: float
    a: float
    E: float
    I: float


@router.post("/simply-supported-point")
def solve_beam(data: BeamInput):
    result = simply_supported_point_load(
        L=data.L,
        P=data.P,
        a=data.a,
        E=data.E,
        I=data.I,
    )
    return result