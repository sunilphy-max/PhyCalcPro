### Column Buckling (`columns`) — **beta**

**Purpose**

Evaluate elastic stability of slender compression members using finite-element buckling analysis and compare applied axial load to Euler critical load and code column curves. Supports fixed, pinned, and guided end conditions with optional initial imperfection for practical capacity estimates.

**Physics & theory**

When a straight column is compressed, lateral deflection grows once the axial load exceeds the critical value. Euler's formula for a pinned-pinned column gives \( P_{\mathrm{cr}} = \pi^2 EI/L_{\mathrm{eff}}^2 \), where \( L_{\mathrm{eff}} = K L \) depends on end restraint through the effective length factor \( K \).

Real columns fail below \( P_{\mathrm{cr}} \) due to residual stresses, initial curvature, and material yield interaction. Design codes replace pure Euler buckling with column curves relating normalized slenderness \( \lambda \) to buckling reduction factor \( \chi \). The FEM solver assembles a geometric stiffness matrix \( \mathbf{K}_g \) proportional to axial load and solves the eigenvalue problem \( (\mathbf{K} + \lambda \mathbf{K}_g)\mathbf{v} = 0 \) for buckling modes.

End restraint sets the effective length factor \( K \): pinned–pinned (\( K=1 \)), fixed–fixed (\( K=0.5 \)), and cantilever (\( K=2 \)) bracket most practical cases. Initial imperfection amplifies lateral deflection below \( P_{\mathrm{cr}} \) and reduces the usable capacity in code column curves.

The solver validates positive length, area, and stiffness before eigenvalue extraction and rejects disconnected or unrestrained models.

**Governing equations**

\[
P_{\mathrm{cr}} = \frac{\pi^2 EI}{L_{\mathrm{eff}}^2}
\]

\[
\lambda = \frac{L_{\mathrm{eff}}}{i}, \quad i = \sqrt{I/A}
\]

\[
\frac{P}{P_{\mathrm{cr}}} \leq \frac{1}{\mathrm{SF}}, \quad \chi \frac{A f_y}{\gamma_M} \geq N_{\mathrm{Ed}}
\]

**Numerical method**

Linear buckling FEM (`femSolver`): the column is meshed along its length. Elastic stiffness \( \mathbf{K} \) and geometric stiffness \( \mathbf{K}_g(P) \) are assembled for the selected end conditions. The lowest positive eigenvalue yields critical load and buckling mode shape. Post-processing compares \( P/P_{\mathrm{cr}} \) to AISC 360 §E3 and EN 1993-1-1 §6.3 curve checks.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length` | Member length \( L \) |
| `E`, `I`, `A` | Material and section properties |
| `P` | Applied axial compressive load |
| End conditions | Effective length factor or fixity |
| `fy` | Yield strength for code curves |
| Design code | US (AISC), EU (EN), or Indicative |

**Outputs**

- Critical load \( P_{\mathrm{cr}} \), buckling mode shape, slenderness ratio, utilization per selected code
- Euler safety factor \( P_{\mathrm{cr}}/P \).

**Design codes & checks**

- **Indicative:** Euler buckling \( P_{\mathrm{cr}}/P \)
- **US:** AISC 360-22 Chapter E (flexural buckling)
- **EU:** EN 1993-1-1 §6.3 buckling curves
- **ISO:** ISO 10721 compression member context


**Assumptions & limitations**

- Elastic buckling eigenvalue; inelastic column curves applied post-hoc per code.
- Single-axis flexural buckling; no torsional or flexural-torsional modes unless section data extended.
- Uniform prismatic section along length.
- Validated against Euler closed-form for standard end conditions.

**References**

1. Timoshenko, S. P., & Gere, J. M. *Theory of Elastic Stability*, 2nd ed. McGraw-Hill.
2. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter E.
3. EN 1993-1-1:2005. *Eurocode 3 — Buckling of members*.
4. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
