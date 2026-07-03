### Keys & Splines (`keys-splines`)

**Purpose**

Calculate torque capacity of parallel keys and splines from shear and bearing stress limits on key, shaft, and hub. Supports rectangular and square keys per ISO 3912 screening.

**Physics & theory**

Keys transmit torque \( T \) between shaft and hub through shear in the key and bearing on shaft/hub keyways. Tangential force \( F_t = 2T/d \) at shaft diameter \( d \). Key shear stress \( \tau = F_t/(b L) \) for key width \( b \) and bearing length \( L \).

Bearing stress on shaft or hub side is \( \sigma_b = F_t/(h L) \) using key height \( h \). Splines multiply effective bearing area by number of teeth with load sharing factor. Stress concentration at keyway corners reduces fatigue strength — static screening only unless Kt applied.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
F_t = \frac{2T}{d}
\]

\[
\tau_{\mathrm{key}} = \frac{F_t}{b L} \leq \tau_{\mathrm{allow}}
\]

\[
\sigma_{\mathrm{bearing}} = \frac{F_t}{h L} \leq \sigma_{\mathrm{b,allow}}
\]

**Numerical method**

Closed-form shear and bearing checks for selected key standard size or custom dimensions. Spline mode applies tooth count and load-sharing factor per ISO 3912 simplified method.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `torque`, shaft diameter | Operating load |
| Key type/size | Standard or custom \( b \times h \times L \) |
| Material allowables | Key and hub shear/bearing |
| Spline teeth (optional) | For spline analysis |

**Outputs**

- Tangential force, key shear stress, bearing stress, utilizations, governing failure mode.

**Design codes & checks**

- **Indicative:** Key shear and bearing capacity
- **ISO:** ISO 3912 parallel keys and keyways


**Assumptions & limitations**

- Uniform load along key length; no torsion along key overhang.
- Static or slowly varying torque; no fatigue per DIN 6892 full method.
- Set-screws and taper keys use different models.
- Hub wall thickness must support bearing — not checked here.

**References**

1. ISO 3912:2019. *Parallel keys and keyways*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
3. DIN 6892:2012. *Drive type connections — Keys*.
4. Peterson, R. E. *Stress Concentration Factors* (keyway Kt).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
