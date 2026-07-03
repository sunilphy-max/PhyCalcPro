### Fits & Clearances (`fits`)

**Purpose**

Calculate clearance or interference between mating cylindrical parts from ISO 286 tolerance designations or explicit upper/lower deviations. Classifies fit type as clearance, transition, or interference for shaft–hub assembly planning.

**Physics & theory**

ISO 286 defines fundamental deviation (position of tolerance zone) and IT grade (tolerance width) for holes and shafts. For nominal diameter \( D \), tolerance unit \( i = 0.45\sqrt[3]{D} + 0.001D \) (mm) scales IT grade. Hole basis system (H holes) is common: H7 hole paired with g6 shaft gives clearance fit H7/g6.

Assembly clearance \( c = D_{\mathrm{hole,min}} - D_{\mathrm{shaft,max}} \). Negative minimum clearance indicates interference fit requiring press or shrink assembly. Transition fits may have both clearance and interference over tolerance range.

Manufacturing modules support design-for-manufacture decisions early in product development. Tolerance analysis should identify critical dimensions in the stack — tightening non-critical tolerances increases cost without improving function.

Fit selection balances assembly ease, alignment precision, and load transmission. Interference fits provide torque capacity without keys but require controlled press force and material compatibility.

**Governing equations**

\[
i = 0.45 D^{1/3} + 0.001 D \quad \text{(µm, } D \text{ in mm)}
\]

\[
IT = i \times \mathrm{grade}
\]

\[
c_{\min} = (D + ES_{\min}^{\mathrm{hole}}) - (D + es_{\max}^{\mathrm{shaft}})
\]

**Numerical method**

Simplified ISO 286 IT multiplier (`solveFitsEngine`): letter codes (H, G, K, etc.) map to upper/lower deviations; clearance range computed from hole and shaft extrema. Fit type classified from \( c_{\min}, c_{\max} \).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `nominalSize` | Nominal diameter (m) |
| ISO hole letter/grade | e.g., H7 |
| ISO shaft letter/grade | e.g., g6 |
| Or explicit deviations | Upper/lower for hole and shaft |

**Outputs**

- Hole min/max diameter, shaft min/max diameter, clearance min/max, fit type classification.

**Design codes & checks**

- **Indicative:** Clearance / interference range
- **ISO:** ISO 286-1:2010 limits and fits


**Assumptions & limitations**

- Simplified deviation formulas — not full ISO 286 tables for all diameters/grades.
- Cylindrical fits only; flat fits and geometric tolerances separate.
- Does not compute assembly force for interference (see Shaft Hub Fits module).
- Temperature differential expansion not included.

**References**

1. ISO 286-1:2010. *Geometrical product specifications — Limits and fits*.
2. ISO 286-2:2010. *Tables of standard tolerance grades and limit deviations*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
4. BIS/ANSI B4.2 preferred metric limits and fits.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
