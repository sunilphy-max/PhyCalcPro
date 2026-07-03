### Hydrogen Systems (`hydrogen-systems`)

**Purpose**

Screen gaseous hydrogen storage mass, energy content, vessel hoop stress, leak mass flow, and vent area using ideal gas relations. Supports preliminary H₂ storage and vent line sizing with code awareness notes.

**Physics & theory**

Ideal gas storage: \( m = PV M / (R T) \) for pressure \( P \), volume \( V \), molar mass \( M \), gas constant \( R \), temperature \( T \). Lower heating value energy \( E \approx m \times 120 \) MJ/kg for screening. Thin-wall hoop stress \( \sigma_h = Pr/t \).

Leak through orifice approximated by \( \dot{m} = C_d A \sqrt{2 \rho \Delta P} \) with discharge coefficient \( C_d \) and gas density \( \rho = m/V \). High-pressure hydrogen deviates from ideal gas — compressibility factor \( Z \) needed above ~10 MPa for accurate mass.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
m = \frac{P V M}{R T}
\]

\[
\sigma_h = \frac{P r}{t}
\]

\[
\dot{m} = C_d A \sqrt{2 \rho \Delta P}
\]

**Numerical method**

Ideal gas and thin-wall stress (`advanced-systems/calculators`). Warning when pressure > 10 MPa recommends real-gas and code vessel checks. Vent area back-calculated from leak flow relation.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `pressure`, `volume`, `temperature` | Storage conditions |
| `vesselRadius`, `wallThickness` | Vessel geometry |
| `dischargeCoefficient`, `orificeArea` | Leak path |
| `ventDeltaP` | Vent differential pressure |

**Outputs**

- Stored mass (kg), energy content (J), hoop stress (Pa), gas density, leak mass flow, vent area.

**Design codes & checks**

- **Indicative:** Storage mass, hoop stress, leak/vent screening
- **ISO:** ISO 19880 hydrogen fueling (context)
- **US:** ASME B31.12 hydrogen piping; NFPA 2 hydrogen technologies


**Assumptions & limitations**

- Ideal gas; high-P requires compressibility correction.
- Thin-wall vessel; composite Type IV tanks need specialized rules.
- Leak flow is orifice model — not relief valve certified sizing.
- Material compatibility (hydrogen embrittlement) not evaluated.

**References**

1. NFPA 2:2020. *Hydrogen Technologies Code*.
2. ASME B31.12:2019. *Hydrogen Piping and Pipelines*.
3. ISO 19880-1:2020. *Gaseous hydrogen — Fuelling stations*.
4. SAE J2579. *Technical Information Report on Fuel Systems in Fuel Cell Vehicles*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
