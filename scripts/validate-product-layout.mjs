/**
 * Ensures /products routes use a single sidebar (products/layout.tsx only).
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
    if (/\bSidebar\b/.test(content)) {
      errors.push(`${rel}: category layouts must not render Sidebar (use src/app/products/layout.tsx only).`);
    }
  }

  if (file.endsWith("page.tsx")) {
    const content = fs.readFileSync(file, "utf8");
    if (/\bDashboardLayout\b/.test(content)) {
      errors.push(`${rel}: product pages must not wrap with DashboardLayout (duplicate chrome under /products).`);
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

if (errors.length) {
  console.error("Product layout validation failed:\n");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log("Product layout validation passed.");
