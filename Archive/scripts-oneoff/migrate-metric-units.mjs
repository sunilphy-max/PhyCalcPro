/**
 * Migrate CalculatorMetricCard value={formatEngineeringValue(...)} to numericValue + unit.
 * Run: node scripts/migrate-metric-units.mjs
 */
import fs from "node:fs";
import path from "node:path";

const roots = ["src/components"];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/Results\.tsx$|Dashboard\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

function migrate(content) {
  let next = content;
  let changed = false;

  const apply = (pattern, replacement, label) => {
    const updated = next.replace(pattern, replacement);
    if (updated !== next) {
      changed = true;
      next = updated;
    }
  };

  // formatEngineeringValue(fromBase(expr, "dim", unitVar), unitVar)
  apply(
    /value=\{formatEngineeringValue\(fromBase\(([^,]+),\s*"([^"]+)",\s*(\w+)\),\s*\3\)\}/g,
    "numericValue={fromBase($1, \"$2\", $3)} unit={$3}"
  );

  // formatEngineeringValue(expr, "unit", { options })
  apply(
    /value=\{formatEngineeringValue\(([^,]+),\s*"([^"]+)"\s*,\s*\{[^}]*\}\s*\)\}/g,
    "numericValue={$1} unit=\"$2\""
  );

  // formatEngineeringValue(expr, "unit")
  apply(
    /value=\{formatEngineeringValue\(([^,]+),\s*"([^"]+)"\)\}/g,
    "numericValue={$1} unit=\"$2\""
  );

  // formatEngineeringValue(expr, unitVar) where unitVar is identifier
  apply(
    /value=\{formatEngineeringValue\(([^,]+),\s*(\w+)\)\}/g,
    (match, expr, unitVar) => {
      if (unitVar === "digits" || unitVar === "useExponential") return match;
      return `numericValue={${expr}} unit={${unitVar}}`;
    }
  );

  // `${formatDisplayNumber(fromBase(expr, "dim", unitVar))} ${unitVar}`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(fromBase\(([^,]+),\s*"([^"]+)",\s*(\w+)\)\)\}\s+\$\{\3\}\`\}/g,
    "numericValue={fromBase($1, \"$2\", $3)} unit={$3}"
  );

  // `${formatDisplayNumber(expr)} unit`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s+([^`]+)\`\}/g,
    "numericValue={$1} unit=\"$2\""
  );

  // `${formatDisplayNumber(expr)} ${unitVar}`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s+\$\{(\w+)\}\`\}/g,
    "numericValue={$1} unit={$2}"
  );

  // formatEngineeringValue(fromBase(expr, "dim", "literalUnit"), "literalUnit")
  apply(
    /value=\{formatEngineeringValue\(fromBase\(([^,]+),\s*"([^"]+)",\s*"([^"]+)"\),\s*"\3"\)\}/g,
    "numericValue={fromBase($1, \"$2\", \"$3\")} unit=\"$3\""
  );

  // formatEngineeringValue(expr, units.field, { options })
  apply(
    /value=\{formatEngineeringValue\(([^,]+),\s*(units\.\w+)\s*,\s*\{[^}]*\}\s*\)\}/g,
    "numericValue={$1} unit={$2}"
  );

  // formatEngineeringValue(expr, units.field)
  apply(
    /value=\{formatEngineeringValue\(([^,]+),\s*(units\.\w+)\)\}/g,
    "numericValue={$1} unit={$2}"
  );

  // value={formatDisplayNumber(expr)} without template
  apply(
    /value=\{formatDisplayNumber\(([^)]+)\)\}/g,
    "numericValue={$1} unit=\"—\""
  );

  // `${expr.toFixed(n)} unit`
  apply(
    /value=\{\`\$\{([^}]+)\.toFixed\((\d+)\)\}\s+([^`]+)\`\}/g,
    "numericValue={Number($1.toFixed($2))} unit=\"$3\""
  );

  // `${formatDisplayNumber(expr)}%`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s*%\`\}/g,
    "numericValue={$1} unit=\"%\""
  );

  // `${formatDisplayNumber(expr)} rpm` etc
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s+(\w+)\`\}/g,
    "numericValue={$1} unit=\"$2\""
  );

  // `${formatDisplayNumber(expr)} hr`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s+hr\`\}/g,
    "numericValue={$1} unit=\"hr\""
  );

  // `${formatDisplayNumber(expr)} Hz`
  apply(
    /value=\{\`\$\{formatDisplayNumber\(([^)]+)\)\}\s+Hz\`\}/g,
    "numericValue={$1} unit=\"Hz\""
  );

  // `${(expr * 100).toFixed(1)}%`
  apply(
    /value=\{\`\$\{\(([^)]+)\s*\*\s*100\)\.toFixed\((\d+)\)\}\s*%\`\}/g,
    "numericValue={Number(($1) * 100)} unit=\"%\""
  );

  return { content: next, changed };
}

let total = 0;
for (const root of roots) {
  const abs = path.join(process.cwd(), root);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const original = fs.readFileSync(file, "utf8");
    if (!original.includes("CalculatorMetricCard")) continue;
    const { content, changed } = migrate(original);
    if (changed) {
      fs.writeFileSync(file, content);
      total += 1;
      console.log(path.relative(process.cwd(), file));
    }
  }
}

console.log(`Updated ${total} files.`);
