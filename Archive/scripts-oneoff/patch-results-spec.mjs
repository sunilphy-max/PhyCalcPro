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

function patchFile(file) {
  let src = readFileSync(file, "utf8");
  if (!src.includes("ExportableReport") || src.includes("calculationSpec={result")) return false;

  if (!src.includes("WithCalculationSpec")) {
    if (src.includes('from "@/lib/standards/types"')) {
      src = src.replace(
        /import type \{([^}]+)\} from "@\/lib\/standards\/types";/,
        (m, inner) =>
          inner.includes("WithCalculationSpec")
            ? m
            : `import type { WithCalculationSpec${inner.trim() ? `, ${inner.trim()}` : ""} } from "@/lib/standards/types";`
      );
    } else {
      src = src.replace(
        /("use client";\r?\n\r?\n)/,
        `$1import type { WithCalculationSpec } from "@/lib/standards/types";\n`
      );
    }
    src = src.replace(
      /result: (\w+) \| null;/g,
      "result: WithCalculationSpec<$1> | null;"
    );
  }

  src = src.replace(
    /(<ExportableReport\r?\n\s+fileName=\{[^}]+\}\r?\n)/g,
    "$1      calculationSpec={result?.calculationSpec}\n"
  );

  writeFileSync(file, src);
  return true;
}

for (const file of walk("src/components")) {
  if (patchFile(file)) console.log("patched", file);
}
