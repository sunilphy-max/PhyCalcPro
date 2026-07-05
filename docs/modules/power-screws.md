### Power & Ball Screws (`power-screws`)

**Purpose**

Design and check power screws and ball screws for torque, efficiency, thread stress and buckling margin.

**Physics & theory**

A power screw converts torque to axial force through thread friction. Efficiency depends on lead angle and friction coefficient. Ball screws add rolling friction with higher efficiency. Column buckling and whirling may limit unsupported length at speed.

**Governing equations**

\[
T = \frac{F d_m}{2} \left( \frac{\pi f d_m + L}{\pi d_m - f L} \right), \quad \eta = \frac{F L}{2\pi T}
\]

**Numerical method**

Thread-aware screening via `solveScrewEngine` / `solveScrewFEM` with square, Acme and ball-screw configurations.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `screwType` | Power screw or ball screw |
| `majorDiameter`, `pitch`, `lead`, `length` | Geometry |
| `axialForce`, `frictionCoefficient` | Load and friction |
| `threadType`, `starts` | Thread form (power screws) |

**Outputs**

- Required torque, efficiency, thread and column safety factors, power, recommendations.

**Design codes & checks**

- **Indicative:** Thread stress and buckling screening
- **US:** Shigley / machinery handbook references

**Assumptions & limitations**

- Uniform load, no nut compliance FEA. Ball screw speed limits are indicative.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, Ch. 8.
2. MITCalc Power Screws and Ball Screws — independent benchmark context.
