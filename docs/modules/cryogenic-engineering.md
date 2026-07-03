### Cryogenic Engineering (`cryogenic-engineering`)

**Purpose**

Estimate conductive and radiative heat leak, cryogen boil-off rate, cooldown energy, and cooldown time for low-temperature systems. Screens cryostat and transfer line thermal performance at preliminary design stage.

**Physics & theory**

Steady heat leak through insulation path: conduction \( Q_c = k A \Delta T / L \) and radiation between grey surfaces \( Q_r = \varepsilon \sigma A (T_h^4 - T_c^4) \). Total leak \( Q = Q_c + Q_r \) drives boil-off \( \dot{m} = Q / h_{fg} \) for latent heat \( h_{fg} \).

Transient cooldown energy to reach cold temperature: \( E = m c_p \Delta T \). Cooldown time with available refrigeration \( t = E / Q_{\mathrm{cool}} \). Multi-layer insulation (MLI) effective conductivity is user-supplied lumped value — detailed layer-by-layer analysis not included.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
Q_c = \frac{k A \Delta T}{L}, \quad Q_r = \varepsilon \sigma A (T_h^4 - T_c^4)
\]

\[
\dot{m}_{\mathrm{boil}} = \frac{Q \cdot 86400}{h_{fg}} \quad \text{(kg/day)}
\]

\[
E_{\mathrm{cool}} = m c_p \Delta T, \quad t_{\mathrm{cool}} = \frac{E_{\mathrm{cool}}}{P_{\mathrm{cool}}}
\]

**Numerical method**

Lumped thermal screening (`advanced-systems/calculators`). Conduction and radiation summed; boil-off and cooldown computed algebraically. Warning when heat leak exceeds entered cooling power.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `hotTemperature`, `coldTemperature` | Boundary temperatures (K) |
| `area`, `pathLength`, `conductivity` | Conduction path |
| `emissivity` | Radiation surface |
| `coldMass`, `specificHeat` | Thermal mass |
| `latentHeat` | Cryogen latent heat (J/kg) |
| `coolingPower` | Available cryocooler capacity (W) |

**Outputs**

- Total heat leak (W), boil-off rate (kg/day), cooldown energy (J), cooldown time (s), warnings.

**Design codes & checks**

- **Indicative:** Heat leak, boil-off, cooldown screening
- **CGA/NASA:** Cryogenic handling practice (reference context)


**Assumptions & limitations**

- Lumped effective properties; no detailed MLI layer model.
- Steady-state leak; transient gradients not resolved.
- No pressure relief, embrittlement, or two-phase flow in vent lines.
- Cooldown assumes constant cooling power.

**References**

1. Scott, R. B. *Cryogenic Engineering*, 2nd ed. Van Nostrand.
2. Flynn, T. M. *Cryogenic Engineering*, 2nd ed. CRC Press.
3. NASA SP-5023. *Cryogenic Systems* (historical reference).
4. CGA G-4. *Safe Handling of Cryogenic Liquids*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
