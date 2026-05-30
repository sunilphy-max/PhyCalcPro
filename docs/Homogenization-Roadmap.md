# Homogenization roadmap

## Calculator module contract

Every product module should follow:

```
page.tsx
  useStandardCalculation(moduleId, onRegionUnits?)  // or useCalculatorModule
  CalculatorLayout(moduleId, left, center, right)
  left   → CalculatorInputPanel + inputs
  center → CalculatorGuidancePanel / diagrams
  right  → *Results → ExportableReport(moduleId=…)
  calculate → solver → wrapResult(output)
```

Shared components live in `src/components/calculator/`.

## Layout

- **left** — inputs
- **center** — guidance / schematics
- **right** — results + export

## Units

- Field definitions: `src/lib/units/moduleProfiles.ts`
- UI: `ModuleUnitField`
- Region sync: pass `applyUnitMap` as second arg to `useStandardCalculation`
- Wired on: fits, impact, corrosion, fatigue, combined-loading, suspension, load-case-manager, temperature-properties, columns, gears, pipes, shafts (+ auto-sync for all profiled modules via hook)

## Extracted monolith modules (complete)

- impact, corrosion, fatigue, combined-loading, suspension, load-case-manager, temperature-properties

## Outputs

- `ExportableReport` with `moduleId` adds quality checklist + default CSV rows
- US/EU/ISO checks: specialized evaluators + generic mapper in `evaluators/generic.ts`

## Plots

- Use `EngineeringPlot` (`data-export-plot`) for PDF capture
- SVG diagrams: wrap with `data-export-diagram`
