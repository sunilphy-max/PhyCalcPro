### Gear Ratio Design (`gear-ratio-design`)

**Purpose**

Search integer tooth-count combinations to achieve a target speed ratio within specified tolerance. Optimizes for compactness, balanced wear, or minimum total teeth subject to interference and manufacturing constraints.

**Physics & theory**

Gear ratio for external spur gears is \( i = N_g/N_p = \omega_p/\omega_g \). Only integer tooth counts are manufacturable, so exact ratios are approximated: \( i_{\mathrm{actual}} = N_g/N_p \approx i_{\mathrm{target}} \). Error \( \epsilon = |i_{\mathrm{actual}} - i_{\mathrm{target}}|/i_{\mathrm{target}} \) must fall within tolerance for synchronized drives.

Minimum tooth counts avoid undercut in standard involute profiles (typically \( N \geq 17 \) for 20° pressure angle without profile shift). Hunting tooth combinations (where common factors of \( N_p \) and \( N_g \) exceed 1) distribute wear unevenly — coprime tooth counts are preferred for long life.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
i = \frac{N_g}{N_p}, \quad \epsilon = \frac{|N_g/N_p - i_{\mathrm{target}}|}{i_{\mathrm{target}}}
\]

\[
N_p + N_g \to \min \quad \text{subject to } \gcd(N_p, N_g) = 1
\]

**Numerical method**

Exhaustive or bounded integer search over tooth count ranges. Filters candidates by minimum teeth, interference, and ratio error. Ranks solutions by total teeth, center distance, or hunting tooth preference.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `targetRatio` | Desired \( i \) |
| `tolerance` | Maximum ratio error |
| `minTeeth`, `maxTeeth` | Search bounds |
| `module` | For center distance estimate |
| Preferences | Min total teeth, coprime requirement |

**Outputs**

- Ranked tooth-count pairs, actual ratio, ratio error, center distance, hunting tooth flag.

**Design codes & checks**

- **Indicative:** Ratio error screening

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Design practice note**

Screening results from this module inform preliminary sizing and design reviews. Final designs subject to applicable regulations, customer specifications, and qualified engineering approval should use full code-compliant methods, manufacturer data, and test validation beyond the indicative checks shown in PhyCalcPro.

**Assumptions & limitations**

- External spur pair; internal or compound trains not searched.
- No profile shift or helical overlap considered.
- Center distance assumes standard involute with zero backlash.
- Does not verify bending/contact capacity — use Gear Design module.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
2. AGMA 917-B97. *Design Manual for Parallel Shaft Fine-Pitch Gearing*.
3. ISO 21771:2007. *Cylindrical involute gears and gear pairs — Concepts*.
4. Buckingham, E. *Analytical Mechanics of Gears*. Dover.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
