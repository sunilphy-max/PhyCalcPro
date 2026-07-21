/**
 * Ensures /products routes use a single products nav (products/layout.tsx only).
 * Run: npm run validate:layout
 */
import fs from "node:fs";
import path from "node:path";

const productsRoot = path.join(process.cwd(), "src", "app", "products");
const rootLayout = path.join(productsRoot, "layout.tsx");
const errors = [];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

for (const file of walk(productsRoot)) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");

  if (file.endsWith("layout.tsx") && file !== rootLayout) {
    const content = fs.readFileSync(file, "utf8");
    if (/\b(Sidebar|ProductsCategoryBar)\b/.test(content)) {
      errors.push(`${rel}: category layouts must not render products nav (use src/app/products/layout.tsx only).`);
    }
  }

  if (file.endsWith("page.tsx")) {
    const content = fs.readFileSync(file, "utf8");
    if (/\bDashboardLayout\b/.test(content)) {
      errors.push(`${rel}: product pages must not wrap with DashboardLayout (duplicate chrome under /products).`);
    }
    if (/\b(center|left|right)=\{/.test(content)) {
      errors.push(
        `${rel}: use CalculatorLayout inputs/results only — remove legacy center/left/right props.`
      );
    }
  }
}

if (errors.length) {
  console.error("Product layout validation failed:\n");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

// Results should use CalculatorResultsShell (buckling-style panel + export wrapper).
const resultsRoot = path.join(process.cwd(), "src", "components");
const legacyMetricPattern =
  /text-xs uppercase tracking-wider text-slate-500[\s\S]{0,120}text-2xl font-semibold text-slate-900/;

for (const file of walk(resultsRoot)) {
  if (!file.endsWith("Results.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  if (legacyMetricPattern.test(content)) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    errors.push(
      `${rel}: use CalculatorMetricCard from @/components/calculator/results instead of inline slate metric blocks.`
    );
  }
  if (
    content.includes("ExportableReport") &&
    !content.includes("CalculatorResultsShell")
  ) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    errors.push(
      `${rel}: wrap results in CalculatorResultsShell instead of ExportableReport directly.`
    );
  }
}

// Calculator inputs must use CalculatorCalculateButton, not legacy slate/black buttons.
for (const file of walk(resultsRoot)) {
  if (!file.endsWith("Inputs.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");

  if (/bg-slate-900|bg-black text-white/.test(content)) {
    errors.push(
      `${rel}: replace legacy calculate button with CalculatorCalculateButton (see PinInputs.tsx).`
    );
  }
  if (!content.includes("CalculatorCalculateButton") && !content.includes("calculatorPrimaryButtonClass")) {
    errors.push(`${rel}: missing CalculatorCalculateButton in inputs panel footer.`);
  }
  if (/\bModuleUnitField\b/.test(content)) {
    errors.push(`${rel}: use CalculatorUnitField + ModuleUnitSelect instead of ModuleUnitField.`);
  }
  if (/type="number"[\s\S]{0,240}border-slate-300|border-slate-300[\s\S]{0,240}type="number"/.test(content)) {
    errors.push(`${rel}: use CalculatorUnitField + calculatorNumberInputClass for numeric inputs.`);
  }
}

// Dashboards should not use one-off slate summary panels.
const dashboardMetricPattern = /rounded-xl border border-slate-200 bg-slate-50|rounded-xl bg-slate-900/;
for (const file of walk(resultsRoot)) {
  if (!file.endsWith("Results.tsx") && !file.endsWith("Dashboard.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  if (dashboardMetricPattern.test(content)) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    errors.push(
      `${rel}: use CalculatorMetricCard / CalculatorResultsPanel instead of one-off slate summary blocks.`
    );
  }
}

if (errors.length) {
  console.error("Product layout validation failed:\n");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log("Product layout validation passed.");
