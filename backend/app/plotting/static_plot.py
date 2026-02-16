import matplotlib.pyplot as plt
import io
from fastapi.responses import StreamingResponse

def generate_plot(x, y, xlabel, ylabel, title):

    plt.figure()
    plt.plot(x, y)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)
    plt.grid(True)

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", dpi=300)
    plt.close()

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/png")
