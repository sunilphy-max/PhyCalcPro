---
seoTitle: "Rivet Joint Calculator – Shear, Bearing & Tear-Out Capacity Analysis"
seoDescription: "Evaluate riveted joints for shear, bearing, and tear-out capacity with safety factors for single-shear and double-shear lap and butt joint configurations."
guideHeadline: "Engineering guide to riveted joint design and failure mode analysis"
keywords:
  - rivet calculator
  - rivet shear strength
  - bearing stress rivet
  - tear-out failure
  - riveted joint design
  - single shear rivet
  - double shear connection
---

### Rivet Analysis (`rivets`)

## How engineers analyze riveted joints

Riveted joints connect plates by forming heads on solid shanks driven through aligned holes. Although largely replaced by welding and high-strength bolts in structural steel, rivets remain important in aerospace (solid and blind rivets), boiler repair, and heritage structures. Analyzing a riveted joint means checking three distinct failure modes — rivet shear, plate bearing, and plate tear-out — then reporting the governing (weakest) mode with its safety factor.

## Joint types and configurations

| Type | Shear planes | Description |
|------|-------------|-------------|
| Single-shear lap joint | 1 | Two overlapping plates, one shear plane per rivet |
| Double-shear butt joint | 2 | Cover plates on both sides, two shear planes per rivet |
| Multi-row pattern | 1 or 2 | Staggered or chain rows for higher capacity |
| Blind (pop) rivet | 1 | Installed from one side, lower capacity |

## Engineering workflow

1. Determine the total joint load and load direction.
2. Select rivet diameter, material, and pattern (pitch, edge distance, rows).
3. Calculate rivet shear capacity per shear plane.
4. Calculate plate bearing capacity at each hole.
5. Calculate plate tear-out (net section) capacity.
6. Identify the governing failure mode (minimum capacity).
7. Compute safety factor as governing capacity divided by applied load.
8. Adjust rivet count or size if safety factor is insufficient.

## Key quantities and formulas

Rivet shear capacity:

\[
F_{\text{shear}} = n_s \frac{\pi d^2}{4} \tau_{\text{allow}}
\]

Plate bearing capacity:

\[
F_{\text{bearing}} = n_s \, d \, t \, \sigma_{\text{b,allow}}
\]

Plate tear-out (net section):

\[
F_{\text{tear}} = (p - d) \, t \, \sigma_{\text{t,allow}}
\]

Joint efficiency:

\[
\eta_j = \frac{\min(F_{\text{shear}}, F_{\text{bearing}}, F_{\text{tear}})}{p \, t \, \sigma_{\text{t,allow}}}
\]

## Worked example

A single-shear lap joint with 4 rivets of 16 mm diameter, plate thickness 10 mm, pitch 48 mm, edge distance 24 mm. Rivet allowable shear 100 MPa, plate bearing allowable 250 MPa, plate tensile allowable 160 MPa.

- Shear per rivet: \( F_s = 1 \times \pi \times 16^2/4 \times 100 = 20\,106 \) N.
- Bearing per rivet: \( F_b = 1 \times 16 \times 10 \times 250 = 40\,000 \) N.
- Net section per pitch: \( F_t = (48 - 16) \times 10 \times 160 = 51\,200 \) N.
- Governing: shear at 20.1 kN per rivet. Total joint capacity = 80.4 kN.

## Common mistakes and checks

- **Ignoring edge distance requirements:** too-close holes cause plate tear-out before rivet shear.
- **Using bolt allowables for rivets:** driven rivet material has different shear strength than bolt grades.
- **Forgetting hole clearance:** rivet holes are typically 1–2 mm larger than the rivet — reduce net section accordingly.
- **Mixing shear plane counts:** some rivets in a pattern may be in single shear while others are in double shear.

## FAQ

### When are rivets preferred over bolts?

In aerospace aluminum structures (flush rivets for aerodynamics), in heritage steel structures where codes require rivets, and in vibration environments where rivet heads resist loosening.

### How does double shear improve capacity?

Double shear provides two failure planes per rivet, doubling the shear capacity compared to single shear for the same rivet diameter.

### What is joint efficiency?

Joint efficiency is the ratio of the weakest failure-mode capacity to the strength of the unperforated plate. Higher efficiency means less strength is lost to the holes.

### Can this module analyze blind rivets?

The shear and bearing checks apply to any rivet type. Blind rivet capacity should use manufacturer-specified shear values rather than solid rivet allowables.

### How does corrosion affect riveted joints?

Corrosion reduces rivet cross-section and plate thickness. In heritage assessments, measure actual dimensions and apply corrosion derating factors.

## Use the PhyCalcPro calculator

Open the [Rivet Analysis calculator](/products/fasteners/rivets) to enter rivet diameter, count, plate thickness, edge distance, and material allowables. The tool returns shear, bearing, and tear-out capacities, governing mode, safety factors, and joint efficiency.

---

**Purpose**

Evaluate riveted joints for shear, bearing, and tear-out capacity with safety factors per classical joint design methods.

**Physics & theory**

Rivets clamp plates by forming a head on installation, carrying load primarily in shear across the shank. Shear capacity is \( F_s = n_s \tau_{\text{allow}} A_{\text{rivet}} \) for \( n_s \) shear planes. Bearing on plate holes limits load. Tear-out removes material along the plate edge. Governing capacity is the minimum of all modes divided by the appropriate safety factor.

**Governing equations**

\[
F_{\text{shear}} = n_s \frac{\pi d^2}{4} \tau_{\text{allow}}
\]

\[
F_{\text{bearing}} = n_s \, d \, t \, \sigma_{\text{b,allow}}
\]

\[
F_{\text{tear}} = (p - d) \, t \, \sigma_{\text{t,allow}}
\]

**Numerical method**

Closed-form failure mode screening. Each limit state computed independently; minimum capacity and governing mode reported with safety factors.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Rivet diameter \( d \), count | Geometry |
| Plate thickness \( t \), edge distance | Layout |
| Shear planes \( n_s \) | Single or double shear |
| Material allowables | Rivet shear, plate bearing/tensile |
| Applied load | Joint service force |

**Outputs**

- Shear, bearing, tear-out capacities, governing mode, safety factors, joint efficiency.

**Design codes & checks**

- **Indicative:** Shear and bearing safety factors
- **US:** AISC historical rivet specifications (reference)
- **EU:** EN 1993-1-8 riveted connections (reference)

**Assumptions & limitations**

- Static loading; fatigue of riveted joints not evaluated.
- Assumes filled holes and driven rivets at full shank contact.
- Corrosion and galvanic effects not included.
- Not for blind pop rivets in aerospace primary structure without additional factors.

**Verification**

- CI: `rivets-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. EN 1993-1-8:2005. *Design of joints — Riveted connections*.
3. AISC. *Steel Construction Manual*, rivet specifications (historical reference).
4. Kulak, G. L., et al. *Structural Joint Connections*. Prentice Hall.
