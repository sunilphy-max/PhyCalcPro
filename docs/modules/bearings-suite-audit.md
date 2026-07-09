# Bearings Suite — Industry Audit & Roadmap

**Scope:** Rolling element selection, plain hydrodynamic bearings, and bearing housing — now a standalone **Bearings** category in PhyCalcPro.

**Benchmarks:** SKF Bearing Select / Roller Bearing Calculation, Schaeffler Bearinx, MITCalc Bearings I–III, ISO 281:2007, ISO 76, Shigley Ch. 11.

---

## 1. Category structure (implemented)

| Sub-group | Module | Route | Role |
|-----------|--------|-------|------|
| Rolling Element | Rolling Bearing Selection | `/products/bearings/selection` | ISO 281/76 + catalog |
| Hydrodynamic | Plain Bearings | `/products/bearings/plain` | Journal / thrust / tilting pad |
| Mounting | Bearing Housing | `/products/bearings/housing` | Body stress + bolts |

Legacy routes redirect permanently from `/products/machine/bearings`, `plain-bearings`, and `housing`.

---

## 2. Industry comparison matrix

| Capability | SKF / Schaeffler tools | MITCalc | PhyCalcPro today | Gap priority |
|------------|------------------------|---------|------------------|--------------|
| ISO 281 basic life L₁₀ | Full | Yes | Yes | — |
| Modified life Lnm (κ, ηc) | Full | Partial | Screening a_ISO only | High |
| ISO 76 static P₀ | Full | Yes | Yes (family defaults + catalog e) | Medium |
| Multi-manufacturer catalog | Full DB | I/II/III tiers | ~413 rep. entries × 5 OEMs | Medium |
| Tapered / spherical / needle | Full | Limited | 10 families, rep. sizes | Medium |
| Fit & clearance (C2/CN/C3) | Full | Limited | Metadata only, not in solver | High |
| Duplex / paired angular life | Full | Partial UI | Arrangement Fa only | High |
| Variable load spectrum | ISO 281-1 | No | No | Medium |
| Temperature derating | Yes | No | No | Medium |
| Cross-reference interchange | Full | No | Same-bore OEM map only | Low |
| Plain journal / thrust | Separate products | Bearings IV | 3 types, screening | Medium |
| Housing / seal selection | Integrated | Housing module | Separate housing module | Low |
| Power-train workflow | No | Assembly calc | Shaft → bearing → housing | **Excel** |
| Document-ready report | PDF export | Print | CalculationSpec + export | **Excel** |
| Open web / no install | Cloud tools | Desktop | Browser SaaS | **Excel** |

---

## 3. Where PhyCalcPro can excel

1. **Integrated power train** — Motor → belt → shaft → **bearing** → housing → bolts in one session with handoff params (commercial tools are bearing-only silos).
2. **Application-first UX** — 27 application presets across rolling (16), plain (6), and housing (5) map to catalog profile, type, manufacturer, and safety knobs — faster than raw catalog browsing.
3. **Design mode ranking** — ISO 281 required C + static + speed margin ranked within manufacturer and application filter.
4. **Multi-OEM screening** — SKF, FAG, NSK, Timken, NTN in one calculator with equivalent designation mapping on manufacturer change.
5. **Engineering transparency** — Explicit ISO checks, governing failure mode, life vs load/speed plots, verification JSON cases.
6. **Plain + rolling in one category** — Journal vs rolling selection guidance for the same shaft design workflow.

---

## 4. Application presets (implemented)

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

Presets live in `src/lib/applications/bearingPresets.ts` and wire through `ApplicationPresetSelector` + `useRollingBearingPresetSync` / `usePlainBearingPresetSync`.

---

## 5. Catalog duty profiles (in-module wizard)

Eight cross-family profiles in `applicationMeta.ts` complement category presets:

`general_radial`, `combined_loads`, `heavy_shock`, `high_speed`, `space_limited`, `pure_thrust`, `locating_bearing`, `floating_bearing`.

---

## 6. Remaining gaps (prioritized roadmap)

### P0 — Sign-off blockers
- Full ISO 281 modified life from κ, ηc, contamination (replace a_ISO screening)
- Duplex/paired angular contact life and catalog C adjustment
- Expand CI verification with vendor benchmark cases (MITCalc ±5% parity)

### P1 — Category completeness
- Thrust **roller** family
- Larger bore tables (d > 60 mm rolling, full 302/303/322 series)
- Plain bearings in CI benchmark runner
- Fit recommendation (shaft/housing tolerance) from ISO 286

### P2 — Differentiation
- Cross-OEM interchange table at scale
- Variable load spectrum (ISO 281-1 equivalent load)
- Temperature and speed derating curves
- Grease vs oil life factor from lubricant catalog

### P3 — Optional split modules
- Dedicated routes per family (e.g. `/products/bearings/tapered`) if traffic warrants — currently unified under selection + filters.

---

## 7. Key files

```
src/data/modules.ts                          — Bearings category
src/lib/applications/bearingPresets.ts       — All application presets
src/data/catalogs/bearing/                   — Catalog + duty profiles
src/hooks/useBearingPresetSync.ts            — Preset → form sync
src/app/products/bearings/                   — New routes
docs/modules/bearings.md                     — Module reference
```

---

## 8. Verification status

| Module | Vitest | CI JSON | Engineer sign-off |
|--------|--------|---------|-------------------|
| Rolling bearings | `engine.test.ts` (10 cases) | `bearings-indicative-01.json` | Checklist pending full catalog |
| Plain bearings | Limited | 3 JSON cases | Not in benchmark runner |
| Housing | Limited | — | Workflow integration only |

**Target for sign-off:** L₁₀h, C, static SF, speed margin within ±5% of SKF Bearing Select or MITCalc on agreed benchmark set.
