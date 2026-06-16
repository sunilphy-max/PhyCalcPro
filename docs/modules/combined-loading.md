### Combined Loading (`combined-loading`) — **beta**

**Purpose**

Evaluate combined axial, bending, torsion, and shear stresses in a rectangular cross-section and compute von Mises equivalent stress and safety factor. Used for quick screening of machine elements and structural members under multiaxial loading without full 3D FEA.

**Physics & theory**

Real components rarely experience a single stress mode. Axial force \( F \) produces uniform normal stress \( \sigma_a = F/A \). Bending moment \( M \) creates linear normal stress \( \sigma_b = Mc/I \). Torque \( T \) generates torsional shear \( \tau_t = Tc/J \) for a rectangular section using the thin-wall approximation \( J \approx wh^3/3 \). Direct shear from transverse force adds \( \tau_v = V/A \).

Normal stresses from axial and bending load superpose: \( \sigma = \sigma_a + \sigma_b \). For ductile materials under combined normal and shear stress, the von Mises (distortion energy) criterion gives equivalent stress \( \sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2} \). Safety factor is \( SF = \sigma_y / \sigma_{\mathrm{vm}} \).

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

**Governing equations**

\[
\sigma_a = \frac{F}{A}, \quad \sigma_b = \frac{M c}{I}, \quad \tau_t = \frac{T c}{J}
\]

\[
\sigma_{\mathrm{vm}} = \sqrt{(\sigma_a + \sigma_b)^2 + 3\tau_t^2}
\]

\[
SF = \frac{\sigma_y}{\sigma_{\mathrm{vm}}}
\]

**Numerical method**

Closed-form evaluation: section properties \( A \), \( I_{xx} \), and \( J \) are computed from rectangular width and height. Individual stress components are calculated algebraically; von Mises stress and safety factor follow directly. Design status flags `safe`, `warning`, or `critical` based on threshold ratios (SF ≥ 2 safe, ≥ 1.25 warning).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `width`, `height` | Rectangular section dimensions |
| `axialForce` | Axial load \( F \) |
| `bendingMoment` | Bending moment \( M \) |
| `torque` | Torsional moment \( T \) |
| `shearForce` | Transverse shear \( V \) |
| `yieldStrength` | Material yield \( \sigma_y \) |

**Outputs**

- Section properties \( A \), \( I_{xx} \), \( J \)
- stress components
- von Mises stress
- safety factor
- design status.

**Design codes & checks**

- **Indicative:** Von Mises combined stress
- **US:** AISC 360-22 Chapter H (combined forces)
- **EU:** EN 1993-1-1 Clause 6.2.1 equivalent stress
- **ISO:** ISO 10828 equivalent stress methods

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Solid rectangular section; not I-beams, tubes, or arbitrary profiles.
- Elastic linear superposition; no buckling or local instability.
- Torsion uses rectangular approximation; thin-wall or circular sections need dedicated checks.
- Shear stress from transverse force is averaged over area (not parabolic distribution).

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed. McGraw-Hill.
2. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter H.
4. EN 1993-1-1:2005. *Eurocode 3 — Clause 6.2*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
