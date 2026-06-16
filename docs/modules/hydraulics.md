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

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

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
