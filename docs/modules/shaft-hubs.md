### Shaft Hub Fits (`shaft-hubs`)

**Purpose**

Estimate contact pressure and friction torque capacity for interference fits between shafts and hubs. Supports press-fit and shrink-fit screening for power transmission without keys.

**Physics & theory**

Interference fit creates radial contact pressure \( p \) at the shaft–hub interface from diametral interference \( \delta \). Thick-cylinder Lamé equations relate interference to pressure based on elastic moduli, Poisson's ratios, and geometry of shaft and hub.

Friction torque capacity is \( T = 2 \pi r^2 \mu p L \) for interface radius \( r \), friction coefficient \( \mu \), and contact length \( L \). Minimum interference must overcome assembly force and operating load without slip. Maximum pressure must not exceed yield of hub or shaft at bore.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
p = \frac{\delta}{\frac{r}{E_h}(1-\nu_h) + \frac{r}{E_s}(1-\nu_s) + \frac{r^2}{E_h(r_o^2 - r^2)}}
\]

\[
T_{\mathrm{max}} = 2 \pi \mu p r^2 L
\]

\[
\sigma_{\theta,\max} = p \frac{r_o^2 + r^2}{r_o^2 - r^2}
\]

**Numerical method**

Lamé thick-cylinder closed-form for contact pressure from specified interference or fit tolerance. Friction torque from user \( \mu \). Stress in hub bore compared to yield allowable.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Shaft/hub diameters | Nominal and interference |
| Outer hub radius | Hub OD |
| Material \( E \), \( \nu \), yield | Shaft and hub |
| Contact length \( L \) | Fit engagement length |
| Friction coefficient \( \mu \) | Dry or lubricated assembly |

**Outputs**

- Contact pressure, hub hoop stress, friction torque capacity, torque utilization, minimum interference recommendation.

**Design codes & checks**

- **Indicative:** Contact pressure and friction torque capacity
- **ISO:** ISO 286 fit tolerances (with Fits module)
- **DIN:** DIN 7190 interference fits (reference)

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

- Elastic analysis; plastic deformation during press-fit not fully modeled.
- Uniform pressure along length; no hub flange or step effects.
- Friction coefficient highly variable with surface finish and lubricant.
- Fatigue of interference joints not evaluated.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
2. DIN 7190:2017. *Interference fits — Calculation and design rules*.
3. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, thick cylinders.
4. ISO 286-1:2010. *Limits and fits*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
