/**
 * Generates public/sitemap.xml from Next.js app routes and module documentation pages.
 * Usage: node scripts/generate-sitemap.mjs [--base-url https://phycalcpro.com]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "src", "app");
const DEFAULT_BASE_URL = "https://phycalcpro.com";

const CATEGORY_IDS = new Set([
  "structural",
  "power-transmission",
  "machine",
  "springs",
  "fasteners",
  "materials",
  "pressure",
  "dynamics",
  "manufacturing",
  "advanced-systems",
  "tools",
]);

function parseBaseUrl() {
  const flagIndex = process.argv.indexOf("--base-url");
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1].replace(/\/+$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return (envUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function collectStaticRoutes(dir, segments = []) {
  const routes = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        routes.push(...collectStaticRoutes(fullPath, segments));
        continue;
      }
      if (entry.name.startsWith("[")) continue;
      routes.push(...collectStaticRoutes(fullPath, [...segments, entry.name]));
      continue;
    }

    if (entry.name === "page.tsx" || entry.name === "page.ts") {
      const route = "/" + segments.join("/");
      routes.push(route === "/" ? "/" : route.replace(/\/+$/, ""));
    }
  }

  return routes;
}

function collectModuleDocRoutes() {
  const modulesFile = fs.readFileSync(path.join(ROOT, "src", "data", "modules.ts"), "utf8");
  const moduleIds = [...modulesFile.matchAll(/id: "([^"]+)"/g)]
    .map((match) => match[1])
    .filter((id, index, all) => all.indexOf(id) === index && !CATEGORY_IDS.has(id));

  if (!moduleIds.includes("profiles")) {
    moduleIds.push("profiles");
  }

  return moduleIds.map((id) => `/documentation/modules/${id}`);
}

function priorityFor(route) {
  if (route === "/") return "1.0";
  if (route === "/products") return "0.9";
  if (route.startsWith("/products/")) return "0.8";
  if (route.startsWith("/documentation/modules/")) return "0.6";
  if (route.startsWith("/documentation")) return "0.7";
  if (route.startsWith("/legal/")) return "0.4";
  if (route.startsWith("/billing/")) return "0.3";
  return "0.5";
}

function changefreqFor(route) {
  if (route === "/" || route === "/products" || route === "/status") return "weekly";
  if (route.startsWith("/products/")) return "monthly";
  if (route.startsWith("/documentation")) return "monthly";
  if (route.startsWith("/legal/")) return "yearly";
  return "monthly";
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(baseUrl, routes) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((route) => {
      const loc = route === "/" ? baseUrl : `${baseUrl}${route}`;
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreqFor(route)}</changefreq>`,
        `    <priority>${priorityFor(route)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

const baseUrl = parseBaseUrl();
const staticRoutes = collectStaticRoutes(APP_DIR);
const docRoutes = collectModuleDocRoutes();
const routes = [...new Set([...staticRoutes, ...docRoutes])].sort((a, b) => {
  if (a === "/") return -1;
  if (b === "/") return 1;
  return a.localeCompare(b);
});

const outputPath = path.join(ROOT, "public", "sitemap.xml");
fs.writeFileSync(outputPath, buildSitemap(baseUrl, routes), "utf8");

console.log(`Wrote ${routes.length} URLs to ${outputPath}`);
console.log(`Base URL: ${baseUrl}`);
