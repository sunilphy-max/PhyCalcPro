/**
 * pdfjs-dist references DOMMatrix / Path2D / ImageData at module init.
 * Node (and some worker contexts) lack these — stub enough for text extract
 * and to avoid "DOMMatrix is not defined" crashes. Not a full geometry engine.
 */

type GlobalWithDom = typeof globalThis & {
  DOMMatrix?: unknown;
  Path2D?: unknown;
  ImageData?: unknown;
};

class DomMatrixStub {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  m11 = 1;
  m12 = 0;
  m13 = 0;
  m14 = 0;
  m21 = 0;
  m22 = 1;
  m23 = 0;
  m24 = 0;
  m31 = 0;
  m32 = 0;
  m33 = 1;
  m34 = 0;
  m41 = 0;
  m42 = 0;
  m43 = 0;
  m44 = 1;
  is2D = true;
  isIdentity = true;

  constructor(init?: number[] | string) {
    if (Array.isArray(init) && init.length >= 6) {
      const [a, b, c, d, e, f] = init;
      this.a = a ?? 1;
      this.b = b ?? 0;
      this.c = c ?? 0;
      this.d = d ?? 1;
      this.e = e ?? 0;
      this.f = f ?? 0;
      this.m11 = this.a;
      this.m12 = this.b;
      this.m21 = this.c;
      this.m22 = this.d;
      this.m41 = this.e;
      this.m42 = this.f;
      this.isIdentity = false;
    }
  }

  multiplySelf() {
    return this;
  }
  preMultiplySelf() {
    return this;
  }
  invertSelf() {
    return this;
  }
  translate() {
    return this;
  }
  scale() {
    return this;
  }
  rotate() {
    return this;
  }
  transformPoint(p: unknown) {
    return p;
  }
  toFloat64Array() {
    return new Float64Array([
      this.m11,
      this.m12,
      this.m13,
      this.m14,
      this.m21,
      this.m22,
      this.m23,
      this.m24,
      this.m31,
      this.m32,
      this.m33,
      this.m34,
      this.m41,
      this.m42,
      this.m43,
      this.m44,
    ]);
  }
}

class Path2DStub {
  addPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}
}

class ImageDataStub {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(widthOrData: number | Uint8ClampedArray, height?: number) {
    if (typeof widthOrData === "number") {
      this.width = widthOrData;
      this.height = height ?? 0;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = widthOrData;
      this.width = height ?? 0;
      this.height = 0;
    }
  }
}

/** Idempotent — safe to call from client or server before importing pdfjs-dist. */
export function ensurePdfJsDomPolyfills(): void {
  const g = globalThis as GlobalWithDom;
  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = DomMatrixStub;
  }
  if (typeof g.Path2D === "undefined") {
    g.Path2D = Path2DStub;
  }
  if (typeof g.ImageData === "undefined") {
    g.ImageData = ImageDataStub;
  }
}
