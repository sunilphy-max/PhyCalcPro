/** Add unit="—" to CalculatorMetricCard numericValue props missing a unit attribute. */
import fs from "node:fs";
import path from "node:path";

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

let total = 0;
for (const file of walk(path.join(process.cwd(), "src/components"))) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("CalculatorMetricCard")) continue;
  const original = content;

  content = content.replace(
    /(<CalculatorMetricCard[\s\S]*?numericValue=\{[^}]+\})(\s+(?!unit=)(tone|status|size)=)/g,
    '$1 unit="—"$2'
  );

  content = content.replace(
    /(<CalculatorMetricCard[\s\S]*?numericValue=\{[^}]+\})(\s*\/>)/g,
    (match, before, end) => (before.includes("unit=") ? match : `${before} unit="—"${end}`)
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    total += 1;
    console.log(path.relative(process.cwd(), file));
  }
}

console.log(`Patched ${total} files.`);
