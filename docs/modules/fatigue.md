### Fatigue Assessment (`fatigue`)

**Purpose**

Estimate fatigue life and mean-stress-adjusted allowable alternating stress using S–N curves, Marin modification factors, and Goodman, Gerber, or Morrow mean-stress corrections. Supports rotating bending, axial, and torsion load types.

**Physics & theory**

Fatigue failure occurs below yield after many stress cycles. The S–N curve relates alternating stress amplitude \( S_a \) to life \( N \). Endurance limit \( S_e' \) at \( 10^6 \) cycles is modified by Marin factors: surface finish \( k_a \), size \( k_b \), load type \( k_c \), giving \( S_e = k_a k_b k_c S_e' \).

Mean stress \( S_m \) reduces allowable alternating stress. Modified Goodman: \( S_a/S_e + S_m/S_u = 1 \). Gerber uses parabolic mean-stress locus; Morrow uses true fracture strength. Basquin log-linear relation between \( 10^3 \) and \( 10^6 \) cycles predicts finite life: \( S_f = a N^b \).

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
\frac{S_a}{S_e} + \frac{S_m}{S_u} = 1 \quad \text{(Modified Goodman)}
\]

\[
S_e = k_a k_b k_c S_e', \quad k_a = a S_u^b \quad \text{(surface finish)}
\]

\[
S_f = a N^b, \quad a = \frac{(f S_u)^2}{S_e}, \quad b = -\frac{\log_{10}(f S_u / S_e)}{3}
\]

**Numerical method**

Closed-form Marin factors (Shigley Table 6-2), mean-stress correction, and Basquin life prediction (`engine`). Surface finish, size, load type, and method selectable. Infinite life flagged when \( S_a \leq S_e \) after mean-stress correction.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `alternatingStress`, `meanStress` | \( S_a \), \( S_m \) |
| `ultimateStrength`, `enduranceLimit` | Material fatigue data |
| `surfaceFinish`, `loadType` | Marin factors |
| `characteristicDiameter` | Size factor (rotating bending) |
| `meanStressMethod` | goodman, gerber, or morrow |

**Outputs**

- Modified endurance limit, allowable alternating stress, predicted cycles to failure, infinite-life flag
- Marin factor breakdown.

**Design codes & checks**

- **Indicative:** Modified Goodman utilization, estimated fatigue life
- **ISO:** ISO 12107 fatigue of metallic materials
- **US:** ASME VIII-2 fatigue screening (reference)

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

- Uniaxial stress state; multiaxial fatigue needs equivalent stress approaches.
- No notch sensitivity \( K_f \) unless user adjusts endurance limit.
- Constant amplitude loading; variable amplitude needs Miner's rule extension.
- No environmental corrosion-fatigue interaction.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 6.
2. ISO 12107:2012. *Metallic materials — Fatigue testing — Statistical planning*.
3. Dowling, N. E. *Mechanical Behavior of Materials*, 5th ed.
4. Peterson, R. E. *Stress Concentration Factors*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
