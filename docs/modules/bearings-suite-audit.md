# Bearings Suite — Industry Audit & Roadmap

**Last updated:** life model ceiling screening (ISO 16281 / stress-life / hybrid ceramic + shaft slope handoff) + bearing suite UX parity.

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

**Deliberately out of scope:** full vendor catalog parity (5k–10k SKUs), FEA / elastic system simulation, vendor GBLM / AFC table matching.

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
| Arrangement analysis | MITCalc / SKF duplex practice | `arrangementAnalysis.ts` — preload, Ka/Kr/Km, δa, thermal, O/X/T compare |
| Duplex stiffness / preload | Screening | `duplexStiffness.ts` |
| Variable load | ISO 281-1 | `variableLoad.ts` — equivalent P + Palmgren-Miner combined life |
| Fits & clearance | ISO 286 / SKF tables (screening) | `fitsClearance.ts` — shaft/housing recommendation, operating clearance |
| Minimum load (skidding) | SKF indicative | `auxiliaryChecks.ts` |
| Friction / power loss | SKF screening (M = ½μP·dm) | `auxiliaryChecks.ts` |
| Temperature derating on C | Screening above 120 °C | `iso281Life.ts` |
| Auto-design ranking | ISO 281 required C, C₀, n_lim | `catalogSelection.ts`, `machineDesign.ts` |
| Life model ceiling (opt-in) | ISO 281 / ISO 16281 screen / stress-life | `advancedLife.ts`, `iso16281Screen.ts`, `stressLifeScreen.ts` |
| Misalignment → Y / derate | Screening family capacities | `misalignmentFactors.ts` (manual mrad + shaft slopes) |
| Hybrid / full ceramic | ISO 20056-inspired | `hybridCeramic.ts` |
| Shaft slope handoff | FEM → bearings | `station0Slope` / `station1Slope` / `maxBearingSlope` (rad) |

**Pu (fatigue load limit):** estimated as **0.025 × C** (ball) or **0.03 × C** (roller) when not stored per catalog entry — sufficient for screening; vendor tools use datasheet Pu.

**Life ceiling disclaimer:** default path remains ISO 281 + aISO/aSKF. ISO 16281 and stress-life paths are **screening only** — not full ISO 16281:2025 FEA, and **not** SKF GBLM / AFC.

---

## 4. Physics implemented (plain & housing)

### Plain bearings (`plain-bearings`)

| Capability | Standard | Status |
|------------|----------|--------|
| Journal Sommerfeld number | ISO 7902 | Implemented |
| Eccentricity ε | Raimondi–Boyd interpolation | `iso7902.ts` (replaces ε ≈ 1/(1+S)) |
| Specific load | ISO 7902 screening | Implemented |
| Temperature rise / outlet T | Light iterative ΔT ↔ ν (2–3 passes) | Implemented (Walther-scale; short-bearing limits remain) |
| Shaft/housing fits | ISO 3547 screening | `recommendPlainJournalFits` |
| Thrust pad | ISO 12131 screening | Implemented |
| Tilting pad | ISO 12130 screening | Implemented |
| Design Summary + advisor + sectioned export | Suite UX parity | Implemented |
| Sliding material DB, oil DB, flow rate (MITCalc IV) | MITCalc IV | **Not implemented** |

### Housing (`housing`)

| Capability | Status |
|------------|--------|
| Cantilever body bending + bolt von Mises | Implemented |
| ISO 286 fit recommendation (from bearing logic) | Implemented |
| Operating clearance estimate | Implemented |
| Housing SKU catalog (SNL, UCP, FY, SAF-class) + seal + mounted BOM | Implemented (screening catalog) |
| Design Summary + SKU advisor + sectioned export | Implemented |
| Full FEA / OEM mounted-product databases | **Not implemented** |

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
| Grease life / relubrication | **Yes** | Yes | No | **Yes** (screening L₁₀h / tf) |
| Friction / power loss | Detailed | Hertzian-level | Limited | **Screening** |
| Minimum load (skidding) | Yes | Yes | Limited | **Yes** |
| Defect frequencies | Yes | Yes | No | **Yes** (kinematic screening) |
| Catalog size | 10k+ SKF | Full Schaeffler | 5k–10k per module | **~413 rep. × 5 OEMs** (by design) |
| Multi-OEM in one UI | No | No | Separate modules | **Yes** |
| Design Summary + advisor + sectioned PDF/xlsx | Vendor packs | Vendor packs | Report export | **Yes** |
| Shaft deflection → bearing loads | Simple arrangements | **FEA + elastic** | No | Manual handoff from shafts |
| Power-train workflow | No | No | Desktop assembly | **Shaft → bearing → housing → bolts** |
| Web / no install | Yes | Partial | Desktop | **Yes** |
| Engineer sign-off benchmarks | Vendor gold standard | Vendor gold standard | Reference | **Vitest + 7 CI JSON; no ±5% vendor suite** |

---

## 6. Industry comparison — plain & housing

| Capability | MITCalc IV | SKF | PhyCalcPro |
|------------|------------|-----|------------|
| ISO 7902 journal (full) | Yes | Yes | Screening (Raimondi–Boyd + light ΔT iteration) |
| Thrust / tilting pad | Yes | Yes | Screening |
| Material + oil databases | Yes | Yes | No |
| Temperature iteration | Iterative | Yes | Light 2–3 pass ΔT ↔ ν |
| Housing SKU + seals | Generic | **Mounted solutions** | Screening SNL/UCP/FY/SAF + BOM |
| Fit recommendation | Yes | Yes | **Yes** (rolling + plain + housing) |
| Design Summary / advisor / sectioned export | Report | Report | **Yes** (suite parity) |

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

- [x] **Hybrid gold harness** — `npm run test:bearings-gold` + Vitest; screening_reference seeds active; vendor SKF/MITCalc cases `pending_vendor_gold` until pasted ([README](../../src/data/verification/bearings-gold/README.md))
- [x] **Pu provenance** — `puSource` / `fatigueLoadLimitFromDatasheet` honest (datasheet vs C₀-ratio); custom C/C₀/Pu override UI
- [ ] **Engineer sign-off** on [validation-master-checklist.md](../validation-master-checklist.md) after vendor gold is filled (±5%)

### P1 — Workflow & maintenance (no catalog expansion required)

- [x] Two-bearing shaft wizard (locating + floating auto-design as a system)
- [x] Shaft handoff locate↔float swap + Fa-not-from-FEM warning
- [x] Design mode passes lubricant, arrangement, contamination into ranking
- [x] Plain bearings in CI benchmark runner (`moduleSolverRegistry`)
- [x] Plain bearing temperature **iteration** (friction ↔ heat ↔ ν, light Walther-scale)

### P2 — Optional product depth

- [x] Cross-OEM interchange candidates (same bore/type/C-class) with Apply
- [x] N-step variable spectrum UI (up to 12) + optional per-step speed
- [x] Ring ΔT operating clearance + SKF-inspired Mrr/Msl friction screening
- [x] Plain oil + bushing material catalogs; multi-L/D Raimondi–Boyd
- [x] Housing body/bolt utilization metrics
- [x] Housing / seal SKU catalog (SNL, UCP, …) + mounted BOM
- [x] Defect frequencies, adjusted reference speed
- [x] Design Summary + Explain advisor + sectioned PDF/Excel across selection / plain / housing
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
- [x] Expanded rolling verification JSON cases (indicative regression — 12 family/duty cases; not ±5% vendor sign-off)
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
src/lib/machine/housing/mountedBom.ts        — SNL/UCP/FY/SAF screening BOM
src/lib/machine/bearings-shared/             — Design Summary, Explain card, view tabs, report preview
src/lib/export/reportSections.ts             — Named PDF/Excel section builders
src/hooks/useBearingPresetSync.ts
src/app/products/bearings/                   — selection, plain, housing routes
src/components/machine/bearings/             — Inputs, results, reference visuals
src/components/machine/plain-bearings/
src/components/machine/housing/
docs/modules/bearings.md                     — Module reference (user-facing)
docs/modules/plain-bearings.md
docs/modules/housing.md
```

---

## 12. Verification status

| Module | Vitest | CI JSON | Engineer sign-off |
|--------|--------|---------|-------------------|
| Rolling bearings | `engine.test.ts`, `iso281Life.test.ts`, `systemDepth.test.ts`, arrangement/aux suites | **7** `bearings-indicative-*.json` | Pending vendor benchmark suite |
| Plain bearings | Engine screening | **3** `plain-bearings-indicative-*.json` (in registry) | Screening only |
| Housing | `engine.test.ts` | `housing-indicative-01.json` | Workflow integration + screening BOM |

**Target for tier-A sign-off:** L₁₀h, C, static SF, speed margin, aISO within ±5% of SKF Product Select or MITCalc on an agreed benchmark set (15–25 cases).

**Current tier:** **B (professional screening)** for rolling; plain / housing elevated to suite UX parity with screening physics (**C→B−** for workflow completeness, still not FEA / oil-DB sign-off).

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
