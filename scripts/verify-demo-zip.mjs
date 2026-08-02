import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Use dynamic import through tsx path resolution by spawning isn't available —
// parse BOM.csv + jszip listing instead for a lightweight check.
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zipPath = path.join(__dirname, "..", "public", "samples", "PhyCalcPro-tolerance-demo-package.zip");
const buf = await readFile(zipPath);
const zip = await JSZip.loadAsync(buf);
const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
console.log("ZIP entries:", names);
const bom = await zip.file("BOM.csv")?.async("string");
console.log("BOM present:", Boolean(bom));
console.log("BOM lines:", bom?.trim().split(/\r?\n/).length);
const pdfs = names.filter((n) => n.toLowerCase().endsWith(".pdf"));
console.log("PDF count:", pdfs.length);
if (!bom || pdfs.length < 7) process.exit(1);
console.log("OK");
