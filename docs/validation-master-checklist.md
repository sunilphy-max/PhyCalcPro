# PhyCalcPro — Master validation checklist

Use this document to validate **physics, standards mapping, and design outputs** across all **62 calculator modules**. Automated CI covers modules with verification JSON; everything else needs your engineer sign-off.

## Before you start

1. Run automated regression:
   ```bash
   npm run test:verification
   ```
   **24 modules** currently have committed benchmark cases (see [Verification status](#verification-status) below).

2. For each module you rely on in production, complete the **Physics** and **Standards** columns in the tables below.

3. Add your own worksheet cases to `src/data/verification/{moduleId}-indicative-*.json` and re-run CI (see `src/data/verification/README.md`).

4. Module theory docs: `docs/modules/{moduleId}.md`  
   Spring-specific checklist: `docs/modules/spring-modules-user-tasks.md`

---

## Validation workflow (per module)

| Step | Action |
|------|--------|
| A | Run module in **Check** mode with a known textbook / code example |
| B | Compare key outputs (SF, stress, deflection, life, rate) to reference within stated tolerance |
| C | Toggle **Design** mode (if available) and confirm auto-size returns sensible geometry |
| D | Confirm **Calculation spec** panel lists expected standard checks |
| E | Export CSV/PDF and archive inputs + assumption log with the project |
| F | Add or update verification JSON if the case should stay in CI |

---

## Verification status

| Symbol | Meaning |
|--------|---------|
| **CI** | Has passing case in `src/data/verification/` |
| **Solver** | Engine registered in `moduleSolverRegistry.ts` — add JSON anytime |
| **Browse** | Catalog / reference UI — manual validation only |

---

## Structural (8 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **beams** | CI | Cross-check max moment/deflection vs closed-form (simply supported / cantilever). Verify AISC/EC3 checks if using code mode. LTB not fully embedded. |
| **frames** | Solver | Compare 2–3 bay frame reactions to hand frame analysis or SAP2000. |
| **trusses** | Solver | Pratt/Warren example — member forces vs method of joints. |
| **columns** | CI | Euler + code curve SF vs AISC/EC3 worksheet. Inelastic buckling partial. |
| **plates** | Solver | Rectangular plate deflection vs Roark for simply supported case. |
| **combined-loading** | CI | Von Mises / Tresca vs textbook combined stress example. |
| **load-case-manager** | Solver | Envelope max/min matches manual load combination. |
| **circular-plates** | CI | Uniform pressure — deflection/moment vs Roark Table. |

---

## Power transmission (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **v-belts** | CI | Cross-check belt speed, wrap, power vs Gates manual example. |
| **timing-belts** | CI | Tooth count / center distance vs manufacturer datasheet. |
| **roller-chains** | Solver | Add CI case — chain tension vs ANSI B29.1 power table. |
| **multi-pulley** | Solver | Belt length / wrap angles vs CAD layout. |

---

## Machine (11 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **shafts** | CI | DIN 743 / Shigley shaft example — bending, torsion, Kt, critical speed. |
| **gears** | CI | ISO 6336 / AGMA bending + contact vs MITCalc or vendor software. |
| **bearings** | CI | ISO 281 L10, ISO 76 static, speed margin vs SKF catalog example. |
| **cams** | Solver | Displacement/velocity/acceleration vs polynomial cam design text. |
| **flywheels** | Solver | Energy storage vs ½Iω² hand calc. |
| **bevel-gears** | CI | Gleason/Klingelnberg screening — verify cone distance and forces. |
| **worm-gears** | Solver | Efficiency and thermal load vs vendor rating. |
| **planetary-gears** | Solver | Willis equation + planet load sharing assumption. |
| **gear-ratio-design** | Solver | Stage ratios and center distances vs layout drawing. |
| **plain-bearings** | Solver | Sommerfeld / Raimondi–Boyd chart comparison. |
| **brakes-clutches** | Solver | Torque capacity vs friction coefficient × normal force. |

---

## Springs (3 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **compression-springs** | CI (×2) | EN 13906-1 static + fatigue vs nomograph. See `spring-modules-user-tasks.md`. |
| **extension-springs** | CI | Hook stress + Fi vs MITCalc extension spring. |
| **torsion-springs** | CI | Rate `k=Ed⁴/(64Dn)` vs Shigley Ex. 10-4; re-baseline old projects. |

---

## Fasteners (7 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **bolts** | Solver | VDI 2230 / AISC joint example — preload, slip, fatigue. |
| **welds** | Solver | AISC/AWS fillet throat stress vs manual calc. Add CI JSON. |
| **rivets** | CI | Single-shear / bearing vs MIL-HDBK or Shigley. |
| **safety-factor** | Solver | Combined SF definitions match your company standard. |
| **keys-splines** | CI | Key shear/bearing vs ISO 3912 / Shigley. |
| **shaft-hubs** | Solver | Interference / clearance fit pressure vs DIN 7190. |
| **pins** | Solver | Double shear pin vs Shigley Table. |

---

## Materials (8 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **material-db** | Browse | Spot-check E, ν, Sy against MMPDS / matweb for alloys you use. |
| **sections** | Solver | Area properties vs CAD section properties. |
| **rolled-sections** | Solver | W/HSS designation lookup vs AISC Steel Construction Manual. |
| **profiles** | Solver | Custom polygon I/A/c vs hand composite sections. |
| **composites** | Solver | CLT stiffness vs Jones textbook lamina example. |
| **temperature-properties** | Solver | Interpolated strength derating vs code table. |
| **fatigue** | CI | Goodman/Gerber + Marin vs Shigley Ex. 6-1. |
| **corrosion** | CI | Corrosion allowance vs API 510 / company spec. |

---

## Pressure (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **pipes** | CI | Barlow hoop stress vs ASME B31.3 example. |
| **vessels** | Solver | Thin/thick cylinder vs ASME VIII Div.1 UG-27. Add CI JSON. |
| **hydraulics** | CI | Cylinder force vs manufacturer catalog. |
| **heat-exchangers** | Solver | LMTD / NTU vs Bell–Delaware screening example. |

---

## Dynamics (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **vibrations** | Solver | Natural frequency vs analytical beam ω₁. |
| **rotation** | CI | Centripetal force / KE vs textbook. |
| **impact** | CI | Impulse–momentum average force vs energy method. |
| **suspension** | CI | Roll angle / load transfer vs vehicle dynamics text. |

---

## Manufacturing (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **tolerance** | Solver | Stack-up RSS vs worst-case drawing review. |
| **fits** | Solver | ISO 286 hole/shaft fit vs tolerance table. |
| **cost-estimator** | Solver | Order-of-magnitude only — calibrate to your shop rates. |
| **cam-toolpaths** | Solver | Toolpath length/time vs CAM post output. |

---

## Advanced systems (8 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **vacuum-engineering** | Solver | Pump-down time vs vendor curve; add CI JSON with your chamber. |
| **cryogenic-engineering** | Solver | Heat leak / boil-off vs cryo supplier data. |
| **magnetic-fields** | Solver | B-field vs Biot–Savart / FEM for simple coil. |
| **superconducting-systems** | Solver | Critical current margin vs material Ic(B,T). |
| **thermal-management** | Solver | Junction temperature vs 1D thermal resistance network. |
| **battery-ev-systems** | Solver | Pack energy / C-rate vs cell datasheet. |
| **hydrogen-systems** | Solver | Storage pressure / flow vs safety case. |
| **precision-motion** | Solver | Stage error budget vs encoder resolution + backlash. |

---

## Tools (2 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **formula-reference** | Solver | Spot-check 5 formulas against Roark / Shigley. |
| **unit-converter** | CI | NIST conversion factors for critical unit pairs. |

---

## Priority order (recommended)

Work top-down by product risk and maturity:

1. **Production-critical machine design:** shafts → bearings → gears → springs → fasteners  
2. **Structural sign-off:** beams → columns → combined-loading  
3. **Power train:** v-belts → timing-belts → roller-chains  
4. **Pressure systems:** pipes → vessels → hydraulics  
5. **Remaining modules** as your product roadmap requires  

---

## Adding CI coverage for a module

```bash
# 1. Add seed to src/lib/qa/verificationSeeds.ts (or write JSON by hand)
# 2. Generate file:
npx tsx scripts/bootstrap-verification.ts
# 3. Replace source field with your worksheet reference
npm run test:verification
# 4. Commit JSON + last-run.json
```

---

## Infrastructure reference

| File | Purpose |
|------|---------|
| `src/lib/qa/moduleSolverRegistry.ts` | All automated solvers (61 modules) |
| `src/lib/qa/benchmarkRunner.ts` | CI runner |
| `src/lib/standards/evaluators/generic.ts` | Result field → standard check mapping |
| `src/lib/standards/moduleCatalog.ts` | Per-module check definitions |
| `docs/modules/*.md` | Theory and equations per module |

---

*Last updated: 2026-07 — 24 CI modules, 61 solver registry entries.*

---

## Related documents

- [VerificationGuide.md](./VerificationGuide.md) — CI commands and JSON schema
- [modules/spring-modules-user-tasks.md](./modules/spring-modules-user-tasks.md) — spring-specific tasks
- [Design-Workflow-Reference.md](./Design-Workflow-Reference.md) — Auto-design / Validate / Compare
