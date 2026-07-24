---
seoTitle: "Thermal Management Calculator: Conduction, Convection, Radiation & Coolant Flow"
seoDescription: "How engineers estimate steady-state heat rejection through conduction, convection, and radiation paths with coolant flow sizing for electronics and advanced hardware."
guideHeadline: "How Engineers Size Thermal Management Systems"
keywords: ["thermal management", "heat transfer", "thermal resistance", "convection", "radiation cooling", "cold plate"]
---

### Thermal Management (`thermal-management`)

## How engineers size thermal management systems

Every electronic module, power converter, and advanced instrument generates heat that must be removed to stay within safe operating temperatures. Engineers size cooling by estimating parallel heat-transfer paths — conduction through solid materials, convection to air or fluid, and radiation to surroundings — then checking whether total capacity meets the heat load. A lumped screening model answers "can I reject the heat?" before committing to CFD or detailed fin optimisation.

This guide covers the three heat-transfer modes, thermal resistance networks, and coolant flow sizing for electronics and hardware thermal design.

## Heat-transfer paths and when each dominates

| Path | Dominant when | Typical application |
|------|--------------|---------------------|
| Conduction | Solid path to heat sink or chassis | PCB to cold plate, die to spreader |
| Natural convection | No fan or forced flow; moderate heat flux | Passively cooled enclosures |
| Forced convection | Fan or blower available; higher heat flux | Server racks, motor drives |
| Radiation | Vacuum or high-temperature surfaces | Space hardware, furnace walls |
| Liquid cooling | Very high heat flux or dense packaging | EV battery packs, data centres |

## Engineering workflow

1. **Quantify heat load** — total dissipation from all sources (electronics, resistive, chemical).
2. **Define temperature limits** — maximum junction, case, or surface temperature.
3. **Estimate conduction path** — material, thickness, and area from source to sink.
4. **Estimate convection** — natural or forced; coefficient \(h\) from correlations or vendor data.
5. **Estimate radiation** — emissivity, view factor, and surface temperatures.
6. **Sum capacities** — total rejection vs heat load; compute thermal resistance.
7. **Size coolant flow** — if liquid-cooled, set flow rate for allowable coolant temperature rise.

## Key quantities and formulas

Conduction through a slab:

\[
Q_c = \frac{k\,A\,\Delta T}{t}
\]

Convection from a surface:

\[
Q_{\mathrm{conv}} = h\,A\,\Delta T
\]

Radiation between a surface and surroundings:

\[
Q_r = \varepsilon\,\sigma\,A\,(T_h^4 - T_{\mathrm{amb}}^4)
\]

Effective thermal resistance:

\[
R_{\mathrm{th}} = \frac{\Delta T}{Q_{\mathrm{tot}}}
\]

Coolant temperature rise:

\[
\Delta T_{\mathrm{coolant}} = \frac{Q_{\mathrm{tot}}}{\dot{m}\,c_p}
\]

## Worked example

**Given:** Power module dissipating 150 W. Aluminium cold plate — 5 mm thick, 100 × 100 mm, \(k = 200\) W/m·K. Forced air on top, \(h = 50\) W/m²·K. Ambient 35 °C. Max case temperature 85 °C (\(\Delta T = 50\) K). Emissivity 0.9.

1. Conduction capacity: \(Q_c = 200 \times 0.01 \times 50 / 0.005 = 20{,}000\) W — not limiting.
2. Convection: \(Q_{\mathrm{conv}} = 50 \times 0.01 \times 50 = 25\) W.
3. Radiation: \(Q_r = 0.9 \times 5.67 \times 10^{-8} \times 0.01 \times (358^4 - 308^4) = 3.8\) W.
4. Total air-side capacity: \(25 + 3.8 = 28.8\) W — insufficient for 150 W.
5. Add liquid cooling: required flow \(\dot{m} = 150 / (4180 \times 10) = 0.0036\) kg/s (0.22 L/min of water at 10 K rise).

**Interpretation:** Forced air alone cannot handle 150 W on this small area. Liquid cooling is necessary; alternatively, increase the fin area (larger heat sink) or use a heat pipe.

## Common mistakes and checks

- Treating **conduction, convection, and radiation as independent** when they share the same \(\Delta T\) — the parallel model is a screening approximation.
- Using **natural convection** \(h\) values for **forced flow** configurations or vice versa.
- Ignoring **contact resistance** between mating surfaces — can dominate the thermal path.
- Forgetting that **radiation is significant** at high surface temperatures (> 200 °C) or in vacuum.
- Assuming **constant coolant properties** — viscosity and \(c_p\) change with temperature.
- Not checking **spreading resistance** — a small heat source on a large plate has additional resistance.

## FAQ

### What is thermal resistance?

Thermal resistance \(R_{\mathrm{th}} = \Delta T / Q\) (K/W) is the thermal analogue of electrical resistance. Lower \(R_{\mathrm{th}}\) means better heat transfer. Resistances in series add; in parallel, reciprocals add.

### How do I estimate the convection coefficient h?

For natural convection on vertical plates, \(h \approx 5\)–15 W/m²·K. For forced air at moderate velocity, \(h \approx 25\)–100 W/m²·K. For liquid water in turbulent flow, \(h \approx 500\)–10,000 W/m²·K. Use Nusselt number correlations for precise values.

### When does radiation matter?

Radiation dominates in vacuum (no convection) and becomes significant above 200 °C in air. At room temperature in air, radiation is typically 5–15 % of the total — included for completeness.

### Can this model transient heat-up?

No. This module computes steady-state capacity. For transient thermal analysis (pulsed loads, duty cycles), use time-domain simulation or the lumped-capacitance method: \(\tau = m c_p R_{\mathrm{th}}\).

### How do I account for thermal interface material (TIM)?

Add TIM as a conduction layer: \(R_{\mathrm{TIM}} = t_{\mathrm{TIM}} / (k_{\mathrm{TIM}} A)\). Typical TIM conductivity: 1–10 W/m·K for pads; 50+ W/m·K for solder or liquid metal.

## Use the PhyCalcPro calculator

Open the [Thermal management calculator](/products/advanced-systems/thermal-management). Enter heat load, temperature differential, conduction/convection/radiation parameters, and coolant properties. Review component capacities, total rejection, thermal resistance, and coolant temperature rise.

**Purpose**

Combine parallel conduction, convection, radiation, and coolant flow estimates for steady-state heat rejection from electronics, cold plates, and advanced hardware. Reports effective thermal resistance and coolant temperature rise.

**Physics & theory**

Heat flows through parallel paths from hot surface at \(T_h\) to ambient. Conduction: \(Q_c = kA\Delta T/t\). Convection: \(Q_{\mathrm{conv}} = hA\Delta T\). Radiation: \(Q_r = \varepsilon\sigma A(T_h^4 - T_{\mathrm{amb}}^4)\). Total capacity \(Q_{\mathrm{tot}} = Q_c + Q_{\mathrm{conv}} + Q_r\). Effective resistance \(R_{\mathrm{th}} = \Delta T/Q_{\mathrm{tot}}\). Coolant flow: \(\dot{m} = Q/(c_p \Delta T_{\mathrm{coolant}})\).

**Governing equations**

\[
Q_c = \frac{k\,A\,\Delta T}{t}, \quad Q_{\mathrm{conv}} = h\,A\,\Delta T
\]

\[
Q_r = \varepsilon\,\sigma\,A\,(T_h^4 - T_{\mathrm{amb}}^4)
\]

\[
R_{\mathrm{th}} = \frac{\Delta T}{Q_{\mathrm{tot}}}, \quad \Delta T_{\mathrm{coolant}} = \frac{Q_{\mathrm{tot}}}{\dot{m}\,c_p}
\]

**Numerical method**

Parallel path capacity summation. Paths treated as independent capacity estimates — not a series thermal network unless user configures equivalent \(\Delta T\).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Temperature differential, area | Driving potential and area |
| Thickness, conductivity | Conduction path |
| Convection coefficient | \(h\) (W/m²·K) |
| Emissivity, hot temperature, ambient temperature | Radiation |
| Flow rate, coolant specific heat | Liquid cooling |

**Outputs**

- Conduction, convection, radiation components (W), total capacity, thermal resistance (K/W), coolant temperature rise (K).

**Design codes & checks**

- **Indicative:** Heat-transfer capacity, thermal resistance screening
- **JEDEC:** Electronics thermal practice (context)
- **ASHRAE:** Heat transfer data (reference)

**Assumptions & limitations**

- Steady-state lumped model; no transient or spatial gradients.
- Parallel path summation may overestimate if paths are actually series-dominated.
- No spreading resistance, contact interface resistance, or two-phase boiling.
- CFD and fin efficiency not computed.

**References**

1. Incropera, F. P., et al. *Fundamentals of Heat and Mass Transfer*, 8th ed.
2. JEDEC JESD51 series. *Thermal characterisation of semiconductor devices*.
3. ASHRAE Handbook — Fundamentals.
4. Lee, S. *Optimum Design and Selection of Heat Sinks*. IEEE Trans. CPT.
