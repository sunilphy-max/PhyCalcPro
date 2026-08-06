# Bearings gold / screening-reference cases

Hybrid benchmark set for the bearings suite.

| `kind` | Meaning |
|--------|---------|
| `screening_reference` | PhyCalcPro / ISO-form regression. Enforced by `npm run test:bearings-gold` and Vitest. |
| `external_reference_a` / `external_reference_b` | Placeholder for pasted independent reference gold. Keep `status: "pending_vendor_gold"` until values are filled. |

## Adding external reference gold

1. Run the same duty in an independent ISO 281 reference tool or worksheet.
2. Edit the matching JSON (or seed in `src/lib/qa/bearingsGoldCases.ts`).
3. Set `expect.modifiedLife`, `equivalentLoad`, `staticSafetyFactor`, `aIso` (and others as needed).
4. Set `status` to `"active"` and `tolerancePct` to `5` (sign-off target).
5. Re-run `npm run test:bearings-gold`.

Do not claim “within 5% of an external reference” in docs until those cases are active and green.
