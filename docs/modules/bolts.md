### Bolt Calculator (`bolts`)

**Purpose**

Analyze threaded fasteners including power screw efficiency, bolt pattern stiffness, and VDI 2230 single-bolt preloaded joint worksheet. Computes tensile, shear, bearing utilization and preload margin for mechanical joints.

**Physics & theory**

Bolted joints clamp parts together with initial preload \( F_i \) from torque \( T = K F_i d \), where \( K \) is nut factor. External tensile load \( F_e \) shares between bolt and members by stiffness: bolt load increment \( \Delta F_b = F_e k_b/(k_b + k_m) \). Separation occurs when preload is lost.

Shear may be carried by friction (when clamped) or bolt shank/threads in bearing. Combined tension and shear uses interaction criteria per AISC J3 or VDI 2230. Power screws convert torque to axial force with efficiency \( \eta = \tan\lambda / \tan(\lambda + \phi) \) for square/Acme threads.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
F_b = F_i + \frac{k_b}{k_b + k_m} F_e
\]

\[
\tau_{\mathrm{thread}} = \frac{F_{\mathrm{shear}}}{A_s}, \quad \sigma_t = \frac{F_b}{A_t}
\]

\[
T = K F_i d, \quad \eta_{\mathrm{screw}} = \frac{\tan\lambda}{\tan(\lambda + \phi)}
\]

**Numerical method**

Dual paths: (1) Power screw and pattern analysis via FEA stiffness (`femSolver`); (2) VDI 2230 worksheet for high-fidelity single-bolt joints with embedding, thermal, and tightening scatter. Validators enforce thread and geometry consistency.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Bolt size, grade, thread pitch | Geometry and material |
| Preload / torque | Installation |
| External tensile, shear | Service loads |
| Member stiffness or grip length | Joint configuration |
| Analysis mode | Power screw, pattern, or VDI 2230 |

**Outputs**

- Bolt and member load sharing, tensile/shear/bearing utilization, preload safety margin, torque recommendation
- VDI 2230 assembly preload range.

**Design codes & checks**

- **Indicative:** Tensile, shear, bearing utilization
- **US:** AISC 360-22 Chapter J3
- **EU:** EN 1993-1-8, VDI 2230 Part 1


**Assumptions & limitations**

- Linear elastic joint behavior; no gasket creep long-term model unless VDI embedding used.
- VDI 2230 is single-bolt centric; patterns use simplified stiffness superposition.
- Power screw FEA validated against Shigley benchmarks.
- Does not replace licensed pressure vessel or nuclear QA bolt procedures.

**References**

1. VDI 2230 Part 1:2015. *Systematic calculation of highly stressed bolted joints*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 8.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter J3.
4. EN 1993-1-8:2005. *Design of joints*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
