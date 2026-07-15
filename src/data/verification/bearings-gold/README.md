# Bearings gold / screening-reference cases

Hybrid benchmark set for the bearings suite.

| `kind` | Meaning |
|--------|---------|
| `screening_reference` | PhyCalcPro / ISO-form regression. Enforced by `npm run test:bearings-gold` and Vitest. |
| `vendor_skf` / `vendor_mitcalc` | Placeholder for pasted Product Select / MITCalc gold. Keep `status: "pending_vendor_gold"` until values are filled. |

## Adding vendor gold

1. Run the same duty in SKF Product Select or MITCalc.
2. Edit the matching JSON (or seed in `src/lib/qa/bearingsGoldCases.ts`).
3. Set `expect.modifiedLife`, `equivalentLoad`, `staticSafetyFactor`, `aIso` (and others as needed).
4. Set `status` to `"active"` and `tolerancePct` to `5` (sign-off target).
5. Re-run `npm run test:bearings-gold`.

Do not claim “within 5% of SKF” in docs until vendor cases are active and green.
