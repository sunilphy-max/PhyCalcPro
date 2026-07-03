### Rivet Analysis (`rivets`)

**Purpose**

Evaluate riveted joints for shear, bearing, and tear-out capacity with safety factors per classical joint design methods. Supports single-shear and double-shear lap and butt configurations.

**Physics & theory**

Rivets clamp plates by forming a head on installation, carrying load primarily in shear across the shank. Shear capacity is \( F_{\mathrm{shear}} = n \tau_{\mathrm{allow}} A_{\mathrm{rivet}} \) for \( n \) shear planes. Bearing on plate holes limits load: \( F_{\mathrm{bearing}} = n d t \sigma_{\mathrm{bearing}} \).

Tear-out removes material along plate edge: \( F_{\mathrm{tear}} = n (e - d/2) t \sigma_{\mathrm{tensile}} \) per rivet spacing \( e \). Governing capacity is minimum of shear, bearing, and tear-out modes divided by appropriate safety factor.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
F_{\mathrm{shear}} = n \frac{\pi d^2}{4} \tau_{\mathrm{allow}}
\]

\[
F_{\mathrm{bearing}} = n d t \sigma_{\mathrm{bearing,allow}}
\]

\[
F_{\mathrm{tear}} = n \left(e - \frac{d}{2}\right) t \sigma_{\mathrm{tensile}}
\]

**Numerical method**

Closed-form failure mode screening (`solver`). Each limit state computed independently; minimum capacity and governing mode reported with safety factors for applied load.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Rivet diameter \( d \), count | Geometry |
| Plate thickness \( t \), edge distance \( e \) | Layout |
| Shear planes \( n \) | Single or double shear |
| Material allowables | Rivet shear, plate bearing/tensile |
| Applied load | Joint service force |

**Outputs**

- Shear, bearing, tear-out capacities, governing mode, safety factors, recommended spacing check.

**Design codes & checks**

- **Indicative:** Shear and bearing safety factors
- **US:** AISC historical rivet specifications (reference)
- **EU:** EN 1993-1-8 riveted connections (reference)


**Assumptions & limitations**

- Static loading; fatigue of riveted joints not evaluated.
- Assumes filled holes and driven rivets at full shank contact.
- Corrosion and galvanic effects not included.
- Not for blind pop rivets in aerospace primary structure without additional factors.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. EN 1993-1-8:2005. *Design of joints — Riveted connections*.
3. AISC. *Steel Construction Manual*, rivet specifications (historical reference).
4. Kulak, G. L., et al. *Structural Joint Connections*. Prentice Hall.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
