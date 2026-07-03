### Heat Exchangers (`heat-exchangers`)

**Purpose**

Estimate thermal duty, log-mean temperature difference (LMTD), effectiveness, and pressure drop for shell-and-tube and compact heat exchanger screening using classical NTU and correlation methods.

**Physics & theory**

Heat transfer rate \( Q = \dot{m} c_p \Delta T \) for each fluid stream. Overall conductance \( Q = U A \Delta T_{\mathrm{lm}} \) where LMTD depends on flow arrangement (counterflow, parallel, crossflow). Effectiveness–NTU method handles unknown outlet temperatures: \( \varepsilon = Q/Q_{\max} \) as function of \( \mathrm{NTU} = UA/C_{\min} \) and capacity ratio \( C_r = C_{\min}/C_{\max} \).

Film coefficients \( h \) from Dittus–Boelter (turbulent tube flow), Sieder–Tate (viscous), or user-specified values combine in \( 1/U = 1/h_h + t/k + 1/h_c \). Pressure drop from Fanning friction factor correlations along tube length and fittings.

Pressure systems combine membrane stress from internal pressure with bending from weight, thermal expansion, and external loads. ASME codes distinguish sustained, occasional, and peak stress categories with different allowable limits reflecting primary vs secondary stress character.

Thin-wall theory applies when wall thickness is small compared to radius; thick-wall Lamé solutions are required for heavy-wall vessels and high-pressure cylinders.

**Governing equations**

\[
Q = \dot{m}_h c_{p,h} (T_{h,in} - T_{h,out}) = \dot{m}_c c_{p,c} (T_{c,out} - T_{c,in})
\]

\[
\Delta T_{\mathrm{lm,cf}} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}
\]

\[
\frac{1}{U} = \frac{1}{h_h} + \frac{t}{k} + \frac{1}{h_c}, \quad \mathrm{NTU} = \frac{UA}{C_{\min}}
\]

**Numerical method**

Iterative or direct LMTD/ε–NTU solution (`engine`). Fluid properties at mean temperature. Pressure drop from Darcy–Weisbach with correlation friction factor. Duty balance residual reported.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Hot/cold inlet T, flow rates | Stream conditions |
| Fluid \( c_p, \rho, \mu, k \) | Properties |
| Geometry | Area, tube ID, length, pass count |
| Flow arrangement | Counter, parallel, cross |
| Fouling factors | Optional \( R_f \) |

**Outputs**

- Heat duty \( Q \), outlet temperatures
- LMTD, \( U \), effectiveness, pressure drops, duty balance check.

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
4. Shah, R. K., & Sekulić, D. P. *Fundamentals of Heat Exchanger Design*. Wiley.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
