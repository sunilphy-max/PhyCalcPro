import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const FILES = [
  "src/components/dynamics/rotation/RotationResults.tsx",
  "src/components/manufacturing/FitResults.tsx",
  "src/components/manufacturing/ToleranceResults.tsx",
  "src/components/materials/SectionResults.tsx",
];

function patchFile(file) {
  let src = readFileSync(file, "utf8");
  if (src.includes("calculationSpec={result")) return false;

  if (!src.includes("WithCalculationSpec")) {
    const imp = `import type { WithCalculationSpec } from "@/lib/standards/types";\n`;
    src = src.startsWith('"use client"')
      ? src.replace(/("use client";\r?\n\r?\n)/, `$1${imp}`)
      : imp + src;
  }

  // Inline object props -> named type alias for WithCalculationSpec
  if (file.includes("RotationResults")) {
    src = src.replace(
      /type Props = \{\r?\n  result:\r?\n    \| \{[\s\S]*?\}\r?\n    \| null;\r?\n\};/,
      `type RotationResult = {
        inertia: number;
        omega: number;
        kineticEnergy: number;
        centripetalAcceleration: number;
        centripetalForce: number;
        torque: number;
      };

type Props = {
  result: WithCalculationSpec<RotationResult> | null;
};`
    );
  } else if (file.includes("FitResults")) {
    src = src.replace(
      /  result: \{[\s\S]*?fitType: "clearance" \| "transition" \| "interference";\r?\n  \} \| null;/,
      `  result: WithCalculationSpec<{
    holeMin: number;
    holeMax: number;
    shaftMin: number;
    shaftMax: number;
    clearanceMin: number;
    clearanceMax: number;
    fitType: "clearance" | "transition" | "interference";
  }> | null;`
    );
  } else if (file.includes("ToleranceResults") || file.includes("SectionResults")) {
    src = src.replace(/result: (\w+) \| null;/, "result: WithCalculationSpec<$1> | null;");
  }

  src = src.replace(
    /(<ExportableReport\r?\n\s+fileName=[^\r\n]+\r?\n)/g,
    (match, _p1, offset, full) => {
      const before = full.slice(0, offset);
      const inEmpty = /if \(!result\) \{[\s\S]*$/.test(before) && !/return \(\r?\n\s+<ExportableReport[\s\S]*\r?\n\s+<ExportableReport/.test(before);
      if (inEmpty) return match;
      return `${match}      calculationSpec={result?.calculationSpec}\n`;
    }
  );

  writeFileSync(file, src);
  return true;
}

for (const file of FILES) {
  if (patchFile(file)) console.log("patched", file);
}
