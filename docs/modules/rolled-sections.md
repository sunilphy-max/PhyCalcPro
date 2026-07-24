---
seoTitle: "Rolled Steel Section Lookup: W, S, C, L, HP Shape Properties"
seoDescription: "How engineers look up structural properties of standard hot-rolled steel sections — W, S, C, MC, L, HP — for beam, column, and connection design."
guideHeadline: "How Engineers Look Up Rolled Steel Sections"
keywords: ["rolled sections", "W shape", "steel beam", "AISC shapes", "section properties lookup", "structural steel"]
---

### Rolled Steel Sections (`rolled-sections`)

## How engineers look up rolled section data

Structural steel design starts with a catalog. Engineers select standard hot-rolled shapes — W, S, M, C, MC, L, HP — because they are widely available, well-documented, and optimised for bending or axial load. The lookup provides depth, flange width, web thickness, area, inertia, section moduli, and torsion constant so that beam, column, and connection checks can proceed without manual transcription.

This guide explains catalog conventions, how to screen by required dynamic rating or inertia, and how to feed results into structural solvers.

## Section families and when to use them

| Designation | Profile | Typical use |
|-------------|---------|-------------|
| W (wide-flange) | I-shape, wide flanges | Beams, columns, moment frames |
| S (American Standard) | I-shape, tapered flanges | Legacy beams, crane rails |
| C / MC (channel) | Channel | Light framing, bracing, stiffeners |
| L (angle) | Equal or unequal leg | Bracing, lintels, connection angles |
| HP (bearing pile) | Near-square I-shape | Driven piles, heavy columns |
| HSS (hollow) | Square / rectangular tube | Columns, trusses, exposed structures |
| WT / ST (tee) | Cut from W or S | Truss chords, hanger connections |

## Engineering workflow

1. **Establish loads** — bending moment, axial force, shear, connection geometry.
2. **Determine required capacity** — minimum \(S_x\) or \(Z_x\) for bending, \(A\) for axial, \(r\) for slenderness.
3. **Filter catalog** — by designation family, bore/depth, weight limits, and availability.
4. **Read properties** — \(A\), \(d\), \(b_f\), \(t_w\), \(t_f\), \(I_x\), \(I_y\), \(S_x\), \(Z_x\), \(r_x\), \(r_y\), \(J\).
5. **Check capacity** — push properties into beam, column, or combined-loading modules.
6. **Verify detailing** — cope depth, bolt gauge, flange/web thickness for connections.

## Key quantities and formulas

Bending stress from section modulus:

\[
\sigma = \frac{M}{S_x}
\]

Column slenderness ratio:

\[
\lambda = \frac{K\,L}{r}
\]

Weight per unit length from area and steel density:

\[
w = \rho\,A\,g
\]

Compact section check (AISC):

\[
\frac{b_f}{2\,t_f} \leq 0.38\sqrt{\frac{E}{F_y}}
\]

## Worked example

**Given:** Simply supported beam, span 6 m, uniform load 25 kN/m, steel Fy = 345 MPa. Select a W shape.

1. Maximum moment \(M = wL^2/8 = 25 \times 6^2/8 = 112.5\) kN·m.
2. Required elastic section modulus \(S_x \geq M / (0.6 F_y) = 112.5 \times 10^3 / (0.6 \times 345) = 543\) cm\(^3\).
3. Search catalog for W shapes with \(S_x \geq 543\) cm\(^3\). A W310×44.5 provides \(S_x = 633\) cm\(^3\) — adequate.
4. Verify slenderness: \(r_y = 40.1\) mm, unbraced length 6 m, \(\lambda_y = 6000/40.1 = 150\) — lateral-torsional buckling governs; add bracing or choose a deeper section.

## Common mistakes and checks

- Selecting on **strong-axis \(I_x\)** alone without checking **weak-axis buckling** or lateral-torsional stability.
- Confusing **elastic** \(S\) and **plastic** \(Z\) section moduli in capacity checks.
- Using **old catalog editions** — dimensions and availability change with mill updates.
- Ignoring **web crippling and shear** at concentrated loads or supports.
- Forgetting that **HSS** properties differ from open W shapes for torsion.
- Mixing **imperial** and **metric** designations without verifying units.

## FAQ

### What do the numbers in W12×26 mean?

W indicates wide-flange family, 12 is the nominal depth in inches, and 26 is the weight in pounds per foot. Metric equivalents use mm depth and kg/m weight.

### How accurate are catalog properties?

Published catalog values follow AISC or EN dimensional standards with manufacturing tolerances. For certified work, confirm against the current edition of the steel construction manual or mill certificate.

### Can I compare AISC and EN sections?

Yes — the calculator displays properties in consistent units. Filter by catalog system (AISC imperial or EN metric) and compare \(I\), \(S\), and weight side by side.

### What is the torsion constant J for open sections?

For open I-shapes, \(J\) is the Saint-Venant torsion constant — typically small. Warping constant \(C_w\) governs lateral-torsional buckling capacity and is also listed in catalog tables.

## Use the PhyCalcPro calculator

Open the [Rolled sections lookup](/products/materials/rolled-sections). Select a designation family and catalog system; browse or search by depth, weight, or property threshold. View the full property set and push results into beam, column, or connection solvers.

**Purpose**

Look up geometric and structural properties for standard hot-rolled steel sections — W, S, M, C, MC, L, and HP shapes — from embedded catalog data for beam, column, and connection design.

**Physics & theory**

Hot-rolled structural sections are manufactured to dimensional tolerances per AISC, ASTM, and EN catalogs. Tabulated properties include depth, flange width, web thickness, area \(A\), major/minor inertia \(I_x, I_y\), plastic and elastic section moduli \(Z, S\), and torsion constant \(J\). Design modules consume these properties for bending stress \(\sigma = M/S\), buckling slenderness \(\lambda = KL/r\), and connection geometry.

**Governing equations**

\[
\sigma = \frac{M}{S_x}, \quad \lambda = \frac{K\,L}{r}
\]

\[
w = \rho\,A\,g
\]

**Numerical method**

Catalog lookup: section designation string maps to tabulated dimensions and properties. Interpolation between sizes is not performed — the nearest standard designation is required.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Section designation | e.g., W12×26, C10×20 |
| Catalog system | AISC imperial or metric |
| Property requested | \(A, I, S, Z, r, J\) |

**Outputs**

- Full dimension set, structural properties, weight per length, depth/width for detailing.

**Design codes & checks**

- **Indicative:** Section area and inertia lookup
- **US:** AISC Steel Construction Manual shapes database
- **EU:** EN 10365 hot rolled sections (where catalog overlap exists)

**Assumptions & limitations**

- Properties from published catalog snapshots; verify against current mill literature for certified work.
- Simple shapes only; built-up and plated sections not in catalog.
- Torsion constant \(J\) for open sections is approximate.
- Not all international section families included.

**References**

1. AISC. *Steel Construction Manual*, 16th ed., property tables.
2. ASTM A6/A6M. *General requirements for rolled structural steel*.
3. EN 10365:2017. *Hot rolled steel channels, I and H sections*.
4. EN 1993-1-1:2005. *Classification of cross-sections*.
