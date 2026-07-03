### Safety Factor (`safety-factor`)

**Purpose**

Compute reserve factors (safety factors) for general stress states against yield and ultimate strength. Provides unified von Mises yield and ultimate safety metrics used across bolt, shaft, and joint screening workflows.

**Physics & theory**

Safety factor \( SF = \sigma_{\mathrm{limit}} / \sigma_{\mathrm{actual}} \) expresses margin before failure. For combined stresses, von Mises equivalent stress \( \sigma_{\mathrm{vm}} \) compares to yield \( \sigma_y \) for ductile design ( \( SF_y = \sigma_y / \sigma_{\mathrm{vm}} \) ) and to ultimate \( \sigma_u \) for fracture screening ( \( SF_u = \sigma_u / \sigma_{\mathrm{vm}} \) ).

Design practice targets \( SF \geq 1.5–4 \) depending on consequence of failure, load uncertainty, and code requirements. This module accepts direct stress components or pre-computed von Mises stress.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
\sigma_{\mathrm{vm}} = \sqrt{\frac{(\sigma_x - \sigma_y)^2 + (\sigma_y - \sigma_z)^2 + (\sigma_z - \sigma_x)^2 + 6(\tau_{xy}^2 + \tau_{yz}^2 + \tau_{zx}^2)}{2}}
\]

\[
SF_y = \frac{\sigma_y}{\sigma_{\mathrm{vm}}}, \quad SF_u = \frac{\sigma_u}{\sigma_{\mathrm{vm}}}
\]

**Numerical method**

Closed-form von Mises from stress tensor components or scalar input. Both yield and ultimate safety factors computed when material properties provided.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Stress components or \( \sigma_{\mathrm{vm}} \) | Actual stress state |
| `yieldStrength`, `ultimateStrength` | Material limits |
| Load type | Static or shock (informational) |

**Outputs**

- von Mises stress, yield safety factor, ultimate safety factor, pass/fail vs target SF.

**Design codes & checks**

- **Indicative:** Yield and ultimate von Mises safety factors


**Assumptions & limitations**

- Ductile von Mises criterion; brittle or anisotropic materials need different criteria.
- Static strength only; fatigue requires Fatigue module.
- Does not apply code partial factors (\( \gamma_M \)) automatically.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 5.
2. Dowling, N. E. *Mechanical Behavior of Materials*, 5th ed.
3. ASME BPVC Section VIII, Div. 2 — design-by-analysis safety factors.
4. EN 1993-1-1:2005. *Partial factors and resistance models*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
