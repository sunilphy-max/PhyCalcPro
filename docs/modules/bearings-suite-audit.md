# Bearings Suite — Industry Audit & Roadmap

**Last updated:** post ISO 281 physics upgrade (κ, eC, Pu, paired loads, variable spectrum, fits).

**Scope:** Rolling element selection, plain hydrodynamic bearings, and bearing housing — standalone **Bearings** category in PhyCalcPro.

**Benchmarks:** SKF Product Select, Schaeffler Bearinx, MITCalc Bearings I–IV, ISO 281:2007, ISO 76, ISO 7902, Shigley Ch. 11.

---

## 1. Positioning summary

| Tier | Description | PhyCalcPro status |
|------|-------------|-------------------|
| **A — Vendor sign-off** | SKF Product Select, Bearinx VIP, SKF GBLM | Not targeted yet |
| **B — Professional screening** | MITCalc I–III, Bearinx-online shaft | **Rolling bearings: here** |
| **C — First-order feasibility** | Spreadsheets, hand calcs | Plain / housing partly here |

PhyCalcPro is a **browser-native, multi-OEM ISO 281 screening calculator inside an integrated power-train platform** — competitive with MITCalc for day-to-day rolling-bearing sizing, but not a replacement for SKF Product Select on release drawings or Bearinx for elastic shaft / Hertzian analysis.

**Deliberately out of scope:** full vendor catalog parity (5k–10k SKUs), FEA / elastic system simulation, grease-life / relubrication maintenance workflows.

---

## 2. Category structure

| Sub-group | Module | Route | Role |
|-----------|--------|-------|------|
| Rolling Element | Rolling Bearing Selection | `/products/bearings/selection` | ISO 281/76 + catalog + paired / variable duty |
| Hydrodynamic | Plain Bearings | `/products/bearings/plain` | ISO 7902 journal + ISO 12130/12131 thrust (screening) |
| Mounting | Bearing Housing | `/products/bearings/housing` | Body stress + bolts + fit recommendation |

Legacy routes redirect permanently from `/products/machine/bearings`, `plain-bearings`, and `housing`.

---

## 3. Physics implemented (rolling)

| Capability | Standard / reference | Implementation |
|------------|---------------------|----------------|
| Basic rating life L₁₀ | ISO 281 | `equivalentLoad.ts`, `solver.ts` |
| Modified life Lnm | ISO 281:2007 | `iso281Life.ts` — κ, ν₁, eC, Pu/P → aISO |
| Lubricant viscosity | ISO VG + ASTM D341 screening | `lubrication.ts` — ν at operating temperature; grease effective ν |
| Static equivalent load P₀ | ISO 76 | `staticLoad.ts` — family-specific tables |
| Paired O / X / T | MITCalc / SKF arrangement practice | `pairedLoads.ts` — load split, min station life, tandem axial rating |
| Variable load | ISO 281-1 | `variableLoad.ts` — equivalent P + Palmgren-Miner combined life |
| Fits & clearance | ISO 286 / SKF tables (screening) | `fitsClearance.ts` — shaft/housing recommendation, operating clearance |
| Minimum load (skidding) | SKF indicative | `auxiliaryChecks.ts` |
| Friction / power loss | SKF screening (M = ½μP·dm) | `auxiliaryChecks.ts` |
| Temperature derating on C | Screening above 120 °C | `iso281Life.ts` |
| Auto-design ranking | ISO 281 required C, C₀, n_lim | `catalogSelection.ts`, `machineDesign.ts` |

**Pu (fatigue load limit):** estimated as **0.025 × C** (ball) or **0.03 × C** (roller) when not stored per catalog entry — sufficient for screening; vendor tools use datasheet Pu.

---

## 4. Physics implemented (plain & housing)

### Plain bearings (`plain-bearings`)

| Capability | Standard | Status |
|------------|----------|--------|
| Journal Sommerfeld number | ISO 7902 | Implemented |
| Eccentricity ε | Raimondi–Boyd interpolation | `iso7902.ts` (replaces ε ≈ 1/(1+S)) |
| Specific load | ISO 7902 screening | Implemented |
| Temperature rise / outlet T | Single-pass screening | Implemented |
| Shaft/housing fits | ISO 3547 screening | `recommendPlainJournalFits` |
| Thrust pad | ISO 12131 screening | Implemented |
| Tilting pad | ISO 12130 screening | Implemented |
| Sliding material DB, oil DB, flow rate, iterative ΔT | MITCalc IV | **Not implemented** |

### Housing (`housing`)

| Capability | Status |
|------------|--------|
| Cantilever body bending + bolt von Mises | Implemented |
| ISO 286 fit recommendation (from bearing logic) | Implemented |
| Operating clearance estimate | Implemented |
| Housing SKU catalog (SNL, UCP, …), seal selection | **Not implemented** |

---

## 5. Industry comparison — rolling bearings

| Capability | SKF Product Select | Schaeffler Bearinx | MITCalc I–III | PhyCalcPro |
|------------|-------------------|-------------------|---------------|------------|
| ISO 281 basic L₁₀ + P, P₀ | Yes | Yes | Yes | **Yes** |
| Modified life (κ, eC, Pu → aISO) | **aSKF** (vendor) | Full | Partial | **Yes** (ISO 281 eq.; Pu estimated) |
| Paired tapered / angular (O/X/T) | Full system | Elastic system | Yes | **Yes** (load split + min station life) |
| Variable load spectrum | Multi load cases | Yes | Mean-load helper | **Yes** (2-step ISO 281-1) |
| Fit / clearance C2–C4 | Full | Operating clearance wizard | Limited | **Yes** (screening recommendation) |
| Temperature | Full (rings, ν, fit) | Full | No | **Partial** (ν at T, C derating > 120 °C) |
| Grease life / relubrication | **Yes** | Yes | No | No |
| Friction / power loss | Detailed | Hertzian-level | Limited | **Screening** |
| Minimum load (skidding) | Yes | Yes | Limited | **Yes** |
| Defect frequencies | Yes | Yes | No | No |
| Catalog size | 10k+ SKF | Full Schaeffler | 5k–10k per module | **~413 rep. × 5 OEMs** (by design) |
| Multi-OEM in one UI | No | No | Separate modules | **Yes** |
| Shaft deflection → bearing loads | Simple arrangements | **FEA + elastic** | No | Manual handoff from shafts |
| Power-train workflow | No | No | Desktop assembly | **Shaft → bearing → housing → bolts** |
| Web / no install | Yes | Partial | Desktop | **Yes** |
| Engineer sign-off benchmarks | Vendor gold standard | Vendor gold standard | Reference | **18 Vitest; no ±5% vendor suite** |

---

## 6. Industry comparison — plain & housing

| Capability | MITCalc IV | SKF | PhyCalcPro |
|------------|------------|-----|------------|
| ISO 7902 journal (full) | Yes | Yes | Screening (Raimondi–Boyd) |
| Thrust / tilting pad | Yes | Yes | Screening |
| Material + oil databases | Yes | Yes | No |
| Temperature iteration | Iterative | Yes | Single-pass |
| Housing SKU + seals | Generic | **Mounted solutions** | Structural screening only |
| Fit recommendation | Yes | Yes | **Yes** (rolling + plain + housing) |

---

## 7. Where PhyCalcPro excels vs state of the art

1. **Integrated power train** — Motor → belt → shaft → **bearing** → housing → bolts in one browser session (vendor tools are bearing-only silos).
2. **Multi-OEM screening** — SKF, FAG, NSK, Timken, NTN in one calculator with equivalent designation mapping.
3. **Application-first UX** — 27 application presets (rolling 16, plain 6, housing 5) + 8 in-module catalog duty profiles.
4. **Engineering transparency** — κ, eC, aISO, Pu/P, paired station lives, governing check, life/static/P-C plots, CalculationSpec export.
5. **ISO 281 physics parity with MITCalc (rolling)** — Same standard methods for screening; no desktop install.
6. **Plain + rolling + housing in one category** — Journal vs rolling decision in the same design workflow.

---

## 8. Application presets (implemented)

### Rolling element (`bearings`) — 16 presets

| Preset ID | Use case | Default type | Catalog profile |
|-----------|----------|--------------|-----------------|
| `iso281_general` | Baseline screening | Deep groove | All |
| `deep_groove_motor_fan` | Motors, fans, pumps | Deep groove | General radial |
| `deep_groove_sealed` | Contaminated duty | Deep groove (sealed) | General radial |
| `angular_spindle` | Machine tool spindle | Angular contact | High speed |
| `angular_locating` | Fixed shaft end | Angular contact | Locating |
| `tapered_gearbox` | Gearbox shafts | Tapered roller | Combined loads |
| `tapered_wheel_end` | Heavy axle / shock | Tapered roller | Heavy shock |
| `spherical_mining` | Crushers, mining | Spherical roller | Heavy shock |
| `spherical_paper` | Process rolls | Spherical roller | Heavy shock |
| `needle_compact` | Compact actuators | Needle roller | Space limited |
| `cylindrical_nu_float` | Thermal float end | NU cylindrical | Floating |
| `cylindrical_nj_locate` | One-direction locate | NJ cylindrical | Locating |
| `cylindrical_nup_shaft` | Two-direction locate | NUP cylindrical | Combined |
| `self_aligning_conveyor` | Misaligned conveyor | Self-aligning ball | Heavy shock |
| `thrust_vertical` | Vertical shafts | Thrust ball | Pure thrust |
| `high_speed_precision` | Turbo / precision | Angular contact | High speed |

### Plain hydrodynamic (`plain-bearings`) — 6 presets

| Preset ID | Use case | Default type |
|-----------|----------|--------------|
| `journal_general` | Industrial journal | Journal |
| `journal_turbine` | Turbine / generator | Journal |
| `journal_slow_heavy` | Mills, crushers | Journal |
| `thrust_pad_vertical` | Vertical thrust | Thrust pad |
| `tilting_pad_turbo` | Compressors | Tilting pad |
| `hydrodynamic_precision` | Test rigs | Journal |

### Housing (`housing`) — 5 presets

| Preset ID | Use case |
|-----------|----------|
| `foot_mount_general` | Pillow block |
| `flange_compact` | Flange unit |
| `housing_heavy_shock` | Split plummer / mining |
| `housing_spindle` | Precision spindle |
| `housing_split_maintenance` | Process maintenance |

Presets: `src/lib/applications/bearingPresets.ts` · UI sync: `useRollingBearingPresetSync`, `usePlainBearingPresetSync`.

---

## 9. Catalog duty profiles (in-module wizard)

Eight cross-family profiles in `applicationMeta.ts`:

`general_radial`, `combined_loads`, `heavy_shock`, `high_speed`, `space_limited`, `pure_thrust`, `locating_bearing`, `floating_bearing`.

**Catalog scale (unchanged by design):** ~85 series templates → ~413 entries across SKF, FAG, NSK, Timken, NTN. Representative sizes for screening — not full MITCalc/SKF databases.

---

## 10. Remaining gaps (prioritized roadmap)

### P0 — Sign-off & accuracy

- [ ] **Vendor benchmark suite** — 15–25 cases, ±5% vs SKF Product Select / MITCalc on L₁₀h, P/C, s₀, n_lim/n
- [ ] **Per-designation Pu** in catalog (or import from datasheets) — reduces aISO divergence at high P/C
- [ ] **Engineer sign-off** on [validation-master-checklist.md](../validation-master-checklist.md)

### P1 — Workflow & maintenance (no catalog expansion required)

- [ ] Grease life / relubrication interval (SKF method screening)
- [ ] Two-bearing shaft wizard (locating + floating auto-design as a system)
- [ ] Design mode passes lubricant, arrangement, contamination into ranking (partially wired)
- [ ] Plain bearings in CI benchmark runner (`moduleSolverRegistry`)
- [ ] Plain bearing temperature **iteration** (friction ↔ heat ↔ ν)

### P2 — Optional product depth

- [ ] Cross-OEM interchange table at scale (beyond same-bore heuristic)
- [ ] Housing / seal SKU catalog (SNL, UCP, …)
- [ ] Defect frequencies, adjusted reference speed
- [x] Misalignment angle input for self-aligning / spherical Y factors (screening derate + ISO 16281 P path)

### P3 — Out of scope unless requested

- Catalog expansion to MITCalc/SKF scale (5k–10k SKUs)
- Bearinx-style iterative elastic shaft / Hertzian per-roller analysis
- Vendor SKF GBLM / AFC table matching (PhyCalcPro offers transparent stress-life **screening** only)
- Dedicated per-family routes (e.g. `/products/bearings/tapered`)

### Completed (formerly P0/P1)

- [x] Full ISO 281 modified life from κ, eC, Pu (`iso281Life.ts`)
- [x] Life model ceiling screening: ISO 16281-inspired P, stress-life (not GBLM), hybrid ceramic, shaft slope handoff
- [x] Defect frequencies BPFO/BPFI/BSF/FTF (screening geometry)
- [x] Grease life L₁₀h vs relubrication interval tf
- [x] Adjusted reference speed n_θ screening
- [x] Friction energy + CO₂ screening
- [x] Side-by-side bearing compare under same duty
- [x] Housing SNL/UCP/FY/SAF-class screening catalog + mounted BOM
- [x] Expanded rolling verification JSON cases (indicative regression)
- [x] Duplex/paired angular & tapered life (`pairedLoads.ts`)
- [x] Variable load spectrum ISO 281-1 (`variableLoad.ts`)
- [x] Fit recommendation + clearance C2/CN/C3/C4 (`fitsClearance.ts`)
- [x] Temperature derating on C, ν at temperature (`lubrication.ts`)
- [x] Minimum load, friction torque, power loss (`auxiliaryChecks.ts`)
- [x] Plain journal Raimondi–Boyd + ISO 7902 screening (`iso7902.ts`)
- [x] Housing fit recommendation
- [x] Thrust roller + toroidal + inch catalog expansion (datasheet Pu)

---

## 11. Key files

```
src/data/modules.ts                          — Bearings category
src/lib/applications/bearingPresets.ts       — Application presets (27)
src/data/catalogs/bearing/                   — Catalog + duty profiles (~413 entries)
src/lib/machine/bearings/
  equivalentLoad.ts                          — ISO 281 P, life exponent
  iso281Life.ts                              — κ, ν₁, eC, Pu, aISO
  lubrication.ts                             — ISO VG @ temperature
  pairedLoads.ts                             — O / X / T system life
  variableLoad.ts                            — ISO 281-1 spectrum
  fitsClearance.ts                           — ISO 286 fit screening
  auxiliaryChecks.ts                         — Min load, friction
  solver.ts / engine.ts / staticLoad.ts      — Forward solver + catalog merge
  catalogSelection.ts                        — Auto-design ranking
src/lib/machine/plain-bearings/
  iso7902.ts / engine.ts                     — Journal + thrust screening
src/lib/machine/housing/engine.ts            — Body + bolts + fits
src/hooks/useBearingPresetSync.ts
src/app/products/bearings/                   — selection, plain, housing routes
src/components/machine/bearings/             — Inputs, results, reference visuals
docs/modules/bearings.md                     — Module reference (user-facing)
```

---

## 12. Verification status

| Module | Vitest | CI JSON | Engineer sign-off |
|--------|--------|---------|-------------------|
| Rolling bearings | `engine.test.ts` (10) + `iso281Life.test.ts` (8) = **18** | `bearings-indicative-01.json` (1 case) | Pending vendor benchmark suite |
| Plain bearings | Limited | 3 JSON cases | Not in benchmark runner |
| Housing | `engine.test.ts` (1) | `housing-indicative-01.json` | Workflow integration only |

**Target for tier-A sign-off:** L₁₀h, C, static SF, speed margin, aISO within ±5% of SKF Product Select or MITCalc on an agreed benchmark set (15–25 cases).

**Current tier:** **B (professional screening)** for rolling; **C** for plain and housing.

---

## 13. Tool selection guide

| Your task | Recommended tool |
|-----------|------------------|
| Quick multi-OEM bearing size in a motor/gearbox line | **PhyCalcPro** |
| Final SKF bearing on production drawing | **SKF Product Select** |
| Elastic shaft + contact pressure per roller | **Bearinx VIP** |
| Desktop MITCalc workflow + CAD export | **MITCalc** |
| Critical turbomachinery journal (sign-off) | **MITCalc IV** or specialist analysis |
| Teaching / showing ISO 281 breakdown | **PhyCalcPro** |
