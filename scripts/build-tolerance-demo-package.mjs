/**
 * Builds a sample BOM + drawing ZIP for Tolerance Stackup package mode.
 * Output: public/samples/PhyCalcPro-tolerance-demo-package.zip
 */
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "samples");

function drawingPdf({
  drawingNumber,
  title,
  revision,
  lines,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Border
  doc.setLineWidth(0.4);
  doc.rect(10, 10, w - 20, h - 20);

  // Title block
  doc.rect(w - 90, h - 45, 80, 35);
  doc.setFontSize(9);
  doc.text("PhyCalcPro DEMO DRAWING — not for manufacture", 14, 18);
  doc.setFontSize(14);
  doc.text(title, 14, 28);
  doc.setFontSize(10);
  doc.text(`Drawing: ${drawingNumber}`, w - 88, h - 38);
  doc.text(`Rev: ${revision}`, w - 88, h - 32);
  doc.text("Units: mm", w - 88, h - 26);
  doc.text("Material: Steel", w - 88, h - 20);
  doc.text("Sheet 1 of 1", w - 88, h - 14);

  // Simple outline sketch
  doc.setLineWidth(0.6);
  doc.rect(40, 50, 80, 40);
  doc.line(40, 70, 120, 70);
  doc.circle(80, 70, 8);

  doc.setFontSize(9);
  let y = 105;
  for (const line of lines) {
    doc.text(line, 14, y);
    y += 6;
    if (y > h - 55) break;
  }

  return Buffer.from(doc.output("arraybuffer"));
}

const bomCsv = `Level,Parent Part,Part Number,Revision,Drawing,Qty,Description
0,,ASM-DEMO-1000,A,ASM-DEMO-1000.pdf,1,Demo Main Assembly
1,ASM-DEMO-1000,SA-SEAL-3100,A,SA-SEAL-3100.pdf,1,Seal Cartridge Subassembly
1,ASM-DEMO-1000,HOU-210,A,HOU-210.pdf,1,Housing
1,ASM-DEMO-1000,SHA-100,A,SHA-100.pdf,1,Shaft
2,SA-SEAL-3100,SLV-015,A,SLV-015.pdf,1,Sleeve
2,SA-SEAL-3100,SPC-020,A,SPC-020.pdf,1,Spacer
2,SA-SEAL-3100,RET-030,A,RET-030.pdf,1,Retainer
`;

const drawings = [
  {
    file: "ASM-DEMO-1000.pdf",
    drawingNumber: "ASM-DEMO-1000",
    title: "Main Assembly",
    revision: "A",
    lines: [
      "ASSEMBLY NOTES",
      "1. MAX GAP axial float at bearing seat: 0.30 mm",
      "2. Check shaft-to-housing CLEARANCE after SA-SEAL-3100 install",
      "3. Critical stack: SHA-100 length - HOU-210 bore depth - SA stack",
      "",
      "ICD / Functional:",
      "Axial endplay requirement: 0.05 to 0.30 mm",
      "",
      "Datums: A = housing mounting face",
    ],
  },
  {
    file: "SA-SEAL-3100.pdf",
    drawingNumber: "SA-SEAL-3100",
    title: "Seal Cartridge Subassembly",
    revision: "A",
    lines: [
      "SUBASSEMBLY NOTES",
      "1. MAX GAP endplay within cartridge: 0.15 mm",
      "2. Stack contributors: SLV-015 + SPC-020 + RET-030",
      "3. Axial CLEARANCE between sleeve shoulder and retainer",
      "",
      "Dimensions (reference):",
      "Cartridge overall length 28.00 +/- 0.05",
      "",
      "Datums: A = sleeve face, B = retainer ID",
    ],
  },
  {
    file: "HOU-210.pdf",
    drawingNumber: "HOU-210",
    title: "Housing",
    revision: "A",
    lines: [
      "COMPONENT — HOUSING",
      "Bore depth (axial) 40.00 +0.10 / -0.00",
      "Bore diameter 52.00 H7",
      "Mounting face flatness 0.05",
      "",
      "|POS| dia 0.05 M | A |   (position of bore @ MMC)",
      "Datum A: mounting face",
      "",
      "Note: Housing length contributes (-) sense in assembly stack",
    ],
  },
  {
    file: "SHA-100.pdf",
    drawingNumber: "SHA-100",
    title: "Shaft",
    revision: "A",
    lines: [
      "COMPONENT — SHAFT",
      "Overall length 65.00 +/- 0.05",
      "Shoulder-to-end axial length 42.00 +/- 0.03",
      "Journal diameter 20.00 g6",
      "",
      "|POS| dia 0.04 M | A | B |   (journal position @ MMC)",
      "Datum A: shoulder face",
      "Datum B: axis",
      "",
      "Note: Shaft length contributes (+) sense in assembly stack",
    ],
  },
  {
    file: "SLV-015.pdf",
    drawingNumber: "SLV-015",
    title: "Sleeve",
    revision: "A",
    lines: [
      "COMPONENT — SLEEVE (SA-SEAL-3100 child)",
      "Axial length 12.00 +/- 0.02",
      "ID 20.00 H7",
      "OD 28.00 +/- 0.05",
      "",
      "|PERP| 0.03 | A |",
      "Datum A: sleeve face",
    ],
  },
  {
    file: "SPC-020.pdf",
    drawingNumber: "SPC-020",
    title: "Spacer",
    revision: "A",
    lines: [
      "COMPONENT — SPACER (SA-SEAL-3100 child)",
      "Thickness (axial) 8.00 +/- 0.015",
      "ID 20.50 +/- 0.10",
      "OD 27.50 +/- 0.10",
      "",
      "Parallelism 0.02 | A |",
      "Datum A: spacer face",
    ],
  },
  {
    file: "RET-030.pdf",
    drawingNumber: "RET-030",
    title: "Retainer",
    revision: "A",
    lines: [
      "COMPONENT — RETAINER (SA-SEAL-3100 child)",
      "Axial height 6.00 +/- 0.02",
      "Groove depth 1.50 +/- 0.05",
      "OD 30.00 +/- 0.05",
      "",
      "|POS| dia 0.06 | A |",
      "Datum A: retainer face",
      "",
      "Note: Use in SA endplay stack with sleeve + spacer",
    ],
  },
];

async function main() {
  await mkdir(outDir, { recursive: true });

  const zip = new JSZip();
  zip.file("BOM.csv", bomCsv);

  for (const d of drawings) {
    const pdf = drawingPdf({
      drawingNumber: d.drawingNumber,
      title: d.title,
      revision: d.revision,
      lines: d.lines,
    });
    zip.file(d.file, pdf);
    // Also write loose PDFs for inspection
    await writeFile(path.join(outDir, d.file), pdf);
  }

  await writeFile(path.join(outDir, "BOM.csv"), bomCsv);

  const zipBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const zipPath = path.join(outDir, "PhyCalcPro-tolerance-demo-package.zip");
  await writeFile(zipPath, zipBuf);

  console.log(`Wrote ${zipPath}`);
  console.log(`Parts: ${drawings.length} PDFs + BOM.csv`);
  console.log("Upload this ZIP on /products/manufacturing/tolerance");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
