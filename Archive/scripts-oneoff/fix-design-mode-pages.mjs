#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const productsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "products");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (e.name === "page.tsx") acc.push(f);
  }
  return acc;
}

const IMPORTS = `import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
`;

for (const file of walk(productsDir)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("designUserInputs") && !src.includes("runModuleDesignMode")) continue;

  if (!src.includes("useDesignWorkflow")) {
    src = src.replace(/("use client";\r?\n\r?\n)/, `$1${IMPORTS}`);
  }

  if (!src.includes("workflowMode")) {
    src = src.replace(
      /export default function Page\(\) \{\r?\n/,
      `export default function Page() {\n  const { mode: workflowMode, setUserInputs } = useDesignWorkflow();\n`
    );
  }

  // Remove broken default placeholder inputs referencing undefined vars
  src = src.replace(
    /const designUserInputs = useMemo\(\(\): ModuleUserInputs => \(\{[\s\S]*?\}\), \[\]\);/g,
    "const designUserInputs = useMemo((): ModuleUserInputs => ({}), []);"
  );

  if (!src.includes("useMemo") && src.includes("ModuleUserInputs")) {
    src = src.replace(
      /import \{([^}]+)\} from "react";/,
      (_, imp) => {
        const parts = imp.split(",").map((s) => s.trim()).filter(Boolean);
        for (const n of ["useMemo", "useCallback", "useEffect"]) {
          if (!parts.includes(n)) parts.push(n);
        }
        return `import { ${parts.join(", ")} } from "react";`;
      }
    );
  }

  fs.writeFileSync(file, src);
  console.log(path.relative(productsDir, file));
}

console.log("done");
