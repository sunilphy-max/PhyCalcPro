#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const products = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "products");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (e.name === "page.tsx") acc.push(f);
  }
  return acc;
}

for (const file of walk(products)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("applyDesignFields") || src.includes("useRegisterApplyDesignCandidate(applyDesignFields)")) {
    continue;
  }
  if (!src.includes("useRegisterApplyDesignCandidate")) {
    src = src.replace(
      /("use client";\r?\n\r?\n)/,
      `$1import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";\n`
    );
  }
  src = src.replace(
    /(const applyDesignFields = useCallback\([\s\S]*?\}, \[[^\]]*\]\);)/,
    `$1\n\n  useRegisterApplyDesignCandidate(applyDesignFields);`
  );
  fs.writeFileSync(file, src);
  console.log(path.relative(products, file));
}
