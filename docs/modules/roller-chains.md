### Roller Chain Drive (`roller-chains`)

**Purpose**

Size roller chain drives by computing sprocket geometry, chain speed, transmitted power, tension, and estimated service life. Supports strand selection and power capacity screening for industrial machinery drives.

**Physics & theory**

Roller chains transmit power through sprocket tooth engagement. Chain pitch \( p \) and number of teeth \( N \) define pitch diameter \( D = p/\sin(\pi/N) \). Chain speed \( v = \pi D n / 60 \). Power \( P = F v \) relates to chain tension \( F \), which includes centrifugal and chordal action effects at high speeds.

Chain life depends on lubrication, alignment, load spectrum, and pitch selection. ANSI/ISO power rating tables provide allowable power vs speed for each chain number; the module applies service factors and strand count to estimate utilization and life cycles.

Power transmission elements operate under cyclic tension, bending, and contact stresses. Service factors account for driver type (motor vs engine), daily operating hours, and shock loading. Belt slip occurs when required friction capacity exceeds available wrap; chain drives depend on proper lubrication and sprocket tooth count for rated life.

Center distance adjustment affects belt length and wrap angle simultaneously — the solver uses the standard open-drive length formula assuming coplanar shafts and parallel pulley grooves.

**Governing equations**

\[
D = \frac{p}{\sin(\pi/N)}, \quad v = \frac{\pi D n}{60}
\]

\[
F = \frac{1000 P}{v}, \quad i = \frac{N_2}{N_1}
\]

\[
L = \frac{p}{2}\left(2C/p + N_1 + N_2 + f(N_1,N_2,C)\right)
\]

**Numerical method**

Closed-form sprocket and length equations with tabulated power ratings per chain size. Life estimate from load ratio relative to catalog rating, adjusted by lubrication and service factors. Multi-strand capacity scales approximately linearly with strand count.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Chain number / pitch | ANSI chain designation |
| Sprocket teeth (driver, driven) | Tooth counts |
| `centerDistance` | Center distance |
| `speedDriver`, `power` | Operating conditions |
| Strands, lubrication type | Capacity multipliers |

**Outputs**

- Pitch diameters, chain speed, chain tension, power utilization, estimated chain life, length in pitches.

**Design codes & checks**

- **Indicative:** Power capacity utilization, chain life estimate
- **US:** ANSI/ASME B29.1 roller chain standards
- **ISO:** ISO 606 short-pitch precision roller chains

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

- Steady power transmission; shock loads require additional service factor.
- Horizontal or near-horizontal drives; vertical lifts need tension adjustment.
- Catalog ratings assume adequate lubrication and sprocket tooth count ≥ 17 (recommended).
- Does not analyze silent (inverted tooth) or leaf chains.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 17.
2. ANSI/ASME B29.1-2011. *Precision Power Transmission Roller Chains*.
3. ISO 606:2015. *Short-pitch transmission precision roller chains*.
4. Renold. *The Complete Guide to Chain*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
