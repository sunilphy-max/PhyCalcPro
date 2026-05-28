import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith("Results.tsx")) acc.push(p);
  }
  return acc;
}

function addSpec(src) {
  if (src.includes("calculationSpec")) return src;
  const blocks = [...src.matchAll(/<ExportableReport[\s\S]*?<\/ExportableReport>/g)];
  if (!blocks.length) return src;
  let target =
    blocks.length > 1
      ? blocks[blocks.length - 1][0]
      : blocks[0][0].includes("csvRows") || blocks[0][0].length > 400
        ? blocks[0][0]
        : null;
  if (!target) return src;
  const updated = target.replace(
    /(fileName=[^\r\n]+\r?\n)/,
    "$1      calculationSpec={result?.calculationSpec}\n"
  );
  return src.replace(target, updated);
}

for (const file of walk("src/components")) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("ExportableReport")) continue;
  const next = addSpec(src);
  if (next !== src) {
    writeFileSync(file, next);
    console.log("spec", file);
  }
}
