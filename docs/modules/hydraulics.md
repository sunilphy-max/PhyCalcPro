### Hydraulic Cylinders (`hydraulics`)

**Purpose**

Analyze double-acting hydraulic cylinders for rod and bore stresses, required system pressure, force output, and buckling screening of extended rod under compressive load.

**Physics & theory**

Hydraulic force \( F = p A \) where \( p \) is gauge pressure and \( A \) is piston area. Annular rod-side area \( A_r = \pi(D^2 - d^2)/4 \) for bore \( D \) and rod \( d \). Retraction force uses rod-side area; extension uses full bore area.

Rod column buckling when extended follows Euler with effective length based on mounting (clevis, trunnion, foot). Seal friction and dynamic pressure drop add losses not always included in static screening. Wall hoop stress in thin cylinder: \( \sigma_h = pD/(2t) \).

Pressure systems combine membrane stress from internal pressure with bending from weight, thermal expansion, and external loads. ASME codes distinguish sustained, occasional, and peak stress categories with different allowable limits reflecting primary vs secondary stress character.

Thin-wall theory applies when wall thickness is small compared to radius; thick-wall Lamé solutions are required for heavy-wall vessels and high-pressure cylinders.

**Governing equations**

\[
F_{\mathrm{extend}} = p \frac{\pi D^2}{4}, \quad F_{\mathrm{retract}} = p \frac{\pi (D^2 - d^2)}{4}
\]

\[
\sigma_{\mathrm{rod}} = \frac{F_{\mathrm{compress}}}{A_{\mathrm{rod}}}, \quad P_{\mathrm{cr}} = \frac{\pi^2 E I}{L_{\mathrm{eff}}^2}
\]

\[
\sigma_h = \frac{p D}{2 t_{\mathrm{wall}}}
\]

**Numerical method**

Closed-form force, stress, and buckling equations (`engine`). Pressure computed from required force or force from supplied pressure. Rod buckling compared to applied compressive load during retraction/extension as configured.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Bore \( D \), rod \( d \) | Cylinder geometry |
| Stroke, mounting | Rod effective length for buckling |
| Required force or pressure | Operating point |
| Wall thickness | Barrel hoop check |
| Material yield | Rod and tube allowables |

**Outputs**

- Extend/retract forces, required pressure, rod stress, hoop stress, buckling safety factor, utilization.

**Design codes & checks**

- **Indicative:** Pressure and rod stress utilization
- **ISO:** ISO 6020/6022 hydraulic cylinder dimensions (reference)


**Assumptions & limitations**

- Steady-state static analysis; no cushioning or velocity dynamics.
- Seal friction and port losses optional or omitted.
- Tie-rod vs welded body stress concentrations simplified.
- Does not size ports, valves, or accumulators.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. ISO 6020-1:2019. *Hydraulic fluid power — Mounting dimensions*.
3. Parker Hannifin. *Cylinder Design Guide*.
4. NFPA T3.6.7. *Fluid power systems — Cylinder bore sizes*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
