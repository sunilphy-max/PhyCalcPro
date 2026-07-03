### Weld Group Analysis (`welds`) — **beta**

**Purpose**

Analyze weld groups under direct shear, torsion, and eccentric loading by computing throat shear stress distribution and combined throat stress utilization per AWS D1.1 and EN 1993-1-8 screening methods.

**Physics & theory**

Fillet welds are sized by effective throat \( a_e = 0.707 a \) for equal-leg fillets. Throat area resists shear; normal stress on throat is often neglected for fillet welds in simplified analysis. For a weld group of total throat area \( A_w \), direct shear is \( \tau = V/A_w \).

Eccentric load \( e \) creates moment resisted by weld group polar moment \( J_w \) about the group centroid: combined shear \( \tau = \sqrt{\tau_V^2 + \tau_M^2} \). Common patterns (rectangle, circle, line) have tabulated \( J_w \) formulas. Allowable throat shear is typically \( 0.3 F_u \) (AWS) or partial factor per EN.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
\tau_V = \frac{V}{A_w}, \quad \tau_M = \frac{M c}{J_w}
\]

\[
\tau_{\mathrm{combined}} = \sqrt{\tau_V^2 + \tau_M^2} \leq \tau_{\mathrm{allow}}
\]

\[
A_w = 0.707 \cdot a \cdot L_{\mathrm{total}}
\]

**Numerical method**

Closed-form throat shear for standard weld group geometries. Centroid and polar moment computed from weld segment coordinates. Combined stress checked against code allowable; eccentric moment from load offset.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Weld segments | Length, position, leg size \( a \) |
| Applied shear \( V \), moment \( M \) | Loading |
| Eccentricity | Load offset from centroid |
| Electrode strength \( F_u \) | Weld metal ultimate |
| Design code | AWS D1.1 or EN 1993-1-8 |

**Outputs**

- Throat shear components, combined throat stress, utilization, critical weld segment location.

**Design codes & checks**

- **Indicative:** Throat shear and combined stress
- **US:** AWS D1.1/D1.1M structural welding code
- **EU:** EN 1993-1-8 fillet weld design rules


**Assumptions & limitations**

- Elastic distribution; no plastic redistribution in weld group.
- Fillet welds only; groove weld tension not included.
- Brittle fracture and fatigue of welds require separate analysis.
- Leg size must meet minimum per material thickness tables.

**References**

1. AWS D1.1/D1.1M:2020. *Structural Welding Code — Steel*.
2. EN 1993-1-8:2005. *Design of joints — Welded connections*.
3. Blodgett, O. W. *Design of Welded Structures*. James F. Lincoln Arc Welding Foundation.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
