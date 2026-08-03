import { readFile } from "node:fs/promises";

async function main() {
  // Import after ensuring we're testing the real module path
  const { rasterizePdf } = await import("../src/lib/manufacturing/gdt/rasterizePdf");
  const buf = await readFile("public/samples/SHA-100.pdf");
  const r = await rasterizePdf(buf);
  console.log(
    JSON.stringify(
      {
        pageCount: r.pageCount,
        textPreview: r.textByPage[0]?.slice(0, 160),
        warnings: r.warnings,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
