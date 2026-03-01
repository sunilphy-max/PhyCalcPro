from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

app = FastAPI()

# Allow CORS so frontend (localhost:5173) can access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your domain when deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple hello endpoint
@app.get("/hello")
def hello():
    return {"message": "Hello from backend!"}

# Test plotting endpoint
@app.get("/plot-test")
def plot_test():
    x = np.linspace(0, 2*np.pi, 100)
    y = np.sin(x)

    fig, ax = plt.subplots()
    ax.plot(x, y)
    ax.set_title("Sine Wave Example")

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    return {"plot": img_base64}