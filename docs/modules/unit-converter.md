---
seoTitle: "Engineering Unit Converter: Stress, Force, Length & 40+ Dimensions"
seoDescription: "How engineers convert between unit systems — SI, US customary, and mixed engineering units — across 40+ physical dimensions with full equivalence tables."
guideHeadline: "How Engineers Convert Between Unit Systems"
keywords: ["unit converter", "engineering units", "SI conversion", "US customary", "stress units", "pressure conversion"]
---

### Unit Converter (`unit-converter`)

## How engineers convert between unit systems

Mixed units are an everyday hazard. A German mill certificate lists yield in MPa, an American code table uses ksi, and a shop drawing shows inches while the FEA model is in millimetres. One wrong conversion factor can turn a safe design into a failure. A reliable unit converter that enforces dimensional consistency — force cannot become length — eliminates transcription errors and provides a full equivalence table for audit trails.

This guide covers supported dimensions, the conversion model, and common pitfalls with affine scales (temperature) and compound units.

## Dimension families and common conversions

| Dimension | Example units | Notes |
|-----------|--------------|-------|
| Length | m, mm, in, ft, mil | Most frequent conversion |
| Force | N, kN, lbf, kgf | Weight vs force confusion |
| Stress / pressure | Pa, MPa, psi, ksi, bar | Code tables vary by system |
| Moment / torque | N·m, kN·m, lbf·ft, lbf·in | Beam/shaft design |
| Area | mm², cm², in², ft² | Section properties |
| Mass | kg, g, lb, slug | Density and dynamics |
| Temperature | °C, °F, K, °R | Affine (offset) scales |
| Energy | J, kJ, BTU, ft·lbf, kWh | Thermal and mechanical |
| Power | W, kW, hp, BTU/h | Motor and thermal sizing |
| Velocity | m/s, km/h, ft/s, mph | Flow and dynamics |
| Density | kg/m³, lb/ft³, g/cm³ | Material properties |
| Flow rate | m³/s, L/min, gpm | Hydraulic and cooling |

## Engineering workflow

1. **Identify source dimension** — what physical quantity is being converted (stress, not force).
2. **Select source and target units** — from the dimension's unit registry.
3. **Enter value** — numeric magnitude.
4. **Read result** — converted value plus full equivalence table for all registered units.
5. **Verify sanity** — 1 MPa = 145 psi, 1 inch = 25.4 mm, 1 lbf = 4.448 N.

## Key quantities and formulas

Linear conversion model:

\[
Q_{\mathrm{target}} = Q_{\mathrm{source}} \cdot \frac{k_{\mathrm{source \to base}}}{k_{\mathrm{target \to base}}}
\]

Affine temperature conversions:

\[
T_K = T_C + 273.15, \quad T_F = 1.8\,T_C + 32
\]

Compound unit example (stress):

\[
1\;\mathrm{MPa} = 10^6\;\mathrm{Pa} = 145.038\;\mathrm{psi}
\]

## Worked example

**Given:** A vessel design pressure of 150 psi. Convert to MPa and bar for an EN code check.

1. Select dimension: pressure.
2. Enter 150 psi.
3. Result: \(150 \times 6.89476 \times 10^{-3} = 1.034\) MPa = 10.34 bar.
4. Equivalence table also shows 103.4 kPa, 1.021 atm, 10{,}342 mmH₂O.

## Common mistakes and checks

- Confusing **mass** (kg) and **force** (kgf or N) — especially in legacy metric drawings.
- Forgetting the **offset** in temperature — °C to K is additive, not multiplicative.
- Using **psi for stress** when the code table is in **ksi** (factor of 1000).
- Mixing **lbf·ft** (torque) and **ft·lbf** (energy) — dimensionally identical, contextually different.
- Dropping **prefixes** — MPa vs Pa is a factor of 10⁶.

## FAQ

### Can I convert between different dimensions?

No. The converter enforces dimensional consistency — force cannot convert to length. If you need a derived quantity (e.g., stress = force / area), compute it in the appropriate module.

### How is precision handled?

Conversion factors use IEEE 754 double precision internally. Display rounding is controlled in the UI — the underlying value retains full precision for downstream calculations.

### Are all unit systems supported?

The converter covers SI, US customary, and common engineering units. Obscure or industry-specific units may not be registered. Compound units (e.g., lbf·ft) must use predefined dimension entries.

### How does this interact with module unit selectors?

Each PhyCalcPro module has per-field unit selectors backed by the same conversion registry. The standalone converter is for quick lookups; module-level selectors handle conversion at the solver boundary automatically.

## Use the PhyCalcPro calculator

Open the [Unit converter](/products/tools/unit-converter). Select a physical dimension, enter a value with source unit, and read the converted result plus a full equivalence table for all units in the dimension.

**Purpose**

Convert numeric values between engineering unit systems across PhyCalcPro dimensions — length, area, mass, force, stress, pressure, moment, torque, energy, power, velocity, flow, density, frequency, time, temperature, and related quantities.

**Physics & theory**

Physical quantities are expressed as value times unit within a dimension. Conversion normalises to SI base via `toBase`, then scales to target unit via `fromBase`. Dimensionality is enforced — force cannot convert to length. Temperature conversions use offset (affine) scales.

**Governing equations**

\[
Q_{\mathrm{target}} = Q_{\mathrm{source}} \cdot \frac{k_{\mathrm{source \to base}}}{k_{\mathrm{target \to base}}}
\]

For affine temperature: \(T_K = T_C + 273.15\), \(T_F = 1.8\,T_C + 32\).

**Numerical method**

Registry-based conversion: `toBase(value, dimension, fromUnit)` then `fromBase(base, dimension, toUnit)`. The UI lists every unit registered for the selected dimension and live-updates a full equivalence table.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Value | Numeric magnitude |
| Dimension | Physics dimension key |
| From unit, to unit | Source and target unit strings |

**Outputs**

- Converted value in target unit, echo of unit keys, equivalence table for all units in the dimension.

**Design codes & checks**

- **Indicative:** Unit conversion (utility tool)

**Assumptions & limitations**

- Conversions within a single dimension only.
- Precision follows IEEE double — display rounding handled in UI.
- Not every obscure unit is registered.
- Currency and mixed dimensionless ratios are not supported.

**References**

1. NIST SP 811. *Guide for the Use of the International System of Units (SI)*.
2. ISO 80000 quantities and units series.
3. IEEE/ASTM SI 10. *American National Standard for Metric Practice*.
4. BIPM. *The International System of Units (SI)*, 9th ed.
