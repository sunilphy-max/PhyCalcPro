### Plain Bearings (`plain-bearings`)

**Purpose**

Screen hydrodynamic journal and thrust pad bearings (ISO 7902 / ISO 12130 / ISO 12131 screening) with Sommerfeld number, minimum film thickness, power loss, and temperature rise. Supports preliminary bearing design before detailed Reynolds equation solution.

**Physics & theory**

In a journal bearing, rotating shaft (journal) separates from the bushing by a lubricant film when sufficient speed generates hydrodynamic pressure. The Sommerfeld number \( S = (\mu n / p)(r/c)^2 \) characterizes operation, where \( \mu \) is viscosity, \( n \) is speed, \( p \) is unit load, \( r \) is radius, and \( c \) is radial clearance.

Minimum film thickness \( h_{\min} \) occurs near the maximum pressure arc; it must exceed composite surface roughness to avoid boundary contact. Eccentricity ratio \( \varepsilon \) is interpolated from Raimondi–Boyd \( \varepsilon(S) \) charts (full journal, \( L/D \approx 1 \) screening). Power loss is viscous shear in the film. Outlet temperature uses a light **2–3 pass ΔT ↔ viscosity** iteration (Walther screening scale on the user viscosity); short-bearing / single-zone limits remain.

**Governing equations**

\[
S = \frac{\mu n}{p}\left(\frac{r}{c}\right)^2, \quad p = \frac{W}{2 r L}
\]

\[
h_{\min} = c(1 - \varepsilon)
\]

**Numerical method**

Sommerfeld + Raimondi–Boyd \( \varepsilon(S) \), iterative mean-film temperature viscosity. Inputs: diameter, length, clearance, load, speed, viscosity, ambient temperature. Outputs: \( S \), \( h_{\min} \), eccentricity, power loss, specific load, outlet T, shaft/housing fit recommendation.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Journal / pad diameter, length | Bearing geometry |
| Radial clearance \( c \) | Assembly clearance |
| `load`, `speed` | Operating W and rpm |
| Oil viscosity \( \mu \) | At ambient / stated reference temperature (or from oil catalog) |
| Oil catalog | ~25 ISO VG mineral/PAO/ester grades → ν(T) |
| Bushing material | ~12 materials with specific-load / PV / temp limits |
| Ambient temperature | For ΔT iteration and outlet T |
| Bearing type | Journal / thrust pad / tilting pad |

**Outputs**

- Sommerfeld number, eccentricity ratio, minimum film thickness, film parameter / specific load, power loss, outlet temperature
- Live **Design Summary** rail (S, \( h_{\min} \), specific load, outlet T, status)
- Deterministic **plain advisor** (L/D, clearance, viscosity, pad count rationale + alternatives)
- Sectioned PDF / Excel (Design Summary, film factors, recommendation)
- Status banner with ε, film ratio, load-limit highlights

**Design codes & checks**

- **ISO 7902** — Hydrodynamic plain journal screening
- **ISO 12130 / 12131** — Tilting-pad / thrust pad screening
- Specific load and temperature screening limits

**Assumptions & limitations**

- Full journal, steady-state; oil catalog + Walther ν(T); light ΔT ↔ viscosity iteration (not full flow heat balance).
- Raimondi–Boyd ε(S) interpolated for L/D ∈ {0.25…1.5} — still not full finite-length Reynolds solution.
- No dynamic instability (oil whirl/whip) analysis.
- No MITCalc-IV-class sliding material + oil flow database.

**Design workflow**

- **Validate / Calculate:** Forward ISO 7902/12130 screening with mode-aware Calculate label.
- **Auto-design:** Available via design workflow where wired.

**References**

1. Hamrock, B. J., Schmid, S. R., & Jacobson, B. O. *Fundamentals of Fluid Film Lubrication*, 2nd ed. CRC Press.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 12.
3. ISO 7902-1:2020. *Calculation of plain bearings — Hydrodynamic plain journal bearings*.
4. Bassani, R., & Piccigallo, B. *Hydrostatic Lubrication*. Elsevier.
5. PhyCalcPro verification benchmarks in `src/data/verification/` (`plain-bearings-indicative-*.json`).
