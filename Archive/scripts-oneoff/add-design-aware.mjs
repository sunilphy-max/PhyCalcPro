#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (e.name.endsWith("Inputs.tsx")) acc.push(f);
  }
  return acc;
}

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("CalculatorCalculateButton")) continue;
  if (src.includes("designAware")) continue;
  const next = src.replace(
    /<CalculatorCalculateButton([^>]*)\/>/g,
    (match, attrs) => {
      if (attrs.includes("designAware") || /label=\{[^}]*\?/.test(attrs)) return match;
      return `<CalculatorCalculateButton${attrs.trimEnd()} designAware />`;
    }
  );
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log(path.relative(root, file));
  }
}
