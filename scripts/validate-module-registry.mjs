/**
 * Ensures every route in src/data/modules.ts has a matching page.tsx and vice versa.
 * Category landing pages (`/products/{categoryId}`) are allowed when the category exists.
 * Run: node scripts/validate-module-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modulesPath = path.join(root, "src", "data", "modules.ts");
const productsRoot = path.join(root, "src", "app", "products");
const errors = [];

const modulesFile = fs.readFileSync(modulesPath, "utf8");
const routeRegex = /route:\s*["'](\/products\/[^"']+)["']/g;
const registryRoutes = new Set();

for (const match of modulesFile.matchAll(routeRegex)) {
  registryRoutes.add(match[1]);
}

const categoryIds = new Set();
for (const route of registryRoutes) {
  const parts = route.split("/").filter(Boolean); // products, category, module
  if (parts.length >= 2) categoryIds.add(parts[1]);
}

const categoryLandingRoutes = new Set(
  [...categoryIds].map((id) => `/products/${id}`)
);

function walkPages(dir, pages = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPages(full, pages);
    else if (entry.name === "page.tsx") pages.push(full);
  }
  return pages;
}

const hubPage = path.join(productsRoot, "page.tsx");
const productPages = walkPages(productsRoot).filter((p) => p !== hubPage);

function routeFromPage(pagePath) {
  const rel = path.relative(productsRoot, pagePath).replace(/\\/g, "/");
  const segments = rel.replace(/\/page\.tsx$/, "");
  return `/products/${segments}`;
}

const pageRoutes = new Set(productPages.map(routeFromPage));

for (const route of registryRoutes) {
  if (!pageRoutes.has(route)) {
    errors.push(`Missing page.tsx for registry route: ${route}`);
  }
}

for (const route of pageRoutes) {
  if (registryRoutes.has(route) || categoryLandingRoutes.has(route)) continue;
  errors.push(`Orphan page.tsx not in modules.ts: ${route}`);
}

for (const route of categoryLandingRoutes) {
  if (!pageRoutes.has(route)) {
    errors.push(`Missing category landing page.tsx: ${route}`);
  }
}

if (errors.length) {
  console.error("Module registry validation failed:\n");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `Module registry validation passed (${registryRoutes.size} modules, ${categoryLandingRoutes.size} category landings).`
);