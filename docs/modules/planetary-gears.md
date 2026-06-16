### Planetary Gear Set (`planetary-gears`)

**Purpose**

Size planetary (epicyclic) gear trains by selecting sun, planet, and ring tooth counts for a target ratio while checking assembly, planet spacing, and approximate strength balance. Used for compact high-ratio reducers and automatic transmissions.

**Physics & theory**

A basic planetary set has sun gear \( S \), planet gears \( P \), and ring gear \( R \) with carrier \( C \). Fundamental speed relation: \( \omega_R N_R + \omega_S N_S = \omega_C (N_S + N_R) \) for internal ring mesh. Gear ratio depends on which element is held fixed.

Tooth count constraint: \( N_R = N_S + 2 N_P \) for equally spaced planets. At least two planets require \( (N_S + N_R)/\mathrm{numPlanets} \) integer. Planet–ring and planet–sun meshes share load; planet bearing load and equal spacing are design constraints.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
i = \frac{N_R}{N_S} + 1 \quad \text{(sun input, carrier output, ring fixed)}
\]

\[
N_R = N_S + 2 N_P
\]

\[
\frac{N_S + N_R}{\mathrm{numPlanets}} \in \mathbb{Z}
\]

**Numerical method**

Integer tooth search for target ratio within bounds. Validates assembly condition and planet spacing. Approximate torque sharing assigns equal planet load; strength screening uses per-planet tangential force vs allowable.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Target ratio | Desired speed reduction |
| `numPlanets` | Number of planet gears |
| Min/max tooth counts | Search bounds |
| `module`, `faceWidth` | Gear geometry |
| `power`, `speed` | Operating conditions |

**Outputs**

- Sun, planet, ring tooth counts, actual ratio, ratio error, assembly validity, approximate planet load.

**Design codes & checks**

- **Indicative:** Actual ratio vs target, assembly constraint check

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

- Single-stage planetary; no compound or multi-stage trains.
- Full ISO 6336 planet load sharing factors not applied.
- Planet carrier stiffness and pin bearing loads simplified.
- Helical planets require additional axial load analysis.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
2. Müller, H. W. *Epicyclic Drive Trains*. Wayne State University Press.
3. ISO 6336 series (planet gear load sharing context).
4. AGMA 6123-B06. *Design Manual for Enclosed Epicyclic Gear Drives*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
