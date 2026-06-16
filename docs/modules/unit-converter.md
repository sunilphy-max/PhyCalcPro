### Unit Converter (`unit-converter`)

**Purpose**

Convert numeric values between engineering unit systems across PhyCalcPro dimensions — length, force, pressure, stress, energy, power, and related quantities. Ensures consistent SI base-unit handoff to all module solvers.

**Physics & theory**

Physical quantities are expressed as value × unit within a dimension (e.g., length in m, mm, in, ft). Conversion normalizes to SI base via `toBase`, then scales to target unit via `fromBase`. Dimensionality is enforced — force cannot convert to length.

Multi-system support (US customary, SI, mixed engineering units) aligns with `useDesignCodeUnits` and `ModuleUnitSelect` profiles across product modules. Temperature conversions may use offset scales (°C, °F, K) per dimension registry.

Technical tools integrate with the shared unit conversion and formula evaluation infrastructure used across product modules. Formula results should be verified against module solvers when both are available for the same physical quantity.

**Governing equations**

\[
Q_{\mathrm{target}} = Q_{\mathrm{source}} \cdot \frac{u_{\mathrm{source→base}}}{u_{\mathrm{target→base}}}
\]

For affine temperature: \( T_K = T_C + 273.15 \), \( T_F = 1.8\, T_C + 32 \).

**Numerical method**

Registry-based conversion (`unit-converter/engine` + `units/conversions.ts`): `toBase(value, dimension, fromUnit)` then `fromBase(base, dimension, toUnit)`. Physics dimensions validated against allowed unit keys per dimension type.

Supported dimensions include length, mass, force, pressure, stress, energy, power, torque, angle, temperature, and velocity — each mapped in `src/lib/physics/units.ts`. Invalid unit keys for a dimension return an error at conversion time rather than silently scaling by an incorrect factor.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `value` | Numeric magnitude |
| `dimension` | Physics dimension key |
| `fromUnit`, `toUnit` | Source and target unit strings |

**Outputs**

- `convertedValue` — numeric result in the target unit
- `fromUnit`, `toUnit` — echo of selected unit keys for audit trails
- `dimension` — physics dimension identifier used for the conversion

**Design codes & checks**

- **Indicative:** Unit conversion (utility tool)

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

- Conversions within single dimension only.
- Precision follows IEEE double — display rounding handled in UI.
- Non-SI industry units included per module profiles; not every obscure unit.
- Currency and dimensionless ratios not supported unless defined.
- Compound units (e.g., lbf·ft as derived entries) must use the predefined dimension registry.

**References**

1. NIST SP 811. *Guide for the Use of the International System of Units (SI)*.
2. ISO 80000 quantities and units series.
3. IEEE/ASTM SI 10. *American National Standard for Metric Practice*.
4. BIPM. *The International System of Units (SI)*, 9th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
