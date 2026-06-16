### Shaft Design (`shafts`)

**Purpose**

Analyze rotating shafts under combined bending, torsion, and axial loads using FEA-based deflection and stress analysis. Computes critical speed margin, fatigue screening, and von Mises utilization for machine shaft preliminary design.

**Physics & theory**

Power-transmitting shafts experience bending from belt/gear forces, torsion from transmitted torque, and occasional axial thrust. Stress at any section combines \( \sigma = \sigma_{\mathrm{axial}} + \sigma_{\mathrm{bending}} \) with shear from torsion \( \tau = Tr/J \). von Mises equivalent stress governs yield and fatigue checks for ductile materials.

Deflection limits protect bearings and gears: excessive slope at bearing seats causes misalignment; excessive lateral deflection changes mesh contact. Critical (whirling) speed occurs when shaft rotation frequency matches a lateral natural frequency — the module estimates first critical speed from FEA mass and stiffness distribution.

Fatigue life depends on stress concentration at fillets, keyways, and shoulders; simplified fatigue factors may be applied when detailed Kt data is available.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
\sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2}
\]

\[
\delta_{\mathrm{slope}} = \frac{dw}{dx}\bigg|_{\mathrm{bearing}}, \quad \omega_{\mathrm{cr}} \approx \sqrt{\frac{k_{\mathrm{eq}}}{m_{\mathrm{eq}}}}
\]

\[
SF_{\mathrm{critical}} = \frac{\omega_{\mathrm{cr}}}{\omega_{\mathrm{operating}}}
\]

**Numerical method**

1D shaft FEM (`femSolver`): stepped-diameter shaft meshed along length with Hermite beam elements. Loads applied at stations; material \( E \), \( G \) define bending and torsional stiffness. Post-processing extracts deflection, slope, stress, and estimates first critical speed from equivalent stiffness/mass.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `geometry` | Diameter, length, step changes |
| `material` | \( E \), \( G \), density, yield |
| `loads` | Bending moments, torque, axial force at stations |
| Bearing locations | For slope/deflection checks |
| Speed | Operating rpm for critical speed margin |

**Outputs**

- Deflection and slope along shaft, von Mises stress, max stress location, critical speed estimate, utilization vs yield, fatigue screening notes.

**Design codes & checks**

- **Indicative:** Combined stress, deflection, critical speed margin
- **US:** AGMA 6001 interface loads (context)
- **EU:** DIN 743 shaft fatigue (screening reference)

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Linear elastic, Timoshenko/Euler shaft model; no 3D fillet FEA.
- Critical speed is first-mode estimate; damped and gyroscopic effects omitted.
- Stress concentrations at features require user-supplied Kt factors.
- Does not size fillet radii or keyways automatically.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
2. Peterson, R. E., & Wahl, A. M. *Stress Concentration Factors*.
3. DIN 743:2012. *Calculation of load capacity of shafts and axles*.
4. AGMA 6001-E08. *Design and Selection of Components for Enclosed Gear Drives*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
