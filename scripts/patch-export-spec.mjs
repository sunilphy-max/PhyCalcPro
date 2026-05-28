import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";

const files = [
  ...globSync("src/components/**/*Results.tsx"),
  ...globSync("src/app/products/**/page.tsx"),
];

for (const file of files) {
  let src = readFileSync(file, "utf8");
  if (!src.includes("ExportableReport")) continue;
  if (src.includes("calculationSpec=")) continue;

  const hasResult = src.includes("result") && (src.includes("result.") || src.includes("result?"));
  if (!hasResult) continue;

  const updated = src.replace(
    /<ExportableReport\n([\s\S]*?)>/g,
    (block, inner) => {
      if (inner.includes("calculationSpec")) return block;
      return `<ExportableReport\n${inner}      calculationSpec={result?.calculationSpec ?? result?.calculationSpec}\n    >`.replace(
        "result?.calculationSpec ?? result?.calculationSpec",
        "result.calculationSpec"
      );
    }
  );

  if (updated !== src) {
    writeFileSync(file, updated);
    console.log("patched", file);
  }
}
