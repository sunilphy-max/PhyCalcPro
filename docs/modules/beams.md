### Beam Analysis (`beams`) — **beta**

**Purpose**

Analyze one-dimensional prismatic beams under point loads, uniformly distributed loads (UDL), and applied moments. The module computes shear force, bending moment, slope, deflection, and bending stress along the span, then compares results against application-specific allowable stress and deflection limits with optional AISC 360 and EN 1993-1-1 screening checks.

**Physics & theory**

Euler–Bernoulli beam theory relates curvature to bending moment through \( \kappa = M/(EI) \), where \( E \) is Young's modulus and \( I \) is the second moment of area about the bending axis. For small deflections, the governing differential equation is \( EI\, \frac{d^4 w}{dx^4} = q(x) \), with boundary conditions set by the support type (simply supported, cantilever, or fixed–fixed).

Shear force \( V \) and bending moment \( M \) are obtained by equilibrium: \( V = \frac{dM}{dx} \) and \( q = \frac{dV}{dx} \). Bending stress at distance \( c \) from the neutral axis follows \( \sigma = \frac{Mc}{I} \). The solver uses a finite-element discretization of the beam with Hermite shape functions, enforcing displacement and slope continuity at nodes while applying concentrated and distributed loads through equivalent nodal forces.

Static equilibrium is verified by comparing the sum of vertical reactions to applied vertical load. Mesh density (`meshSegments`) controls spatial resolution; low segment counts may underpredict peak stress near concentrated loads.

Sign conventions follow standard structural practice: downward applied loads are positive, upward reactions positive, and sagging moments positive for horizontal beams. For cantilevers, maximum moment occurs at the fixed support; for simply supported beams with central point load, peak moment occurs at mid-span \( M_{\max} = PL/4 \). These closed-form benchmarks are used internally to validate the FEM solver against classical cases.

Application presets (lifting beam, machine frame, crane bridge) adjust load factor, allowable stress ratio, and deflection limit without implementing full code load combinations — the engineer must apply appropriate factors per the governing standard before relying on pass/fail flags.

**Governing equations**

\[
EI \frac{d^4 w}{dx^4} = q(x)
\]

\[
\sigma_{\max} = \frac{M_{\max} c}{I}, \quad \tau_{\mathrm{web}} \approx \frac{V_{\max}}{A_{\mathrm{web}}}
\]

\[
\delta_{\mathrm{limit}} = \frac{L}{\mathrm{deflectionLimitRatio}}
\]

For a simply supported beam with central point load \( P \):

\[
M_{\max} = \frac{PL}{4}, \quad \delta_{\max} = \frac{PL^3}{48EI}
\]

**Numerical method**

1D beam FEM (`beam-fem` solver): the span is meshed into `meshSegments` elements. Stiffness matrices are assembled for the selected support condition, loads are mapped to the global force vector, and the linear system is solved for nodal displacements and rotations. Post-processing differentiates shape functions to obtain shear, moment, slope, deflection, and stress along \( x \).

The solver pipeline executes in four stages: (1) validate geometry and material inputs; (2) build element stiffness matrices for the selected `support` type and assemble the global system; (3) apply equivalent nodal loads for point, UDL, and moment entries; (4) back-substitute for reactions and differentiate shape functions along the mesh. Results export as evenly spaced stations along the span for plotting in `CalculatorResultsShell`.

Physics checks report `staticEquilibriumResidual` (difference between total applied vertical load and sum of vertical reactions) and `finiteValues` flag. Warnings are issued when `meshSegments` < 20 because peak stress near point loads requires adequate mesh refinement.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length` | Beam span \( L \) |
| `E`, `I`, `c` | Elastic modulus, second moment, extreme fiber distance |
| `support` | `simply_supported`, `cantilever`, or `fixed_fixed` |
| `loads` | Point, UDL, or moment load cases |
| `meshSegments` | FEM discretization count (default ≥ 20 recommended) |
| Design code / application preset | Load factor, allowable stress, deflection ratio |

**Outputs**

- **Diagrams:** Shear \( V(x) \), moment \( M(x) \), slope, deflection \( w(x) \), stress \( \sigma(x) \) along the span
- **Peaks:** `maxShear`, `maxMoment`, `maxDeflection`, `maxStress` with station location
- **Reactions:** Support reaction forces and moments per constraint type
- **Equilibrium:** `staticEquilibriumResidual` from `physicsChecks`
- **Code checks:** Bending utilization, shear utilization, LTB utilization, deflection utilization per selected design code
- **Meta:** `solverMeta.meshSegments`, `solverMeta.warnings`, application context notes when preset selected

**Design codes & checks**

- **Indicative:** Roark / Euler–Bernoulli beam theory
- **US:** ASME BTH-1, B30.20 (lifting context); AISC 360 Ch. F/G (stress and deflection screening)
- **EU:** EN 13001, FKM analytical strength; EN 1993-1-1 §6.2
- **ISO:** ISO 8686, ISO 12100

**Assumptions & limitations**

- Linear elastic, prismatic cross-section; no large deflection or plasticity.
- 1D beam model — not a building-code member design check.
- LTB uses simplified unbraced length = span unless overridden.
- Shear check uses rectangular-web estimate from \( I \) and \( c \).
- Application presets adjust targets but do not implement full standard clauses.

**References**

1. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed. McGraw-Hill.
2. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed. Cengage.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22).
4. EN 1993-1-1:2005. *Eurocode 3 — Design of steel structures — Part 1-1: General rules and rules for buildings*.
5. Cook, R. D., et al. *Concepts and Applications of Finite Element Analysis*, 4th ed. Wiley — beam element formulation.
6. Hibbeler, R. C. *Structural Analysis*, 10th ed. Pearson — shear and moment diagrams.
