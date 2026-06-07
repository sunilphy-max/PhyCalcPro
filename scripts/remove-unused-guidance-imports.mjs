import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "src", "app", "products");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name === "page.tsx") files.push(full);
  }
  return files;
}

let n = 0;
for (const file of walk(root)) {
  let content = readFileSync(file, "utf8");
  if (!content.includes("CalculatorGuidancePanel")) continue;
  if (content.includes("<CalculatorGuidancePanel")) continue;
  const next = content
    .replace(/import CalculatorGuidancePanel from "@\/components\/calculator\/CalculatorGuidancePanel";\n?/g, "")
    .replace(/import CalculatorGuidancePanel from '@\/components\/calculator\/CalculatorGuidancePanel';\n?/g, "");
  if (next !== content) {
    writeFileSync(file, next, "utf8");
    n++;
  }
}
console.log(`Removed unused imports from ${n} files.`);
