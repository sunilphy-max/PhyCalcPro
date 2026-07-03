const fs = require("fs");
const path = require("path");

const ROOT = "D:\\PhyCalcPro";
const modulesPath = path.join(ROOT, "src/data/modules.ts");

console.log("📂 Reading:", modulesPath);

if (!fs.existsSync(modulesPath)) {
  console.error("❌ modules.ts not found");
  process.exit(1);
}

const modulesFile = fs.readFileSync(modulesPath, "utf-8");

/**
 * 🧠 STEP 1 — Extract ALL product routes safely
 * This avoids dependency on "route:" or "href:" structure
 */
const routeRegex = /["'`]\/products\/[^"'`]+["'`]/g;

const matches = modulesFile.match(routeRegex) || [];

const routes = matches.map((r) =>
  r.replace(/["'`]/g, "").trim()
);

console.log(`\n🔎 Found routes: ${routes.length}\n`);

routes.forEach((r) => console.log("→", r));

if (routes.length === 0) {
  console.error("❌ No routes found. Check modules.ts file.");
  process.exit(1);
}

/**
 * 🧱 Ensure folder exists
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * 🧾 Create Next.js page.tsx
 */
function createPage(route) {
  const parts = route.split("/").filter(Boolean);

  // products/category/module or products/module (e.g. profiles)
  if (parts.length < 2 || parts[0] !== "products") {
    console.log("⚠️ Skipping invalid route:", route);
    return;
  }

  const folderPath =
    parts.length === 2
      ? path.join(ROOT, "src/app/products", parts[1])
      : path.join(ROOT, "src/app/products", parts[1], parts[2]);

  const category = parts.length === 2 ? parts[1] : parts[1];
  const module = parts.length === 2 ? parts[1] : parts[2];

  const filePath = path.join(folderPath, "page.tsx");

  ensureDir(folderPath);

  if (fs.existsSync(filePath)) {
    console.log("⚡ Exists:", route);
    return;
  }

  const content = `import { getModuleByRoute } from "@/data/modules";
import { notFound } from "next/navigation";

export default function Page() {
  const route = "/products/${category}/${module}";
  const module = getModuleByRoute(route);

  if (!module) return notFound();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold">{module.title}</h1>
      <p className="text-slate-400 mt-2">{module.description}</p>

      <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <p>
          Engineering workspace for <b>{module.title}</b>
        </p>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("✅ Created:", route);
}

/**
 * 🚀 RUN GENERATION
 */
routes.forEach(createPage);

console.log("\n🎉 DONE: Route generation complete.");