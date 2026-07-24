---
seoTitle: "Temperature-Dependent Material Properties: Derating, Expansion & Modulus"
seoDescription: "How engineers evaluate material property changes at elevated or cryogenic temperatures — strength derating, modulus reduction, and thermal expansion for safe design."
guideHeadline: "How Engineers Evaluate Temperature-Dependent Properties"
keywords: ["temperature derating", "thermal expansion", "elevated temperature strength", "modulus reduction", "ASME allowable stress", "cryogenic properties"]
---

### Temperature Properties (`temperature-properties`)

## How engineers evaluate temperature effects on materials

Materials weaken at high temperature and can become brittle at cryogenic temperature. Engineers must derate strength and stiffness to the service temperature, compute thermal strains that drive fit changes and stresses in restrained parts, and verify that allowable stress tables from design codes cover the operating range.

This guide covers derating workflows, thermal strain and stress, and the link between temperature property curves and downstream structural/pressure calculations.

## Temperature regimes and when to check

| Regime | Range | Key concern |
|--------|-------|-------------|
| Cryogenic | < −40 °C | Ductile-to-brittle transition, increased yield |
| Ambient | −40 to +50 °C | Reference properties apply |
| Moderate elevated | 50–200 °C | Begin derating for many aluminium alloys |
| High temperature | 200–600 °C | Significant strength and modulus loss in steels |
| Very high temperature | > 600 °C | Creep, oxidation; code tables may not extend |

## Engineering workflow

1. **Define service temperature** — maximum continuous and transient excursion.
2. **Select material** — from the material database or custom entry.
3. **Retrieve derating factors** — \(f_T\) for yield, ultimate, and modulus at temperature.
4. **Compute thermal strain** — \(\varepsilon_{\mathrm{th}} = \alpha \Delta T\) for dimensional change.
5. **Check restrained stress** — if expansion is constrained, \(\sigma = E\,\alpha\,\Delta T\).
6. **Apply to design** — use derated allowable stress in beam, vessel, or piping modules.

## Key quantities and formulas

Thermal strain:

\[
\varepsilon_{\mathrm{th}} = \alpha\,\Delta T
\]

Thermal stress in a fully restrained member:

\[
\sigma_{\mathrm{thermal}} = E\,\alpha\,\Delta T
\]

Derating factor and allowable stress at temperature:

\[
f_T = \frac{\sigma_y(T)}{\sigma_y(T_{\mathrm{room}})}, \quad \sigma_{\mathrm{allow}}(T) = f_T \cdot \sigma_{\mathrm{allow,room}}
\]

## Worked example

**Given:** Carbon steel pipe (A106 Gr B), \(\sigma_y = 240\) MPa at room temperature, operating at 400 °C. CTE \(\alpha = 12.5 \times 10^{-6}\) /°C. Pipe length 20 m between anchors.

1. From ASME code tables, derating factor at 400 °C: \(f_T \approx 0.72\).
2. Derated yield: \(0.72 \times 240 = 173\) MPa. Allowable stress: \(\sigma_{\mathrm{allow}} = 173 / 1.5 = 115\) MPa.
3. Free thermal expansion: \(\Delta L = \alpha \Delta T L = 12.5 \times 10^{-6} \times 375 \times 20{,}000 = 93.75\) mm.
4. If fully restrained: \(\sigma = 200{,}000 \times 12.5 \times 10^{-6} \times 375 = 937\) MPa — far exceeds allowable; expansion loops or bellows are mandatory.

## Common mistakes and checks

- Using **room-temperature properties** at service temperatures above 200 °C for metals.
- Forgetting that **elastic modulus also decreases** — affects buckling and deflection, not just strength.
- Applying derating factors from **one code** (e.g., ASME) to designs governed by **another** (e.g., EN).
- Ignoring **cryogenic embrittlement** — some steels lose ductility below −29 °C.
- **Extrapolating** beyond the tabulated temperature range without flagging the result as unverified.

## FAQ

### What is a derating factor?

A dimensionless multiplier that reduces room-temperature strength or modulus to the value at service temperature. \(f_T = 0.72\) means the property drops to 72 % of its room-temperature value.

### Does the modulus change with temperature too?

Yes. For carbon steel, \(E\) drops from roughly 200 GPa at 20 °C to about 170 GPa at 400 °C. This affects deflection, natural frequency, and buckling capacity.

### How do I handle thermal strain in a restrained system?

If expansion is fully prevented, thermal stress \(\sigma = E \alpha \Delta T\) can be enormous. Partially restrained systems require a flexibility analysis — use the pipe or frame module with temperature load cases.

### What about creep at high temperature?

Creep causes time-dependent deformation under sustained stress at high temperature. This module does not model creep — it provides short-term property derating. For long-duration service above the creep range, consult ASME Section II Part D creep-rupture data.

## Use the PhyCalcPro calculator

Open the [Temperature properties calculator](/products/materials/temperature-properties). Select a material and enter service temperature to retrieve derated strength, modulus, thermal expansion coefficient, and thermal strain/stress for restrained conditions.

**Purpose**

Evaluate temperature-dependent material property changes — strength derating, modulus reduction, and thermal expansion — for design at elevated or cryogenic service temperatures.

**Physics & theory**

Material strength and stiffness decrease with temperature for most metals; cryogenic temperatures can increase yield but reduce ductility. Linear thermal expansion causes strain \(\varepsilon_{\mathrm{th}} = \alpha(T - T_{\mathrm{ref}})\) and stress if expansion is constrained: \(\sigma = E\,\alpha\,\Delta T\). Derating factors \(f_T = \sigma_y(T)/\sigma_y(T_{\mathrm{room}})\) from code tables adjust allowable stress at temperature.

**Governing equations**

\[
\varepsilon_{\mathrm{th}} = \alpha\,\Delta T, \quad \sigma_{\mathrm{thermal}} = E\,\alpha\,\Delta T
\]

\[
\sigma_{\mathrm{allow}}(T) = f_T \cdot \sigma_{\mathrm{allow,room}}
\]

**Numerical method**

Interpolation over tabulated property curves: user selects material and temperature; linear or piecewise interpolation returns \(E(T)\), \(\sigma_y(T)\), \(\alpha(T)\) and the derating factor.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Material | From database or custom |
| Temperature | Operating or design temperature |
| Reference temperature | Baseline for expansion |
| Property requested | Strength, modulus, expansion |

**Outputs**

- Derated strength/modulus, thermal strain/stress (if restrained), derating factor, chart data points.

**Design codes & checks**

- **Indicative:** Strength derating factor
- **US:** ASME B31.3 / VIII allowable stress tables vs temperature
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
