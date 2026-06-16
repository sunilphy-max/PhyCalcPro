### Gear Design (`gears`) — **beta**

**Purpose**

Design and rate spur and helical gear pairs for bending and contact (pitting) strength. Combines Lewis bending screening with ISO 6336 Method B/C factors including dynamic load \( K_V \), zone factor \( Z_H \), elasticity factor \( Z_E \), and contact ratio factor \( Y_\varepsilon \).

**Physics & theory**

Gear teeth convert rotation and torque through involute meshing. Transmitted tangential force at the pitch circle is \( W_t = 2T/d \), where \( T \) is torque and \( d \) is pitch diameter. Lewis equation estimates bending stress in a tooth treated as a cantilever: \( \sigma = W_t K_V / (b m Y_J) \), with module \( m \), face width \( b \), and form factor \( Y_J \).

Contact (Hertzian) stress between mating teeth limits pitting life. ISO 6336 expresses contact stress \( \sigma_H \) with factors for load sharing, geometry, lubrication, and material. Scuffing and micropitting are not fully evaluated in indicative mode.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
W_t = \frac{2000 P}{v}, \quad d = m N, \quad v = \frac{\pi d n}{60000}
\]

\[
\sigma_F = \frac{W_t K_A K_V K_F K_\alpha}{b m Y_\beta Y_B Y_DT} \leq \sigma_{FP}
\]

\[
\sigma_H = Z_E Z_H Z_\varepsilon Z_\beta \sqrt{\frac{F_t}{b d_1} \frac{u+1}{u} K_A K_V K_{H\alpha} K_{H\beta}} \leq \sigma_{HP}
\]

**Numerical method**

Closed-form ISO 6336 and Lewis screening via `solveGearDesign`. Input power, speed, module, face width, tooth counts, and material limits feed factor calculations. Results include bending and contact utilization, geometry summary, and pitch-line velocity.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `power`, `speed` | Transmitted power (kW), pinion speed (rpm) |
| `module`, `faceWidth` | Gear geometry |
| `pinionTeeth`, `gearRatio` | Tooth counts |
| `material` | Yield, allowable bending/contact stress |
| Application factors | \( K_A \), lubrication, quality grade |

**Outputs**

- Tangential force, pitch-line velocity, bending stress and utilization, contact stress and utilization, geometry (centers, diameters), factor breakdown.

**Design codes & checks**

- **Indicative:** Lewis bending and simplified Hertzian contact
- **ISO:** ISO 6336-1/2/3 Method B/C rating (screening)
- **US:** AGMA 2101-D04 (reference context)

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

- External spur/helical pair; no internal gears or planetary sets (see dedicated modules).
- Indicative scuffing and bending fatigue screening; full AGMA/ISO factor sets not included.
- Uniform load distribution along face width unless \( K_{H\beta} \) specified.
- No microgeometry (profile modification) analysis.

**References**

1. ISO 6336-1:2019. *Calculation of load capacity of spur and helical gears — Part 1: Basic principles*.
2. ISO 6336-2:2019. *Part 2: Calculation of surface durability (pitting)*.
3. ISO 6336-3:2019. *Part 3: Calculation of tooth bending strength*.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13–14.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
