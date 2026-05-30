<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product routes (`/products/*`)

- **One sidebar only:** `src/app/products/layout.tsx` renders `Sidebar`. Category layouts (`structural`, `machine`, etc.) must be passthrough wrappers — never import `Sidebar` there.
- **No `DashboardLayout` on product pages:** module chrome comes from `CalculatorLayout` + the products sidebar. `npm run validate:layout` enforces this (also runs before `npm run build`).
- **Unified results UI:** use `CalculatorResultsShell`, `CalculatorMetricCard`, `CalculatorMetricGrid`, and `CalculatorResultsPanel` from `src/components/calculator/results.ts` (column buckling style). Avoid one-off slate summary cards in `*Results.tsx`.
- **Charts:** use `EngineeringPlot` with separate `yLabel`, `unitLabel`, `xLabel`, and `xUnit` (not units baked into labels). Metric summaries must use `formatEngineeringValue` from `src/lib/display/formatEngineering.ts` so peak/max values show units.
- **Design standard vs units:** changing US/EU/ISO/Indicative only sets **defaults** via `useDesignCodeUnits` (runs on `designCode` change, not every render). `ModuleUnitSelect` shows **all** units for the field dimension unless `restrictToProfile` is set.
- **Numeric inputs:** use `CalculatorUnitField` + `calculatorNumberInputClass` (spin buttons hidden, `flex-1 min-w-0` so values like Young's modulus are not clipped). **Metric numbers:** use `CalculatorMetricCard` `numericValue` or `formatDisplayNumber()` for auto scientific notation when |value| ≥ 1000 or &lt; 0.01.
