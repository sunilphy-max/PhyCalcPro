import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Inline fallback test (mirrors extractPdfText.ts)
function decodePdfString(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(Number.parseInt(oct, 8)))
    .replace(/\\(.)/g, "$1");
}
function stringsFromContent(content) {
  const out = [];
  const tj = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
  let m;
  while ((m = tj.exec(content))) {
    const s = decodePdfString(m[1] ?? "").trim();
    if (s) out.push(s);
  }
  return out;
}

const pdfPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "samples",
  "SHA-100.pdf"
);
const buf = await readFile(pdfPath);
const raw = buf.toString("latin1");
const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
const texts = [];
let sm;
while ((sm = streamRe.exec(raw))) {
  const strings = stringsFromContent(sm[1] ?? "");
  if (strings.length) texts.push(strings.join(" "));
}
console.log("pages/chunks", texts.length);
console.log("preview:", texts[0]?.slice(0, 200));
if (!texts.length) process.exit(1);
