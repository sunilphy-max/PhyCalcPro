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

for (const file of walk("src/components")) {
  let src = readFileSync(file, "utf8");
  const next = src.replace(
    /if \(!result\) \{\r?\n\s+return \(\r?\n\s+<ExportableReport\r?\n\s+fileName=\{[^}]+\}\r?\n\s+calculationSpec=\{result\?\.calculationSpec\}\r?\n/g,
    (m) => m.replace(/\s+calculationSpec=\{result\?\.calculationSpec\}\r?\n/, "\n")
  );
  if (next !== src) {
    writeFileSync(file, next);
    console.log("fixed empty", file);
  }
}
