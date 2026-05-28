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
  if (!src.includes("WithCalculationSpec") || src.includes("@/lib/standards/types")) continue;
  const imp = `import type { WithCalculationSpec } from "@/lib/standards/types";\n`;
  if (src.startsWith('"use client"')) {
    src = src.replace(/("use client";\r?\n\r?\n)/, `$1${imp}`);
  } else {
    src = imp + src;
  }
  writeFileSync(file, src);
  console.log("import", file);
}
