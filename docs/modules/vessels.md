### Pressure Vessels (`vessels`)

**Purpose**

Design and analyze cylindrical and spherical pressure vessel shells for internal pressure using thin-wall and thick-wall (Lamé) theory with ASME VIII-1 UG-27 and EN 13445 screening checks.

**Physics & theory**

Thin cylindrical shells (\( t/R \leq 0.1 \)): hoop stress \( \sigma_h = pR/t \) governs; longitudinal \( \sigma_l = pR/(2t) \). Spherical shells: \( \sigma = pR/(2t) \). Required thickness \( t = pR/(SE - 0.6p) \) per ASME UG-27 with joint efficiency \( E \) and allowable stress \( S \).

Thick-wall cylinders use Lamé stresses varying through wall thickness. Heads (elliptical, hemispherical, flat) have separate formulas for discontinuity stresses at shell–head junction — simplified screening may treat head as equivalent sphere segment.

Pressure systems combine membrane stress from internal pressure with bending from weight, thermal expansion, and external loads. ASME codes distinguish sustained, occasional, and peak stress categories with different allowable limits reflecting primary vs secondary stress character.

Thin-wall theory applies when wall thickness is small compared to radius; thick-wall Lamé solutions are required for heavy-wall vessels and high-pressure cylinders.

**Governing equations**

\[
t = \frac{p R}{S E - 0.6 p} \quad \text{(cylindrical, ASME UG-27)}
\]

\[
\sigma_h = \frac{p r}{t}, \quad \sigma_l = \frac{p r}{2t}
\]

\[
\sigma_r = \frac{p_i r_i^2 - p_o r_o^2}{r_o^2 - r_i^2} - \frac{(p_i - p_o) r_i^2 r_o^2}{r_o^2 - r_i^2} \frac{1}{r^2} \quad \text{(Lamé)}
\]

**Numerical method**

Thin/thick-wall closed-form with optional FEM mesh for nozzle or head transitions (`engine`, `mesh`). Required thickness and hoop utilization computed per selected code. Joint efficiency and corrosion allowance user-specified.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius`, `thickness` | Shell geometry |
| `pressure` | Internal design pressure |
| Material allowable \( S \), yield | Code allowable |
| Joint efficiency \( E \) | Seam weld factor |
| Corrosion allowance | Added to required \( t \) |
| Head type | Cylinder, sphere, elliptical |

**Outputs**

- Hoop/longitudinal stress, required thickness, utilization, thick vs thin-wall flag.

**Design codes & checks**

- **Indicative:** Hoop stress and required thickness screening
- **US:** ASME VIII-1 UG-27
- **EU:** EN 13445-3 design rules

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- No detailed nozzle reinforcement per UG-37 unless extended.
- Wind/seismic external loads not combined unless user superposes.
- Fatigue evaluation per VIII-2 not included.
- MDMT and impact testing requirements not evaluated.

**References**

1. ASME BPVC Section VIII, Division 1 (2023). UG-27.
2. EN 13445-3:2021. *Unfired pressure vessels — Design*.
3. Harvey, J. F. *Theory and Design of Pressure Vessels*, 2nd ed.
4. Bednar, H. H. *Pressure Vessel Design Handbook*, 3rd ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
