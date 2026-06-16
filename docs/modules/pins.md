### Pins & Clevis (`pins`)

**Purpose**

Analyze pins, clevis joints, and shear connections for double or single shear failure modes including pin shear and plate bearing capacity. Used for linkage and lifting lug screening.

**Physics & theory**

A pin in double shear carries load on two shear planes: \( \tau = F/(2A) \) for pin area \( A = \pi d^2/4 \). Single shear has one plane. Bearing stress on clevis plates is \( \sigma_b = F/(d t) \) per plate thickness \( t \) in contact.

Governing capacity is the minimum of pin shear strength and plate bearing strength on each side. Bending of pin between clevis ears may add combined stress if gap is large relative to pin diameter — simplified models treat short pins as pure shear.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
\tau_{\mathrm{pin}} = \frac{F}{n_s A_{\mathrm{pin}}} \leq \tau_{\mathrm{allow}}
\]

\[
\sigma_{\mathrm{bearing}} = \frac{F}{d t} \leq \sigma_{\mathrm{b,allow}}
\]

\[
SF = \min\left(\frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{pin}}}, \frac{\sigma_{\mathrm{b,allow}}}{\sigma_{\mathrm{bearing}}}\right)
\]

**Numerical method**

Closed-form shear and bearing screening (`engine`). User selects single or double shear, pin diameter, plate thickness, and material allowables.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pin diameter \( d \) | Pin size |
| Plate thickness(es) | Clevis ear thickness |
| Shear planes | Single or double |
| Applied force \( F \) | Joint load |
| Allowables | Pin shear, plate bearing |

**Outputs**

- Pin shear stress, bearing stress, safety factors, governing mode.

**Design codes & checks**

- **Indicative:** Pin shear and bearing safety factors
- **US:** ASME BTH-1 pin connections (lifting context)

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

- Pin bending neglected for standard short clevis proportions.
- No wear or fretting on pin bore.
- Static load; fatigue not computed.
- Assumes aligned holes without eccentricity.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. ASME BTH-1-2020. *Design of Below-the-Hook Lifting Devices*.
3. MIL-HDBK-5 (MMPDS) — pin and joint allowables (reference).
4. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
