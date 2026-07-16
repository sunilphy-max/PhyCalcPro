# Homogenization roadmap

**Module reference (formulas, methods, gaps):** [Modules-Technical-Reference.md](./Modules-Technical-Reference.md) — published on the site at `/documentation/reference` and `/documentation/modules/[moduleId]`.

## Calculator module contract

Every product module should follow:

```
page.tsx
  useStandardCalculation(moduleId, onRegionUnits?)  // or useCalculatorModule
  CalculatorLayout(moduleId, inputs, results)
  inputs  → CalculatorInputPanel + *Inputs.tsx
  results → *Results.tsx → CalculatorResultsShell → ExportableReport(moduleId=…)
  calculate → solver → wrapResult(output)
```

Shared components live in `src/components/calculator/`. See [AGENTS.md](../AGENTS.md) for the authoritative contract.

## Layout

- **Single products nav** — only `src/app/products/layout.tsx` renders `Sidebar` (category sub-bar with module dropdowns).
- **Category layouts** — passthrough wrappers only (no duplicate chrome).
- **inputs / results** — two-column module chrome via `CalculatorLayout`; legacy `left/center/right` props are forbidden on product pages.

## Units

- Field definitions: `src/lib/units/moduleProfiles.ts`
- UI: `CalculatorUnitField` + `ModuleUnitSelect` (show all units unless `restrictToProfile`)
- Region sync: pass `applyUnitMap` as second arg to `useStandardCalculation` (runs on `designCode` change)
- Numeric inputs: `calculatorNumberInputClass` (spin buttons hidden, `flex-1 min-w-0`)

## Results

- `CalculatorResultsShell`, `CalculatorMetricGrid`, `CalculatorMetricCard`, `CalculatorResultsPanel`
- Metric values: `numericValue` or `formatEngineeringValue` / `formatDisplayNumber`
- Charts: `EngineeringPlot` with separate `yLabel`, `unitLabel`, `xLabel`, `xUnit`

## Outputs

- `ExportableReport` with `moduleId` adds quality checklist + default CSV rows
- US/EU/ISO checks: specialized evaluators + generic mapper in `evaluators/generic.ts`
- Governing equations: `src/lib/standards/equations/` registries → `CalculationSpec.equations` → `CalculationBasisPanel`

## Validation

- `npm run validate:layout` — registry sync, sidebar contract, input/results patterns
- Gold standard reference: `PinInputs.tsx` + `PinResults.tsx`
