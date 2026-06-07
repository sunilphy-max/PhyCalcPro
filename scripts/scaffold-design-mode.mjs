#!/usr/bin/env node
/**
 * Wires design workflow into product module pages.
 * Run: node scripts/scaffold-design-mode.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const productsDir = path.join(root, "src", "app", "products");

/** Maps design output fields to page setter + userInputs key expressions. */
const MODULE_CONFIG = {
  frames: {
    inputs: ["length: span", "height", "maxForce: load", "E", "I", "area: area"],
    apply: [
      ["I", "setI"],
      ["area", "setArea"],
      ["sectionDesignation", "setSectionDesignation"],
      ["c", "setC"],
    ],
  },
  trusses: {
    inputs: ["length: span", "height", "maxForce: load", "E", "area: area"],
    apply: [["area", "setArea"]],
  },
  plates: {
    inputs: ["length", "width", "pressure: q", "E", "thickness"],
    apply: [["thickness", "setThickness"]],
  },
  "circular-plates": {
    inputs: ["length: radius", "pressure", "E", "thickness"],
    apply: [["thickness", "setThickness"]],
  },
  "combined-loading": {
    inputs: ["axialLoad: axialForce", "bendingMoment", "torque", "shearForce", "allowableStressPa: yieldStrength"],
    apply: [["width", "setWidth"], ["height", "setHeight"], ["diameter", "setDiameter"]],
  },
  "load-case-manager": {
    inputs: ["axialLoad", "bendingMoment", "torque", "targetSafetyFactor"],
    apply: [["height", "setHeight"], ["width", "setWidth"]],
  },
  gears: {
    inputs: ["power", "speedDriver: rpm", "ratio: gearRatio", "pinionTeeth", "module", "faceWidth"],
    apply: [["module", "setModule"], ["faceWidth", "setFaceWidth"], ["pinionTeeth", "setPinionTeeth"]],
  },
  shafts: {
    inputs: ["torque", "bendingMoment", "length", "targetSafetyFactor"],
    apply: [["diameter", "setDiameter"]],
  },
  bearings: {
    inputs: ["maxForce: radialLoad", "axialLoad", "speedDriver: speed", "requiredLife: lifeHours"],
    apply: [["bearingSeries", "setBearingType"]],
  },
  bolts: {
    inputs: ["maxForce: shearForce", "axialLoad", "allowableStressPa"],
    apply: [["majorDiameter", "setConfig"], ["boltSize", "setConfig"]],
  },
  pipes: {
    inputs: ["pressure", "length: radius", "E", "thickness", "allowableStressPa"],
    apply: [["thickness", "setThickness"]],
  },
  vessels: {
    inputs: ["pressure", "length: radius", "E", "thickness"],
    apply: [["thickness", "setThickness"]],
  },
  vibrations: {
    inputs: ["length", "E", "inertia: I", "excitationHz: excitationFrequency", "dampingRatio"],
    apply: [["inertia", "setI"], ["I", "setI"]],
  },
  profiles: {
    inputs: ["requiredI: I", "width", "height"],
    apply: [["width", "setShape"], ["height", "setShape"]],
  },
};

const SKIP = new Set(["beams", "columns", "compression-springs", "v-belts"]);

function findPages(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findPages(full, acc);
    else if (entry.name === "page.tsx") acc.push(full);
  }
  return acc;
}

function getModuleId(filePath) {
  const rel = path.relative(productsDir, filePath).replace(/\\/g, "/");
  const parts = rel.split("/");
  return parts[parts.length - 2];
}

function defaultConfig(moduleId) {
  return {
    inputs: ["power", "maxForce", "length", "targetSafetyFactor"],
    apply: [],
  };
}

function buildInputsExpr(config) {
  if (!config.inputs.length) return "({})";
  const lines = config.inputs.map((entry) => {
    const [key, expr] = entry.includes(":") ? entry.split(":").map((s) => s.trim()) : [entry, entry];
    return `      ${key}: ${expr},`;
  });
  return `({\n${lines.join("\n")}\n    })`;
}

function buildApplyFn(config) {
  if (!config.apply.length) {
    return `  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);`;
  }
  const lines = config.apply.map(([field, setter]) => {
    return `    if (fields.${field} != null) ${setter}(fields.${field} as never);`;
  });
  return `  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {\n${lines.join("\n")}\n  }, []);`;
}

function patchPage(filePath) {
  const moduleId = getModuleId(filePath);
  if (!moduleId || SKIP.has(moduleId)) return { status: "skipped", moduleId };

  let src = fs.readFileSync(filePath, "utf8");
  if (src.includes("useDesignWorkflow") || src.includes("workflowMode")) {
    return { status: "already", moduleId };
  }
  if (!src.includes("const calculate = ()")) {
    return { status: "no-calculate", moduleId };
  }

  if (!src.includes("useEffect")) {
    src = src.replace(
      /import \{(.*?)\} from "react";/s,
      (_, imports) => {
        const parts = imports.split(",").map((s) => s.trim()).filter(Boolean);
        for (const n of ["useEffect", "useMemo", "useCallback"]) {
          if (!parts.includes(n)) parts.push(n);
        }
        return `import { ${parts.join(", ")} } from "react";`;
      }
    );
  }

  if (!src.includes("useDesignWorkflow")) {
    const anchor = src.includes("CalculatorLayout")
      ? /import CalculatorLayout from "@\/components\/CalculatorLayout";?\n/
      : /("use client";\n\n)/;
    src = src.replace(
      anchor,
      `$&
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
`
    );
  }

  src = src.replace(
    /export default function Page\(\) \{\n/,
    `export default function Page() {\n  const { mode: workflowMode, setUserInputs } = useDesignWorkflow();\n`
  );

  src = src.replace(/const calculate = \(\) => \{/, "const runCheck = () => {");

  const config = MODULE_CONFIG[moduleId] ?? defaultConfig(moduleId);
  const inputsExpr = buildInputsExpr(config);
  const applyFn = buildApplyFn(config);

  const hookBlock = `
  const designUserInputs = useMemo((): ModuleUserInputs => ${inputsExpr}, []);

  useEffect(() => {
    setUserInputs(designUserInputs);
  }, [designUserInputs, setUserInputs]);

${applyFn}

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("${moduleId}", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

`;

  const insertAt = src.lastIndexOf("  return (");
  if (insertAt === -1) return { status: "no-return", moduleId };

  src = src.slice(0, insertAt) + hookBlock + src.slice(insertAt);
  fs.writeFileSync(filePath, src);
  return { status: "patched", moduleId };
}

const results = findPages(productsDir).map(patchPage);
console.log(`Patched: ${results.filter((r) => r.status === "patched").length}`);
for (const r of results.filter((r) => r.status === "patched")) {
  console.log(`  ${r.moduleId}`);
}
