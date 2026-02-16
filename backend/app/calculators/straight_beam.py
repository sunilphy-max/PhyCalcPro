import numpy as np

def straight_beam_analysis(load, length, width, height):

    x = np.linspace(0, length, 200)

    # Shear force (central point load)
    shear = np.where(x < length/2, load/2, -load/2)

    # Bending moment
    moment = np.where(
        x < length/2,
        load * x / 2,
        load * (length - x) / 2
    )

    # Section properties
    I = (width * height**3) / 12
    c = height / 2

    max_moment = load * length / 4
    max_stress = (max_moment * c) / I

    return x, shear, moment, max_stress
