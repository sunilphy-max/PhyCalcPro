/**
 * Migrates *Results.tsx from ExportableReport to CalculatorResultsShell.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "components");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith("Results.tsx")) files.push(full);
  }
  return files;
}

let updated = 0;

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("ExportableReport") || content.includes("CalculatorResultsShell")) {
    continue;
  }

  content = content.replace(
    /import ExportableReport from ["']@\/components\/shared\/ExportableReport["'];\r?\n/g,
    'import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";\n'
  );
  content = content.replace(/<ExportableReport/g, "<CalculatorResultsShell");
  content = content.replace(/<\/ExportableReport>/g, "</CalculatorResultsShell>");

  fs.writeFileSync(file, content);
  updated += 1;
  console.log("Migrated", path.relative(process.cwd(), file));
}

console.log(`Done. ${updated} file(s) updated.`);
