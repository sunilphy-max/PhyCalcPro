### Bearing Selection (`bearings`)

**Purpose**

Estimate rolling-element bearing basic rating life \( L_{10} \) and dynamic load utilization from catalog dynamic load rating \( C \), applied equivalent load \( P \), and reliability adjustment. Supports ball and roller bearing screening per ISO 281.

**Physics & theory**

Rolling bearings fail by subsurface fatigue after many load cycles. The basic rating life \( L_{10} \) is the number of revolutions (or hours at given speed) that 90% of a bearing group exceeds under a constant equivalent radial load \( P \) equal to the dynamic load rating \( C \). The life equation is \( L_{10} = (C/P)^p \) where \( p = 3 \) for ball bearings and \( p = 10/3 \) for roller bearings.

Equivalent load combines radial \( F_r \) and axial \( F_a \) components: \( P = X F_r + Y F_a \), with factors \( X, Y \) depending on contact angle and \( F_a/F_r \) ratio. Reliability factor \( a_1 \) adjusts life for other than 90% survival; material and lubrication factors extend to modified rating life in full ISO 281 but may be simplified here.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
L_{10} = \left(\frac{C}{P}\right)^p, \quad p = \begin{cases} 3 & \text{ball} \\ 10/3 & \text{roller} \end{cases}
\]

\[
P = X F_r + Y F_a
\]

\[
L_{10h} = \frac{10^6}{60 n} L_{10} \quad \text{(hours at rpm } n \text{)}
\]

**Numerical method**

Closed-form ISO 281 life calculation. User selects bearing type (ball/roller), enters catalog \( C \), applied loads, speed, and optional \( a_1 \). Equivalent load computed from load ratio tables; utilization \( P/C \) and \( L_{10} \) in hours reported.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Bearing type | Ball or roller |
| `dynamicCapacity` \( C \) | Catalog dynamic load rating |
| `radialLoad`, `axialLoad` | Applied forces |
| `speed` | Operating rpm |
| `reliabilityFactor` \( a_1 \) | Optional life adjustment |
| Contact angle | For angular contact factors |

**Outputs**

- Equivalent load \( P \), life \( L_{10} \) (revolutions and hours), dynamic capacity utilization, recommended minimum \( C \) if under-rated.

**Design codes & checks**

- **Indicative:** Dynamic load rating utilization, \( L_{10} \) life
- **ISO:** ISO 281:2007 rolling bearing rating life

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

- Constant load and speed; variable load spectra need equivalent load per ISO 281 supplement.
- Catalog \( C \) from manufacturer tables required — module does not store full bearing database.
- No static load rating \( C_0 \) or bearing clearance analysis.
- Lubrication contamination and mounting fits affect real life beyond \( L_{10} \).

**References**

1. ISO 281:2007. *Rolling bearings — Dynamic load ratings and rating life*.
2. SKF. *Rolling Bearings Catalogue* — selection principles.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 11.
4. Harris, T. A., & Kotzalas, M. N. *Essential Concepts of Bearing Technology*, 5th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
