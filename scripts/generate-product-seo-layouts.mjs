/**
 * Generates server layout.tsx files with per-module SEO metadata for product calculators.
 * Usage: node scripts/generate-product-seo-layouts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_FILE = path.join(ROOT, "src", "data", "modules.ts");
const APP_PRODUCTS = path.join(ROOT, "src", "app", "products");

const LAYOUT_TEMPLATE = (route) => `import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("${route}");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
`;

function collectModuleRoutes() {
  const source = fs.readFileSync(MODULES_FILE, "utf8");
  const routes = [...source.matchAll(/route: "(\/products\/[^"]+)"/g)].map((match) => match[1]);
  return [...new Set(routes)];
}

function routeToLayoutPath(route) {
  const relative = route.replace(/^\/products\//, "");
  return path.join(APP_PRODUCTS, ...relative.split("/"), "layout.tsx");
}

let created = 0;
let updated = 0;
let skipped = 0;

for (const route of collectModuleRoutes()) {
  const layoutPath = routeToLayoutPath(route);
  const content = LAYOUT_TEMPLATE(route);

  if (!fs.existsSync(path.dirname(layoutPath))) {
    console.warn(`Skipping missing directory for ${route}`);
    skipped += 1;
    continue;
  }

  if (fs.existsSync(layoutPath)) {
    const existing = fs.readFileSync(layoutPath, "utf8");
    if (existing === content) {
      skipped += 1;
      continue;
    }
    fs.writeFileSync(layoutPath, content, "utf8");
    updated += 1;
  } else {
    fs.writeFileSync(layoutPath, content, "utf8");
    created += 1;
  }
}

console.log(`Product SEO layouts: ${created} created, ${updated} updated, ${skipped} unchanged`);
