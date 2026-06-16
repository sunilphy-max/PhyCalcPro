### Timing Belt Drive (`timing-belts`)

**Purpose**

Size synchronous (toothed) belt drives by computing pitch length, number of teeth, belt speed, transmitted power, and shaft loads. Positive engagement eliminates slip, making timing belts suitable for positioning and high-ratio compact drives.

**Physics & theory**

Timing belts mesh with pulley teeth at a defined pitch \( p \). Pitch diameter relates to tooth count: \( D = p N / \pi \). Belt length for two pulleys includes tooth engagement arcs plus tangent spans. Unlike friction belts, power capacity is limited by tooth shear, belt tensile strength, and pulley tooth bending — the module applies manufacturer-style screening factors.

Speed ratio \( i = N_{\mathrm{driven}}/N_{\mathrm{driver}} \) is exact (no slip). Radial load on shafts combines belt tension from power transmission and centrifugal effects at high speed. Pretension must prevent tooth jump under peak torque while limiting bearing loads.

Power transmission elements operate under cyclic tension, bending, and contact stresses. Service factors account for driver type (motor vs engine), daily operating hours, and shock loading. Belt slip occurs when required friction capacity exceeds available wrap; chain drives depend on proper lubrication and sprocket tooth count for rated life.

Center distance adjustment affects belt length and wrap angle simultaneously — the solver uses the standard open-drive length formula assuming coplanar shafts and parallel pulley grooves.

**Governing equations**

\[
D = \frac{p N}{\pi}, \quad v = \frac{\pi D n}{60}
\]

\[
L_{\mathrm{pitch}} = 2C + \frac{\pi(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

\[
P = \frac{F_t v}{1000}, \quad i = \frac{N_2}{N_1}
\]

**Numerical method**

Closed-form geometry and power screening per timing belt check templates. Tooth count and pitch determine pulley diameters; belt length rounded to whole tooth pitches. Power utilization compared against rated power adjusted by service, width, and speed factors.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pitch / tooth count | Belt pitch and pulley teeth |
| `centerDistance` | Shaft spacing |
| `speedDriver`, `power` | Operating speed and power |
| Belt width, material | Width factor and rating |
| Service factor | Application derating |

**Outputs**

- Pitch length, tooth count, pulley diameters, belt speed, power utilization, estimated belt tension, shaft load components.

**Design codes & checks**

- **Indicative:** Power capacity and tension screening
- **ISO:** ISO 5296 synchronous belt drives (reference pitch systems)

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

- Two-pulley layout; no idler pulleys or back-side wrap.
- Screening-level rating — not a substitute for manufacturer software (Gates, Conti).
- Neglects belt stiffness dynamics and resonance at high speed.
- Standard trapezoidal or curvilinear tooth profiles per selected pitch family.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 17.
2. ISO 5296:2012. *Synchronous belt drives — Pulleys*.
3. Gates Corporation. *Poly Chain GT Carbon Design Manual*.
4. Budynas, R. G., Nisbett, J. K. *Shigley's Mechanical Engineering Design*, 11th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
