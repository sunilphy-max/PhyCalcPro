---
seoTitle: "Heat Exchanger Calculator – LMTD, NTU Effectiveness & Pressure Drop"
seoDescription: "Estimate thermal duty, log-mean temperature difference, effectiveness-NTU, overall heat transfer coefficient, and pressure drop for shell-and-tube and compact exchangers."
guideHeadline: "Engineering guide to heat exchanger thermal design and sizing"
keywords:
  - heat exchanger calculator
  - LMTD calculation
  - NTU effectiveness method
  - shell and tube design
  - heat transfer coefficient
  - thermal duty calculation
  - heat exchanger pressure drop
---

### Heat Exchangers (`heat-exchangers`)

## How engineers size heat exchangers

Heat exchangers transfer thermal energy between two fluid streams — cooling process fluids, recovering waste heat, or conditioning building air. The design problem is finding the required heat transfer area \( A \) to achieve a target thermal duty \( Q \) given inlet temperatures and flow rates. Engineers use either the LMTD method (when all four temperatures are known) or the effectiveness-NTU method (when outlet temperatures are unknown).

## Types and configurations

| Type | Flow arrangement | Application |
|------|-----------------|-------------|
| Shell-and-tube | Counter, parallel, multi-pass | Chemical process, power plants |
| Plate-and-frame | Counter-current | Food, HVAC, light chemical |
| Finned-tube (compact) | Crossflow | Automotive radiators, air coolers |
| Double-pipe | Counter or parallel | Small duty, laboratory |
| Air-cooled | Crossflow with fans | Refinery, power generation |

## Engineering workflow

1. Define hot and cold stream inlet temperatures and flow rates.
2. Calculate thermal duty from energy balance: \( Q = \dot{m} c_p \Delta T \).
3. Estimate individual heat transfer coefficients \( h_h \) and \( h_c \) from correlations.
4. Compute overall coefficient \( U \) including wall resistance and fouling.
5. Calculate LMTD for the selected flow arrangement.
6. Determine required area: \( A = Q / (U \times \text{LMTD}) \).
7. Or use NTU method: compute NTU, then effectiveness, then outlet temperatures.
8. Estimate pressure drop through tubes and shell.
9. Verify that pressure drop is within pump/fan budget.

## Key quantities and formulas

Energy balance:

\[
Q = \dot{m}_h c_{p,h}(T_{h,\text{in}} - T_{h,\text{out}}) = \dot{m}_c c_{p,c}(T_{c,\text{out}} - T_{c,\text{in}})
\]

Log-mean temperature difference (counterflow):

\[
\Delta T_{\text{lm}} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}
\]

Overall heat transfer coefficient:

\[
\frac{1}{U} = \frac{1}{h_h} + \frac{t}{k_w} + \frac{1}{h_c} + R_{f,h} + R_{f,c}
\]

NTU and capacity ratio:

\[
\text{NTU} = \frac{UA}{C_{\min}}, \quad C_r = \frac{C_{\min}}{C_{\max}}
\]

## Worked example

A counterflow shell-and-tube exchanger cools oil from 90 C to 60 C using water entering at 25 C. Oil flow 2 kg/s (\( c_p = 2.1 \) kJ/kg-K), water flow 3 kg/s (\( c_p = 4.18 \) kJ/kg-K).

- Duty: \( Q = 2 \times 2.1 \times (90 - 60) = 126 \) kW.
- Water outlet: \( T_{c,\text{out}} = 25 + 126/(3 \times 4.18) = 35.0 \) C.
- LMTD: \( \Delta T_1 = 90 - 35 = 55 \) C, \( \Delta T_2 = 60 - 25 = 35 \) C.
- \( \Delta T_{\text{lm}} = (55 - 35)/\ln(55/35) = 44.3 \) C.
- If \( U = 300 \) W/m\(^2\)-K, then \( A = 126000/(300 \times 44.3) = 9.5 \) m\(^2\).

## Common mistakes and checks

- **Using arithmetic mean instead of LMTD:** the arithmetic mean overestimates driving force, undersizing the exchanger.
- **Ignoring fouling factors:** fouling reduces \( U \) over time — design with fouling allowance from TEMA tables.
- **Wrong flow arrangement correction factor:** multi-pass exchangers need an F-factor correction to the LMTD.
- **Neglecting pressure drop:** a well-designed exchanger balances heat transfer against pumping cost.
- **Assuming constant fluid properties:** viscosity changes with temperature can shift flow regime from turbulent to laminar.

## FAQ

### When should I use the NTU method instead of LMTD?

Use NTU when outlet temperatures are unknown (sizing problem where you know area and want to find duty or outlet temperatures). Use LMTD when all four temperatures are known.

### What is a typical overall heat transfer coefficient?

Water-to-water: 800–1500 W/m\(^2\)-K. Oil-to-water: 200–400. Gas-to-gas: 10–50. These vary widely with flow velocity and fouling.

### How does fouling affect exchanger performance?

Fouling adds thermal resistance, reducing \( U \) and increasing required area. TEMA provides standard fouling resistances by fluid type.

### Can this module handle phase-change exchangers (condensers, evaporators)?

The current screening uses single-phase correlations. Phase-change requires latent heat and condensation/boiling film coefficients beyond this scope.

### What pressure drop is acceptable?

Typically 0.5–1.0 bar on the tube side and 0.3–0.5 bar on the shell side. Higher drops mean more pumping cost but better heat transfer.

## Use the PhyCalcPro calculator

Open the [Heat Exchangers calculator](/products/pressure/heat-exchangers) to enter stream temperatures, flow rates, fluid properties, geometry, and flow arrangement. The tool returns thermal duty, LMTD, overall \( U \), effectiveness, outlet temperatures, and pressure drops.

---

**Purpose**

Estimate thermal duty, log-mean temperature difference, effectiveness, and pressure drop for shell-and-tube and compact heat exchanger screening using classical NTU and correlation methods.

**Physics & theory**

Heat transfer rate \( Q = \dot{m} c_p \Delta T \) for each fluid stream. Overall conductance \( Q = UA \Delta T_{\text{lm}} \). Effectiveness-NTU method handles unknown outlet temperatures: \( \varepsilon = Q/Q_{\max} \) as function of NTU and capacity ratio. Film coefficients from Dittus-Boelter or Sieder-Tate correlations. Pressure drop from Darcy-Weisbach friction factor.

**Governing equations**

\[
Q = \dot{m}_h c_{p,h}(T_{h,\text{in}} - T_{h,\text{out}})
\]

\[
\Delta T_{\text{lm}} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}
\]

\[
\frac{1}{U} = \frac{1}{h_h} + \frac{t}{k_w} + \frac{1}{h_c}, \quad \text{NTU} = \frac{UA}{C_{\min}}
\]

**Numerical method**

Iterative or direct LMTD/NTU solution. Fluid properties at mean temperature. Pressure drop from Darcy-Weisbach with correlation friction factor. Duty balance residual reported.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Hot/cold inlet T, flow rates | Stream conditions |
| Fluid \( c_p, \rho, \mu, k \) | Properties |
| Geometry | Area, tube ID, length, pass count |
| Flow arrangement | Counter, parallel, cross |
| Fouling factors | Optional \( R_f \) |

**Outputs**

- Heat duty \( Q \), outlet temperatures, LMTD, \( U \), effectiveness, pressure drops, duty balance check.

**Design codes & checks**

- **Indicative:** Thermal duty balance, effectiveness screening
- **TEMA:** Tubular Exchanger Manufacturers Association standards (reference)

**Assumptions & limitations**

- Steady-state, no phase change or condensation correlations unless extended.
- Uniform heat transfer coefficients; no maldistribution.
- Single shell-and-tube pass screening; multi-pass requires correction factors.
- Material compatibility and vibration (TEMA) not evaluated.

**References**

1. Incropera, F. P., et al. *Fundamentals of Heat and Mass Transfer*, 8th ed. Wiley.
2. Kern, D. Q. *Process Heat Transfer*. McGraw-Hill.
3. TEMA. *Standards of Tubular Exchanger Manufacturers Association*, 10th ed.
4. Shah, R. K., & Sekulic, D. P. *Fundamentals of Heat Exchanger Design*. Wiley.
