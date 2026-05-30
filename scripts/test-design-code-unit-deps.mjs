/**
 * Regression: useDesignCodeUnits must not re-apply when only the fieldKeys array reference changes.
 * Run: node scripts/test-design-code-unit-deps.mjs
 */

function effectWouldRun(prev, next) {
  return (
    prev.designCode !== next.designCode ||
    prev.moduleId !== next.moduleId ||
    prev.fieldKeysKey !== next.fieldKeysKey
  );
}

function simulateManyRenders(getFieldKeys, designCode, moduleId, maxRenders = 50) {
  const state = { designCode, moduleId, fieldKeysKey: "" };
  let runs = 0;
  for (let i = 0; i < maxRenders; i++) {
    const fieldKeys = getFieldKeys();
    const fieldKeysKey = fieldKeys.join("\0");
    const next = { designCode, moduleId, fieldKeysKey };
    if (effectWouldRun(state, next)) {
      runs++;
      Object.assign(state, next);
    }
  }
  return runs;
}

const keys = ["length", "load", "inertia", "stress"];

const unstableArrayRef = () => Object.keys({ length: 1, load: 1, inertia: 1, stress: 1 });
const stableKey = () => keys;
const inlineLiteral = () => ["length", "force", "udl", "inertia", "moment", "stress"];

let failed = false;

const unstableRefRuns = simulateManyRenders(
  () => unstableArrayRef(),
  "INDICATIVE",
  "columns"
);
if (unstableRefRuns !== 1) {
  console.error(`FAIL: stable-key deps with new Object.keys each render: ${unstableRefRuns} runs (expected 1)`);
  failed = true;
} else {
  console.log("PASS: fieldKeysKey stable across Object.keys() renders");
}

const inlineRuns = simulateManyRenders(inlineLiteral, "US", "beams");
if (inlineRuns !== 1) {
  console.error(`FAIL: inline literal field keys: ${inlineRuns} runs (expected 1)`);
  failed = true;
} else {
  console.log("PASS: fieldKeysKey stable across inline literal arrays");
}

const codeChangeRuns = (() => {
  const state = { designCode: "INDICATIVE", moduleId: "columns", fieldKeysKey: keys.join("\0") };
  let runs = 1;
  for (const code of ["US", "EU", "ISO"]) {
    const next = { designCode: code, moduleId: "columns", fieldKeysKey: keys.join("\0") };
    if (effectWouldRun(state, next)) {
      runs++;
      Object.assign(state, next);
    }
  }
  return runs;
})();

if (codeChangeRuns !== 4) {
  console.error(`FAIL: design code changes: ${codeChangeRuns} runs (expected 4)`);
  failed = true;
} else {
  console.log("PASS: effect runs once per design code change");
}

process.exit(failed ? 1 : 0);
