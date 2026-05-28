import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function findPages(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) findPages(p, acc);
    else if (name === "page.tsx") acc.push(p);
  }
  return acc;
}

for (const file of findPages("src/app/products")) {
  let src = readFileSync(file, "utf8");
  if (!src.includes("wrapResult")) continue;

  const updated = src.replace(/setResult\((?!wrapResult)([\s\S]*?)\);/g, (match, inner) => {
    if (inner.includes("wrapResult")) return match;
    return `setResult(wrapResult(${inner.trim()}));`;
  });

  if (updated !== src) {
    writeFileSync(file, updated);
    console.log("fixed setResult", file);
  }
}
