import matplotlib.pyplot as plt
import io
import base64

def simple_plot(x, y):
    plt.figure()
    plt.plot(x, y, marker='o')
    plt.title("Example Plot")
    plt.xlabel("X")
    plt.ylabel("Y")
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"