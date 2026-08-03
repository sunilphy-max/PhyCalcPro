import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";

// Load TS module via dynamic import through tsx-less path: call polyfill + pdfjs like the app.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "..", "public", "samples", "SHA-100.pdf");

// Inline the same polyfill contract
class DomMatrixStub {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true; isIdentity = true;
  constructor(init) {
    if (Array.isArray(init) && init.length >= 6) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      this.m11 = this.a; this.m12 = this.b; this.m21 = this.c;
      this.m22 = this.d; this.m41 = this.e; this.m42 = this.f;
    }
  }
  multiplySelf() { return this; }
  preMultiplySelf() { return this; }
  invertSelf() { return this; }
  translate() { return this; }
  scale() { return this; }
}
globalThis.DOMMatrix ??= DomMatrixStub;
globalThis.Path2D ??= class Path2D { addPath() {} };
globalThis.ImageData ??= class ImageData {
  constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
};

console.log("DOMMatrix after polyfill:", typeof globalThis.DOMMatrix);

const require = createRequire(import.meta.url);
const worker = pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.worker.min.mjs")).href;
const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");
GlobalWorkerOptions.workerSrc = worker;

const data = new Uint8Array(await readFile(pdfPath));
const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false, disableWorker: true }).promise;
const page = await doc.getPage(1);
const text = await page.getTextContent();
console.log("OK pages=", doc.numPages, "textItems=", text.items.length);
console.log(
  "sample:",
  text.items
    .filter((i) => i.str)
    .slice(0, 4)
    .map((i) => i.str)
    .join(" | ")
);
