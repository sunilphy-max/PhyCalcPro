---
seoTitle: "Fits & Clearances Calculator – ISO 286 Tolerance & Fit Classification"
seoDescription: "Calculate clearance or interference between mating cylindrical parts from ISO 286 tolerance designations. Classify fit type as clearance, transition, or interference."
guideHeadline: "Engineering guide to ISO 286 fits and clearances for shaft-hole assemblies"
keywords:
  - fits calculator
  - ISO 286 tolerance
  - clearance fit
  - interference fit
  - transition fit
  - hole basis system
  - shaft tolerance grade
---

### Fits & Clearances (`fits`)

## How engineers select fits for shaft-hole assemblies

Every time a shaft enters a hole, the fit determines whether the assembly slides freely, has controlled clearance for lubrication, or requires press force for permanent attachment. ISO 286 standardizes this by defining fundamental deviations (zone position) and tolerance grades (zone width) for holes and shafts. Engineers select a fit designation (e.g., H7/g6) from tables, then compute the resulting clearance or interference range.

## Fit categories

| Category | Description | Example |
|----------|-------------|---------|
| Clearance fit | Always positive clearance | H7/f6 — running fit |
| Transition fit | May have clearance or interference | H7/k6 — locating fit |
| Interference fit | Always negative clearance (press) | H7/p6 — press fit |
| Running fit | Large clearance for lubrication | H8/e7 — journal bearing |
| Push fit | Light interference, hand assembly | H7/h6 — slip fit |

## Engineering workflow

1. Define the nominal diameter of the mating parts.
2. Select the fit system — hole basis (H holes) is most common.
3. Choose hole and shaft designations from ISO 286 tables based on function.
4. Look up or compute fundamental deviations for each designation.
5. Apply the IT grade tolerance width.
6. Calculate min and max diameters for hole and shaft.
7. Compute minimum and maximum clearance (or interference).
8. Classify the fit as clearance, transition, or interference.
9. Verify the fit meets functional requirements (assembly ease, alignment, load capacity).

## Key quantities and formulas

Tolerance unit:

\[
i = 0.45 \, D^{1/3} + 0.001 \, D \quad \text{(\mu m, } D \text{ in mm)}
\]

IT grade tolerance width:

\[
IT = k \times i
\]

where \( k \) is the grade multiplier (e.g., IT6: \( k = 10 \), IT7: \( k = 16 \)).

Minimum clearance:

\[
c_{\min} = D_{\text{hole,min}} - D_{\text{shaft,max}}
\]

Maximum clearance:

\[
c_{\max} = D_{\text{hole,max}} - D_{\text{shaft,min}}
\]

## Worked example

Fit H7/g6 at nominal diameter 50 mm.

- Tolerance unit: \( i = 0.45 \times 50^{1/3} + 0.001 \times 50 = 1.71 \) \(\mu\)m.
- H7 hole: ES = +25 \(\mu\)m, EI = 0 (fundamental deviation for H).
- g6 shaft: es = -9 \(\mu\)m, ei = -25 \(\mu\)m.
- Hole: 50.000 to 50.025 mm. Shaft: 49.975 to 49.991 mm.
- Min clearance: 50.000 - 49.991 = 0.009 mm. Max clearance: 50.025 - 49.975 = 0.050 mm.
- Classification: clearance fit (both limits positive).

## Common mistakes and checks

- **Confusing hole and shaft deviation conventions:** uppercase letters (H, G, K) are for holes; lowercase (h, g, k) for shafts.
- **Using the wrong nominal diameter range:** ISO 286 tables change at diameter breakpoints (e.g., 30–50 mm, 50–80 mm).
- **Ignoring surface finish effects:** rough surfaces reduce effective clearance in running fits and reduce interference in press fits.
- **Forgetting thermal expansion:** a clearance fit at room temperature may become an interference fit at operating temperature.

## FAQ

### What is the most common fit system?

Hole basis (H holes) is standard because holes are harder to adjust than shafts. The hole tolerance zone is fixed at H, and the shaft designation is varied to achieve the desired fit.

### How do I convert between metric and inch tolerancing?

ISO 286 is metric. ANSI B4.2 provides equivalent preferred metric fits. Direct conversion requires applying the tolerance unit formula with diameter in mm.

### When should I use an interference fit instead of a key?

When the connection must be completely concentric with no backlash, when stress concentrations from keyways are unacceptable, or when the joint must be sealed.

### What is a transition fit used for?

Transition fits provide precise alignment while allowing either slight clearance or slight interference. They are used for locating parts (bearing in housing bores, dowel pins).

### Can temperature change convert a clearance fit to an interference fit?

Yes — if the shaft expands more than the hole (e.g., steel shaft in aluminum housing at elevated temperature), clearance decreases and may become interference.

## Use the PhyCalcPro calculator

Open the [Fits & Clearances calculator](/products/manufacturing/fits) to enter the nominal size, hole designation, and shaft designation (or explicit deviations). The tool returns hole and shaft limit dimensions, clearance range, and fit type classification.

---

**Purpose**

Calculate clearance or interference between mating cylindrical parts from ISO 286 tolerance designations or explicit deviations. Classifies fit type as clearance, transition, or interference.

**Physics & theory**

ISO 286 defines fundamental deviation (position of tolerance zone) and IT grade (tolerance width) for holes and shafts. Tolerance unit \( i = 0.45\sqrt[3]{D} + 0.001D \) scales IT grade. Assembly clearance \( c = D_{\text{hole,min}} - D_{\text{shaft,max}} \). Negative minimum clearance indicates interference. Transition fits may have both clearance and interference over the tolerance range.

**Governing equations**

\[
i = 0.45 \, D^{1/3} + 0.001 \, D
\]

\[
IT = k \times i
\]

\[
c_{\min} = D_{\text{hole,min}} - D_{\text{shaft,max}}
\]

**Numerical method**

Simplified ISO 286 IT multiplier: letter codes map to upper/lower deviations; clearance range computed from hole and shaft extrema. Fit type classified from \( c_{\min}, c_{\max} \).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `nominalSize` | Nominal diameter (mm) |
| ISO hole letter/grade | e.g., H7 |
| ISO shaft letter/grade | e.g., g6 |
| Or explicit deviations | Upper/lower for hole and shaft |

**Outputs**

- Hole min/max diameter, shaft min/max diameter, clearance min/max, fit type classification.

**Design codes & checks**

- **Indicative:** Clearance / interference range
- **ISO:** ISO 286-1:2010 limits and fits

**Assumptions & limitations**

- Simplified deviation formulas — not full ISO 286 tables for all diameter/grade combinations.
- Cylindrical fits only; flat fits and geometric tolerances separate.
- Does not compute assembly force for interference (see Shaft Hub Fits module).
- Temperature differential expansion not included.

**References**

1. ISO 286-1:2010. *Geometrical product specifications — Limits and fits*.
2. ISO 286-2:2010. *Tables of standard tolerance grades and limit deviations*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
4. ANSI B4.2. *Preferred metric limits and fits*.
