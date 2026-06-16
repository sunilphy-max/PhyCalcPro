### Worm Gear Drive (`worm-gears`)

**Purpose**

Screen worm and worm-wheel drives for efficiency, sliding velocity, contact stress, and thermal load. Worm drives provide high speed reduction in compact envelopes but generate significant sliding and heat.

**Physics & theory**

A worm is a helical gear with one or few teeth (threads); the worm wheel mates at 90° shaft angle. Lead angle \( \lambda \) and friction angle \( \phi \) determine efficiency: \( \eta = \tan\lambda / \tan(\lambda + \phi) \) for driving worm. Self-locking occurs when \( \lambda < \phi \), preventing back-driving.

Sliding velocity along tooth flanks is high compared to spur gears, limiting efficiency and promoting wear. Contact stress uses Hertzian line contact with equivalent radii from worm and wheel geometry. Heat generation \( Q = P(1-\eta) \) must be dissipated to avoid oil breakdown.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
\eta = \frac{\tan\lambda}{\tan(\lambda + \phi)} \quad \text{(worm driving)}
\]

\[
v_s = \frac{v_1}{\cos\lambda}, \quad d_w = \frac{m N_w}{\cos\lambda}
\]

\[
\sigma_c = Z_E \sqrt{\frac{F_n}{b \rho_{\mathrm{eq}}}} \leq \sigma_{HP}
\]

**Numerical method**

Closed-form geometry and efficiency calculations. Friction coefficient from material pair and lubrication. Contact stress screened against allowable; thermal power loss computed for oil bath sizing guidance.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Worm threads, wheel teeth | Tooth counts |
| `module`, `faceWidth` | Axial module and face width |
| `power`, `speed` | Worm speed and power |
| Friction coefficient | From material/lubrication |
| Material allowables | Contact stress limit |

**Outputs**

- Gear ratio, efficiency, self-locking flag, sliding velocity, contact stress utilization, heat loss (kW).

**Design codes & checks**

- **Indicative:** Efficiency, contact stress utilization
- **DIN:** DIN 3996 worm gear load capacity (reference)
- **ISO:** ISO/TR 14521 worm gear rating (reference)

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

- Cylindrical worm with throated wheel; no double-enveloping geometry.
- Steady-state thermal balance not fully solved — heat loss is screening only.
- Wear and pitting life not computed to ISO/TR 14521 full method.
- Manufacturing tolerance effects on contact pattern omitted.

**References**

1. ISO/TR 14521:2020. *Gears — Calculation of load capacity of worm gears*.
2. DIN 3996:2016. *Tragfähigkeitsberechnung von Zylinderschneckengetrieben*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
4. Dudley, D. W. *Handbook of Practical Gear Design*, 2nd ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
