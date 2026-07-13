### Bearing Selection (`bearings`)

**Purpose**

Rolling-element bearing screening per ISO 281 (basic and modified rating life) and ISO 76 static load check. Multi-manufacturer catalog (SKF, FAG, NSK, Timken, NTN) with application profiles, series/sealing filters, and representative C, C₀, geometry, and limiting speed.

**Physics & theory**

Basic rating life L₁₀ is the life in revolutions (or hours at speed n) exceeded by 90% of bearings under constant equivalent load P = C:

\[
L_{10h} = \frac{a_1 \cdot 10^6}{60 n} \left(\frac{C}{P}\right)^p, \quad p = 3 \text{ (ball)}, \; 10/3 \text{ (roller)}
\]

Modified rating life (ISO 281:2007):

\[
L_{nm} = a_1 \cdot a_{ISO} \cdot (C/P)^p \cdot 10^6 / (60n)
\]

where **aISO** is computed from viscosity ratio κ = ν/ν₁, contamination factor eC, and fatigue load limit Pu (catalog datasheet Pu when available; otherwise estimated as 0.025C for ball, 0.03C for roller).

**Life model ceiling (screening, opt-in):**

| Method | Behavior |
|--------|----------|
| ISO 281 (default) | Lnm = a₁ · aISO · (C/P)^p; optional misalignment life derate a_mis |
| ISO 16281 screen | Adjusts P → P_adj = P · f_clearance · f_misalign · f_distrib (not full ISO 16281:2025 FEA) |
| Stress-life screen | Lnm uses a₁ · aISO · a_stress · … — transparent PhyCalcPro curve; **not SKF GBLM / AFC** |
| Hybrid / full ceramic | ISO 20056-inspired C / speed / life factors on rolling elements |

Shaft FEM handoff can publish bearing slopes (rad) → misalignment (mrad) for the ceiling path.

Static safety (ISO 76): s₀ = C₀/P₀ where P₀ is the equivalent static load.

**Paired arrangements (O / X / T):** loads are split per bearing; system life is governed by the minimum station modified life.

**Variable load (ISO 281-1):** optional two-step spectrum computes equivalent load and Palmgren-Miner combined life.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Fr, Fa | Radial and axial loads |
| n | Operating speed (rpm) |
| L₁₀h target | Required rating life |
| Application profile | General radial, combined loads, heavy shock, high speed, space limited, thrust, locating/floating |
| Manufacturer | SKF, FAG, NSK, Timken, NTN |
| Bearing family / type | Deep groove, angular contact, NU/NJ/NUP cylindrical, tapered, spherical, needle, self-aligning, thrust |
| Series & sealing | Catalog series (62xx, 302xx, …) and open/shielded/sealed |
| Catalog designation | C, C₀, n_lim from catalog |
| Reliability a₁ | 90–99% |
| Lubricant | Oil or grease (ISO VG) + operating temperature |
| Contamination eC | ISO 281 cleanliness classes |
| Life method | ISO 281 / ISO 16281 screen / stress-life screen |
| Misalignment | Manual mrad and/or shaft FEM slopes |
| Rolling elements | Steel / hybrid ceramic / full ceramic |
| Internal clearance | C2 / CN / C3 / C4 (fit recommendation) |
| Mounting arrangement | Single, back-to-back (O), face-to-face (X), tandem (T) |
| Variable load spectrum | Optional ISO 281-1 duty cycle |
| Max bore | Shaft diameter constraint for auto-selection |

**Outputs**

- Equivalent loads P and P₀ (paired per-station when applicable)
- Basic L₁₀ and modified Lnm life with κ, eC, aISO breakdown
- Defect frequencies BPFO / BPFI / BSF / FTF (screening geometry)
- Grease life L₁₀h and/or relubrication interval tf
- Adjusted reference speed n_θ and friction energy / CO₂ screening
- Side-by-side OEM compare under the same duty
- Mounted kit BOM (housing SNL/UCP/FY/SAF-class + seal + grease)
- Dynamic utilization P/C, static safety C₀/P₀, speed margin n_lim/n
- Minimum load (skidding), friction torque, power loss
- Recommended shaft/housing fits and operating clearance
- Required C and C₀ for target life
- Governing failure mode

**Design codes & checks**

- **ISO 281:2007** — Basic and modified rating life
- **ISO 76** — Static load rating screening
- Catalog limiting speed (grease) and reference speed (oil) where listed
- Defect frequencies — kinematic screening (verify Z, Bd against OEM for CM)

**Assumptions & limitations**

- Constant load and speed unless variable spectrum is enabled
- Pu from catalog when present; otherwise estimated from C
- Representative catalog — not full vendor databases
- ISO 16281 and stress-life paths are **screening** only — not vendor GBLM, AFC, Bearinx, or full ISO 16281:2025
- Housing SKUs are screening-class (SNL/UCP/…) — not full OEM mounted-product databases
- CO₂ from friction power only — not a product LCA
- Duplex paired C catalog multipliers use tandem axial convention (screening)
- Temperature derating on C above 120 °C (screening factor)

**Verification**

- CI: `bearings-indicative-*.json` (multiple rolling cases)
- Vitest: `engine.test.ts`, `lifeModelCeiling.test.ts`, `auxMounted.test.ts`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md) (Machine → bearings) — **pending ±5% vendor benchmark**

**Design workflow**

- **Validate:** ISO 281/76 forward check on selected designation.
- **Auto-design:** Ranks catalog entries by manufacturer, application profile, life utilization, static SF, and speed margin within bore limit.
- **Handoff:** Receives Fr, Fa, speed from **shafts** module (manual apply today).

**References**

1. ISO 281:2007 — Dynamic load ratings and rating life
2. ISO 76 — Static load ratings
3. Shigley, Ch. 11; SKF Rolling Bearings Catalogue
