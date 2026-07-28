/**
 * One-off helper: removes DashboardLayout wrapper from product pages.
 * Safe to re-run; no-op when already stripped.
 */
import fs from "node:fs";
import path from "node:path";

const productsRoot = path.join(process.cwd(), "src", "app", "products");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === "page.tsx") files.push(full);
  }
  return files;
}

let updated = 0;

for (const file of walk(productsRoot)) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("DashboardLayout")) continue;

  content = content.replace(
    /import DashboardLayout from ["']@\/components\/DashboardLayout["'];\r?\n/g,
    ""
  );
  content = content.replace(
    /<DashboardLayout title={[^}]+}>\s*\n/g,
    ""
  );
  content = content.replace(
    /<DashboardLayout title="[^"]*">\s*\n/g,
    ""
  );
  content = content.replace(/\s*<\/DashboardLayout>\s*\n/g, "\n");

  fs.writeFileSync(file, content);
  updated += 1;
  console.log("Updated", path.relative(process.cwd(), file));
}

console.log(`Stripped DashboardLayout from ${updated} file(s).`);
