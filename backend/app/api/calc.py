from fastapi import APIRouter
import numpy as np
from app.utils import plotting

router = APIRouter()

@router.get("/example")
def example_calc(x: float = 2.0):
    # Example calculation
    y = np.sqrt(x) + np.sin(x)
    # Generate a simple plot (encoded as base64)
    plot_url = plotting.simple_plot([x], [y])
    return {"x": x, "y": y, "plot": plot_url}