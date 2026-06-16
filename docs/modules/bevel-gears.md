### Bevel Gear Screening (`bevel-gears`)

**Purpose**

Screen straight and spiral bevel gear sets for geometry, pitch cone dimensions, and bending/contact strength using adapted spur gear rating methods. Provides preliminary sizing before detailed Gleason/Klingelnberg analysis.

**Physics & theory**

Bevel gears transmit power between intersecting axes, typically at 90°. Pitch cone geometry relates pinion and gear tooth counts through shaft angle \( \Sigma \). Mean cone distance \( R_m \) and mean module \( m_m \) define the virtual spur gear equivalent used for strength screening.

Tangential force acts at the mean pitch circle on the pitch cone. Bending and contact stresses use ISO 6336–style factors applied to the virtual cylindrical gear dimensions. Face width is limited by cone length and should not exceed \( R_m/3 \) without detailed analysis.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
\delta_1 = \arctan\left(\frac{\sin\Sigma}{N_2/N_1 + \cos\Sigma}\right), \quad \delta_2 = \Sigma - \delta_1
\]

\[
d_{m1} = m_m N_1, \quad R_m = \frac{d_{m1}}{2\sin\delta_1}
\]

\[
\sigma_F = \frac{W_t K_A K_V}{b m_m Y} \leq \sigma_{FP}, \quad \sigma_H \leq \sigma_{HP}
\]

**Numerical method**

Virtual spur gear transformation followed by gear rating checks shared with the spur gear module. Cone geometry computed from tooth counts and shaft angle; strength factors applied at mean section.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `pinionTeeth`, `gearTeeth` | Tooth counts |
| Shaft angle \( \Sigma \) | Usually 90° |
| `module`, `faceWidth` | Mean module and face width |
| `power`, `speed` | Operating conditions |
| Material allowables | Bending and contact limits |

**Outputs**

- Pitch cone angles, mean diameters, cone distance, tangential force, bending/contact utilization.

**Design codes & checks**

- **Indicative:** Lewis/ISO-style bending and contact screening
- **ISO:** ISO 10300 bevel gear load capacity (reference)
- **US:** AGMA 2003 bevel gear rating (reference)

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

- Straight or zerol bevel screening; spiral angle effects simplified.
- Virtual gear method — not full bevel-specific ISO 10300 factor set.
- Assumes proper mounting and lapping; no deflection under load.
- No scuffing or lapping contact pattern analysis.

**References**

1. ISO 10300-1:2014. *Calculation of load capacity of bevel gears*.
2. AGMA 2003-D19. *Rating the Pitting Resistance and Bending Strength of Generated Straight Bevel, Zerol Bevel and Spiral Bevel Gear Teeth*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
4. Maitra, G. M. *Handbook of Gear Design*, 2nd ed. McGraw-Hill.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
