import numpy as np


def simply_supported_point_load(L, P, a, E, I, n_points=200):
    """
    L: beam length (mm)
    P: load (N)
    a: load position from left (mm)
    E: Young's modulus (MPa = N/mm^2)
    I: moment of inertia (mm^4)
    """

    b = L - a

    # Reactions
    RA = P * b / L
    RB = P * a / L

    x = np.linspace(0, L, n_points)

    shear = []
    moment = []
    deflection = []

    for xi in x:
        # Shear
        if xi < a:
            V = RA
        else:
            V = RA - P

        # Moment
        if xi < a:
            M = RA * xi
        else:
            M = RA * xi - P * (xi - a)

        # Deflection
        if xi < a:
            delta = (P * b * xi / (6 * L * E * I)) * (
                L**2 - b**2 - xi**2
            )
        else:
            delta = (P * a * (L - xi) / (6 * L * E * I)) * (
                2 * L * xi - xi**2 - a**2
            )

        shear.append(V)
        moment.append(M)
        deflection.append(delta)

    return {
        "RA": RA,
        "RB": RB,
        "max_moment": RA * a,
        "max_deflection": max(deflection, key=abs),
        "x": x.tolist(),
        "shear": shear,
        "moment": moment,
        "deflection": deflection,
    }