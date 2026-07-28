/**
 * Migrate CalculatorLayout left/center/right → inputs/results.
 * Removes center slot (guidance remains in ModuleDesignAdvisor).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const productsRoot = path.join(import.meta.dirname, "..", "src", "app", "products");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name === "page.tsx") files.push(full);
  }
  return files;
}

function migrate(content) {
  if (!content.includes("left={") && !content.includes("right={")) return null;

  let next = content;
  next = next.replace(/\bleft=\{/g, "inputs={");
  next = next.replace(/\bright=\{/g, "results={");

  // Remove center={ ... } blocks (guidance panel or filler)
  const centerRe = /\n\s*center=\{[\s\S]*?\n\s*\}(?=\s*\n\s*results=)/g;
  next = next.replace(centerRe, "");

  return next === content ? null : next;
}

let changed = 0;
for (const file of walk(productsRoot)) {
  const raw = readFileSync(file, "utf8");
  const migrated = migrate(raw);
  if (migrated) {
    writeFileSync(file, migrated, "utf8");
    changed++;
    console.log("migrated:", path.relative(productsRoot, file));
  }
}
console.log(`Done. ${changed} files updated.`);
