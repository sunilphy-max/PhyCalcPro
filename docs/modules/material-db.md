### Material Database (`material-db`)

**Purpose**

Provide searchable reference data for engineering material properties — elastic moduli, strength, density, thermal expansion — used as defaults across PhyCalcPro modules. Centralizes material selection for consistent handoff to solvers.

**Physics & theory**

Material properties govern every stress, deflection, and thermal calculation. Young's modulus \( E \) and shear modulus \( G \) define elastic stiffness; yield \( \sigma_y \) and ultimate \( \sigma_u \) set strength limits. Density \( \rho \) enters dynamic and weight calculations. Thermal expansion coefficient \( \alpha \) drives thermal strain \( \varepsilon_{\mathrm{th}} = \alpha \Delta T \).

The database stores room-temperature baseline values with optional temperature derating hooks to the Temperature Properties module. Properties are indicative — certified design requires mill test reports or code-approved tabulated values.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
G = \frac{E}{2(1+\nu)}, \quad \sigma = E \varepsilon
\]

\[
\rho_{\mathrm{weight}} = \rho \cdot V \cdot g
\]

**Numerical method**

Reference lookup (`engine`): keyed access to material records by name/alloy. No numerical solve — property retrieval and unit conversion to module base SI units.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Material name / alloy | e.g., Steel 4140, Al 6061-T6 |
| Property requested | \( E \), \( G \), \( \sigma_y \), \( \rho \), etc. |
| Temperature (optional) | For derated lookup |

**Outputs**

- Property values in selected units, source note, temperature derating factor if linked.

**Design codes & checks**

- **Indicative:** Property reference lookup
- **US:** MMPDS / ASM material datasheets (reference)
- **EU:** EN material standards (reference)


**Assumptions & limitations**

- Room-temperature defaults unless temperature module linked.
- Not a substitute for certified material test certificates.
- Cast vs wrought, grain direction, and heat treatment variants may differ.
- Database completeness varies by alloy family.

**References**

1. ASM International. *ASM Handbook Volume 2 — Properties and Selection*.
2. MMPDS-15. *Metallic Materials Properties Development and Standardization*.
3. MatWeb Material Property Data (reference methodology).
4. ISO 6892-1:2019. *Metallic materials — Tensile testing*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
