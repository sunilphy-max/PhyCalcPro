### Rolled Sections (`rolled-sections`)

**Purpose**

Look up geometric and structural properties for standard hot-rolled steel sections — W, S, M, C, MC, L, and HP shapes — from embedded catalog data for beam, column, and connection design.

**Physics & theory**

Hot-rolled structural sections are manufactured to dimensional tolerances in AISC, ASTM, and EN catalogs. Tabulated properties include depth, flange width, web thickness, area \( A \), major/minor inertia \( I_x, I_y \), plastic and elastic section moduli \( Z, S \), and torsion constant \( J \).

Design modules consume these properties for bending stress \( \sigma = M/S \), buckling slenderness \( \lambda = KL/r \), and connection geometry (cope depth, flange thickness). Weight per foot derives from area and steel density 7850 kg/m³.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
\sigma = \frac{M}{S_x}, \quad \lambda = \frac{K L}{r_x}
\]

\[
w = \rho A g \quad \text{(weight per unit length)}
\]

**Numerical method**

Catalog lookup (`engine` + `data.ts`): section designation string maps to tabulated dimensions and properties. Interpolation between sizes not performed — nearest standard designation required.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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
