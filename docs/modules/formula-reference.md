### Engineering Formulas (`formula-reference`)

**Purpose**

Provide a searchable hub of common engineering formulas with mini-calculators for quick hand-checks. Bridges textbook equations and PhyCalcPro module workflows without full solver setup.

**Physics & theory**

The formula reference aggregates frequently used relations from mechanics, thermodynamics, fluids, and electrical domains — kinetic energy \( E = \frac{1}{2}mv^2 \), ideal gas law \( PV = nRT \), Hooke's law \( F = kx \), and similar. Each entry includes symbolic expression, input variables, and computed result with units.

Formulas serve verification: compare module output against independent calculation, or solve isolated problems not warranting a dedicated module. Safe expression evaluation prevents invalid operations; units are documented per formula.

**Governing equations**

Formula-specific — examples include:

\[
E_k = \frac{1}{2} m v^2
\]

\[
F = k x, \quad \sigma = \frac{F}{A}
\]

\[
P V = n R T
\]

**Numerical method**

Catalog lookup and evaluation (`formula-reference/engine`): `FORMULAS` registry maps `formulaId` to calculation function. Inputs passed as key-value record; result returned with unit label. Uses safe evaluator for expressions where applicable.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `formulaId` | Selected formula from catalog |
| `inputs` | Formula-specific numeric inputs |

**Outputs**

- Formula name, symbolic expression, numeric result, unit string.

**Design codes & checks**

- **Indicative:** Formula evaluation (reference tool)


**Assumptions & limitations**

- Reference-level accuracy; not tied to design code partial factors.
- Formula scope limited to catalog entries — not exhaustive handbook.
- Unit responsibility on user unless converter integrated.
- Does not replace validated module solvers for certified work.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed.
3. Marks' Standard Handbook for Mechanical Engineers, 12th ed.
4. CRC Handbook of Chemistry and Physics.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
