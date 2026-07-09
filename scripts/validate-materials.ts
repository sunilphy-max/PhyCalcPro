#!/usr/bin/env tsx
/**
 * Ensures product pages do not define local MATERIALS maps — use central catalog instead.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "src", "app", "products");
const FORBIDDEN = /const\s+MATERIALS\s*:\s*Record/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const violations: string[] = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  if (FORBIDDEN.test(text)) {
    violations.push(file.replace(process.cwd(), "").replace(/\\/g, "/"));
  }
}

if (violations.length > 0) {
  console.error("Local MATERIALS maps found (use @/data/materials instead):");
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log("validate-materials: no local MATERIALS maps in product pages.");
