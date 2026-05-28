import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const dir = join(process.cwd(), "src/data/verification");
let passed = 0;
let failed = 0;

if (!existsSync(dir)) {
  console.log("No verification cases yet. Add JSON files to src/data/verification/");
  process.exit(0);
}

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".json")) continue;
  try {
    const c = JSON.parse(readFileSync(join(dir, file), "utf8"));
    if (c.id && c.moduleId) {
      console.log(`[pending] ${c.id} (${c.moduleId}/${c.designCode}) — solver hook not automated yet`);
      passed++;
    }
  } catch (e) {
    console.error(`[invalid] ${file}:`, e.message);
    failed++;
  }
}

console.log(`\n${passed} case file(s) OK, ${failed} invalid.`);
process.exit(failed > 0 ? 1 : 0);
