### Cylindrical Shells (`shells`)

**Purpose**

Screen thin cylindrical shells under internal pressure, axial force and bending moment using membrane theory plus von Mises combined stress.

**Physics & theory**

For a thin cylinder of mean radius \( r \) and wall thickness \( t \), hoop stress from internal pressure is \( \sigma_h = pr/t \). Closed ends add axial membrane stress \( \sigma_a = pr/(2t) \). External axial load and bending add further normal stress. von Mises equivalent stress combines hoop, axial and bending components for yield screening.

**Governing equations**

\[
\sigma_h = \frac{p r}{t}, \quad \sigma_{a,\mathrm{membrane}} = \frac{p r}{2t} \text{ (closed ends)}
\]

\[
\sigma_{vm} = \sqrt{\sigma_x^2 - \sigma_x \sigma_y + \sigma_y^2}
\]

**Numerical method**

Closed-form membrane and simplified beam bending deflection estimate via `solveShellEngine`.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius`, `thickness`, `length` | Shell geometry |
| `internalPressure`, `axialForce`, `bendingMoment` | Loads |
| `endCondition` | Open or closed ends |
| `allowableStress` | Design allowable |

**Outputs**

- Hoop, axial, bending and von Mises stress; safety factor; indicative deflection; status message.

**Design codes & checks**

- **Indicative:** Membrane + von Mises screening
- **US/EU:** ASME BPVC / EN 13445 context (screening only)

**Assumptions & limitations**

- Thin-shell theory (\( t/r < 0.1 \)); no nozzle, knuckle or buckling under external pressure.
- User supplies load combinations and factors.

**References**

1. Roark, R. J., & Young, W. C. *Formulas for Stress and Strain*, Ch. 7.
2. ASME BPVC Section VIII — pressure vessel design context.
