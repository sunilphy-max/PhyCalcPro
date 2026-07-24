---
seoTitle: "Vacuum Engineering Calculator: Pump-Down Time, Conductance & Chamber Force"
seoDescription: "How engineers size vacuum systems — pump-down time, molecular-flow conductance, chamber force, and gas throughput for research and industrial vacuum hardware."
guideHeadline: "How Engineers Size Vacuum Systems"
keywords: ["vacuum engineering", "pump-down time", "molecular flow", "conductance", "vacuum chamber", "gas throughput"]
---

### Vacuum Engineering (`vacuum-engineering`)

## How engineers size vacuum systems

Vacuum system design balances pump capacity against chamber volume, conductance losses in piping, and gas load from outgassing and leaks. Engineers need pump-down time to plan process schedules, conductance to size vacuum lines, and chamber force to design flanges and viewports. A screening model answers these questions in minutes, before detailed Monte Carlo or CFD gas-flow simulations.

This guide covers the three flow regimes, lumped-parameter pump-down, and force on vacuum-loaded surfaces.

## Vacuum regimes and when each matters

| Regime | Pressure range | Flow character | Key metric |
|--------|---------------|----------------|------------|
| Viscous (continuum) | > 100 Pa | Gas-gas collisions dominate | Viscous conductance, Poiseuille flow |
| Transitional | 0.1–100 Pa | Mixed behaviour | Empirical correction factors |
| Molecular | < 0.1 Pa | Wall collisions dominate | Molecular conductance, mean free path |
| Ultra-high vacuum | < 10⁻⁶ Pa | Surface-limited desorption | Bake-out, all-metal seals |

## Engineering workflow

1. **Define target pressure** — process requirement (e.g., 10⁻³ Pa for thin-film deposition).
2. **Estimate chamber volume** — from geometry including connected manifolds.
3. **Select pump type and speed** — turbo, diffusion, scroll, or dry pump with rated speed at target pressure.
4. **Size vacuum lines** — diameter and length to keep conductance loss within 20 % of pump speed.
5. **Compute pump-down time** — exponential ideal-gas model for initial estimate.
6. **Check structural loads** — atmospheric pressure on viewports, doors, and flexible bellows.
7. **Estimate gas throughput** — required sustained pump speed for dynamic gas load.

## Key quantities and formulas

Ideal pump-down time:

\[
t = \frac{V}{S}\,\ln\left(\frac{P_0}{P_f}\right)
\]

Molecular-flow conductance of a circular tube (air, room temperature):

\[
C_{\mathrm{mol}} = \frac{12.1\,d^3}{L} \quad \text{(L/s, with } d, L \text{ in cm)}
\]

Force on a vacuum-loaded surface:

\[
F = \Delta P \cdot A
\]

Throughput at target pressure:

\[
Q = P_f \cdot S
\]

Effective pumping speed with conductance in series:

\[
\frac{1}{S_{\mathrm{eff}}} = \frac{1}{S_{\mathrm{pump}}} + \frac{1}{C}
\]

## Worked example

**Given:** Chamber volume 0.5 m³, pump speed 200 L/s, pump-down from atmosphere (101 325 Pa) to 0.01 Pa. Vacuum line: 100 mm diameter × 0.5 m long.

1. Molecular conductance: \(C = 12.1 \times 10^3 / 50 = 2{,}420\) L/s — well above pump speed, line is not a bottleneck.
2. Effective speed: \(S_{\mathrm{eff}} = (1/200 + 1/2420)^{-1} = 185\) L/s.
3. Pump-down time: \(t = (500/185) \times \ln(101{,}325/0.01) = 2.70 \times 16.1 = 43.5\) s — this is the ideal-gas estimate.
4. In practice, outgassing extends the time below ~1 Pa significantly. Budget 30–60 minutes for the molecular-flow regime.
5. Viewport force: 200 mm diameter window at full vacuum: \(F = 101{,}325 \times \pi \times 0.1^2 = 3{,}183\) N — roughly 325 kgf.

## Common mistakes and checks

- Using the **viscous pump-down formula** in the molecular regime — pump speed often drops at low pressure.
- Ignoring **conductance losses** in long, small-diameter lines — can halve effective pump speed.
- Underestimating **outgassing** — dominates pump-down time below 1 Pa.
- Forgetting **viewport and door force** — atmospheric pressure on a 300 mm viewport exceeds 7 kN.
- Assuming **constant pump speed** — most pumps have pressure-dependent speed curves.

## FAQ

### What is molecular-flow conductance?

In the molecular regime, gas molecules travel in straight lines between wall collisions. Conductance measures how easily gas flows through a tube under these conditions — it depends on tube geometry, not pressure.

### When does outgassing dominate?

Below roughly 1 Pa for unbaked stainless steel chambers. Water vapour and hydrocarbons desorb slowly from surfaces. Bake-out (150–250 °C) dramatically reduces outgassing for UHV work.

### How do I account for leaks?

Add leak throughput to the dynamic gas load: \(Q_{\mathrm{total}} = Q_{\mathrm{outgas}} + Q_{\mathrm{leak}}\). Required pump speed: \(S = Q_{\mathrm{total}} / P_f\). Leak detection (helium mass spectrometer) identifies sources.

### Can this model multi-pump or networked systems?

The current model handles a single pump and single conductance segment. For complex networks, model each segment separately and combine conductances in series or parallel.

### What safety checks apply to vacuum vessels?

External pressure on thin shells can cause buckling — check with the vessels or shells module. Viewports and doors need bolted-flange gasket design per ISO or ASME.

## Use the PhyCalcPro calculator

Open the [Vacuum engineering calculator](/products/advanced-systems/vacuum-engineering). Enter chamber volume, pump speed, target pressure, and vacuum line geometry. Review pump-down time, molecular conductance, viewport/flange force, and gas throughput estimates.

**Purpose**

Screen vacuum chamber pump-down time, molecular-flow conductance, chamber force on windows/flanges, and gas throughput at target pressure. Supports preliminary vacuum system sizing for research and industrial hardware.

**Physics & theory**

Ideal gas pump-down follows exponential pressure decay: \(t = (V/S)\ln(P_0/P_f)\) for chamber volume \(V\) and effective pumping speed \(S\). Molecular-flow conductance of a circular tube (air, room temperature) approximates \(C = 12.1\,d^3/L\) L/s. Pressure differential across area \(A\) produces force \(F = \Delta P \cdot A\). Throughput \(Q = P\,S\) at target pressure sets required pump capacity.

**Governing equations**

\[
t_{\mathrm{pumpdown}} = \frac{V}{S}\,\ln\left(\frac{P_0}{P_f}\right)
\]

\[
C_{\mathrm{mol}} = \frac{12.1\,d^3}{L}
\]

\[
F = \Delta P \cdot A, \quad Q = P_f\,S
\]

**Numerical method**

Closed-form ideal gas pump-down and molecular conductance. Warnings issued when target pressure remains in the viscous-dominated range.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Volume | Chamber volume (m³) |
| Pump speed | Effective pumping speed (m³/s) |
| Initial pressure, target pressure | Pressure range (Pa) |
| Tube diameter, tube length | Vacuum line geometry |
| Pressure differential, projected area | Force calculation |

**Outputs**

- Pump-down time, molecular conductance (L/s), chamber force (N), target throughput (Pa·m³/s), assumptions and warnings.

**Design codes & checks**

- **Indicative:** Pump-down, conductance, vacuum force screening
- **ISO:** ISO 21360 vacuum pump performance context
- **ASTM:** ASTM E595 outgassing context

**Assumptions & limitations**

- Isothermal ideal gas; constant effective pumping speed.
- No viscous-molecular transition modelling or outgassing transients.
- Conductance network not solved — single tube segment only.
- Leak rate testing procedures not included.

**References**

1. O'Hanlon, J. F. *A User's Guide to Vacuum Technology*, 4th ed. Wiley.
2. Roth, A. *Vacuum Technology*, 3rd ed. Elsevier.
3. ISO 21360-1:2012. *Vacuum pumps — Performance test methods*.
4. AVS. *Recommended Practices for Vacuum Technology*.
