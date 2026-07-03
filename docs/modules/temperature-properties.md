### Temperature Properties (`temperature-properties`)

**Purpose**

Evaluate temperature-dependent material property changes — strength derating, modulus reduction, and thermal expansion — for design at elevated or cryogenic service temperatures.

**Physics & theory**

Material strength and stiffness decrease with temperature for most metals; cryogenic temperatures can increase yield but reduce ductility. Linear thermal expansion causes strain \( \varepsilon_{\mathrm{th}} = \alpha (T - T_{\mathrm{ref}}) \) and stress if expansion is constrained: \( \sigma = E \alpha \Delta T \) (fully restrained case).

Derating factors \( f_T = \sigma_y(T)/\sigma_y(T_{\mathrm{room}}) \) from code tables (ASME B31, ASME VIII, EN 10028) adjust allowable stress at temperature. Modulus reduction affects stiffness and buckling capacity at high temperature.

Property values interpolate between catalog temperature points; extrapolation beyond the tabulated range is flagged as indicative only.

**Governing equations**

\[
\varepsilon_{\mathrm{th}} = \alpha \Delta T, \quad \sigma_{\mathrm{thermal}} = E \alpha \Delta T \quad \text{(restrained)}
\]

\[
\sigma_{\mathrm{allow}}(T) = f_T \cdot \sigma_{\mathrm{allow,room}}
\]

**Numerical method**

Interpolation over tabulated property curves (`engine`): user selects material and temperature; linear or piecewise interpolation returns \( E(T), \sigma_y(T), \alpha(T) \) and derating factor.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Material | From database or custom |
| `temperature` | Operating or design temperature |
| Reference temperature | Baseline for expansion |
| Property requested | Strength, modulus, expansion |

**Outputs**

- Derated strength/modulus, thermal strain/stress (if restrained), derating factor, chart data points.

**Design codes & checks**

- **Indicative:** Strength derating factor
- **US:** ASME B31.3/ VIII allowable stress tables vs temperature
- **EU:** EN 10028 / EN 1993-1-2 elevated temperature (reference)


**Assumptions & limitations**

- Tabulated data approximate; verify against code edition in use.
- Does not model creep or stress relaxation at long-duration high temperature.
- Phase changes (martensite, etc.) not captured.
- Interpolation between sparse data points may be conservative or unconservative.

**References**

1. ASME BPVC Section II, Part D — material properties vs temperature.
2. ASME B31.3:2022. *Process Piping*, allowable stress tables.
3. EN 1993-1-2:2005. *Structural fire design*.
4. ASM Handbook Volume 1 — elevated temperature properties of metals.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
