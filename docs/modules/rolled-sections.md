### Rolled Sections (`rolled-sections`)

**Purpose**

Look up geometric and structural properties for standard hot-rolled steel sections — W, S, M, C, MC, L, and HP shapes — from embedded catalog data for beam, column, and connection design.

**Physics & theory**

Hot-rolled structural sections are manufactured to dimensional tolerances in AISC, ASTM, and EN catalogs. Tabulated properties include depth, flange width, web thickness, area \( A \), major/minor inertia \( I_x, I_y \), plastic and elastic section moduli \( Z, S \), and torsion constant \( J \).

Design modules consume these properties for bending stress \( \sigma = M/S \), buckling slenderness \( \lambda = KL/r \), and connection geometry (cope depth, flange thickness). Weight per foot derives from area and steel density 7850 kg/m³.

Catalog entries follow AISC Steel Construction Manual dimensions; tolerances and fillet radii affect connection detailing but are not modeled in the property lookup.

**Governing equations**

\[
\sigma = \frac{M}{S_x}, \quad \lambda = \frac{K L}{r_x}
\]

\[
w = \rho A g \quad \text{(weight per unit length)}
\]

**Numerical method**

Catalog lookup (`engine` + `data.ts`): section designation string maps to tabulated dimensions and properties. Interpolation between sizes not performed — nearest standard designation required.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Section designation | e.g., W12×26, C10×20 |
| Catalog system | AISC imperial or metric |
| Property requested | \( A, I, S, Z, r, J \) |

**Outputs**

- Full dimension set, structural properties, weight per length, depth/width for detailing.

**Design codes & checks**

- **Indicative:** Section area and inertia lookup
- **US:** AISC Steel Construction Manual shapes database
- **EU:** EN 10365 hot rolled sections (where catalog overlap exists)


**Assumptions & limitations**

- Properties from published catalog snapshots; verify against current mill literature for certified work.
- Simple shapes only; built-up and plated sections not in catalog.
- Torsion constant \( J \) for open sections is approximate.
- Not all international section families included.

**References**

1. AISC. *Steel Construction Manual*, 16th ed., property tables.
2. ASTM A6/A6M. *General requirements for rolled structural steel*.
3. EN 10365:2017. *Hot rolled steel channels, I and H sections*.
4. EN 1993-1-1:2005. *Classification of cross-sections*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
