### Bearing Selection (`bearings`)

**Purpose**

Rolling-element bearing screening per ISO 281 (basic and modified rating life) and ISO 76 static load check. Catalog-backed C, C₀, geometry, and limiting speed for deep-groove, angular-contact, and cylindrical-roller bearings.

**Physics & theory**

Basic rating life L₁₀ is the life in revolutions (or hours at speed n) exceeded by 90% of bearings under constant equivalent load P = C:

\[
L_{10h} = \frac{a_1 \cdot 10^6}{60 n} \left(\frac{C}{P}\right)^p, \quad p = 3 \text{ (ball)}, \; 10/3 \text{ (roller)}
\]

Modified rating life (ISO 281:2007 screening):

\[
L_{nm} = a_1 \cdot a_{ISO} \cdot (C/P)^p \cdot 10^6 / (60n)
\]

Static safety (ISO 76): s₀ = C₀/P₀ where P₀ is the equivalent static load.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Fr, Fa | Radial and axial loads |
| n | Operating speed (rpm) |
| L₁₀h target | Required rating life |
| Bearing type & catalog designation | C, C₀, n_lim from catalog |
| Reliability a₁ | 90–99% |
| Lubrication class | Optional a_ISO screening (poor/average/good) |
| Max bore | Shaft diameter constraint for auto-selection |

**Outputs**

- Equivalent loads P and P₀
- Basic L₁₀ and modified Lnm life
- Dynamic utilization P/C, static safety C₀/P₀, speed margin n_lim/n
- Required C and C₀ for target life
- Governing failure mode

**Design codes & checks**

- **ISO 281:2007** — Basic and modified rating life
- **ISO 76** — Static load rating screening
- Catalog limiting speed (grease)

**Assumptions & limitations**

- Constant load and speed; variable spectra need ISO 281-1 equivalent load methods
- a_ISO is simplified (κ, contamination not computed individually)
- ~40 catalog entries — not a full SKF/INA database
- No duplex/paired angular-contact or tapered-roller arrangements
- Fits, clearance, and temperature derating not modeled

**Verification**

- CI: `bearings-indicative-01.json`
- Vitest: `src/lib/machine/bearings/engine.test.ts`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md) (Machine → bearings)

**Design workflow**

- **Validate:** ISO 281/76 forward check on selected designation.
- **Auto-design:** Ranks catalog entries by life utilization, static SF, and speed margin within bore limit.
- **Handoff:** Receives Fr, Fa, speed from **shafts** module (manual apply today).

**References**

1. ISO 281:2007 — Dynamic load ratings and rating life
2. ISO 76 — Static load ratings
3. Shigley, Ch. 11; SKF Rolling Bearings Catalogue
