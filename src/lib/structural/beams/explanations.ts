import type {
  BeamApplicationContext,
  BeamResult,
  BeamSupport,
  Load,
  SupportType,
} from "./types";

type ExplainArgs = {
  result: BeamResult;
  length: number;
  loads: Load[];
  supports: BeamSupport[];
  supportPreset?: SupportType | "continuous";
  materialName: string;
  yieldMPa?: number;
  applicationContext?: BeamApplicationContext;
  standards?: string[];
};

function almostEqual(a: number, b: number, tol = 1e-6) {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

export function buildBeamExplanations(args: ExplainArgs): string[] {
  const {
    result,
    length,
    loads,
    supports,
    materialName,
    yieldMPa,
    applicationContext,
    standards,
  } = args;
  const bullets: string[] = [];

  const maxMomentAbs = result.maxMoment;
  let maxMomentIndex = 0;
  let peak = -Infinity;
  result.moment.forEach((m, i) => {
    if (Math.abs(m) > peak) {
      peak = Math.abs(m);
      maxMomentIndex = i;
    }
  });
  const xM = result.x[maxMomentIndex] ?? length / 2;
  const mid = length / 2;
  const symmetricLoads =
    loads.length > 0 &&
    loads.every((l) => {
      if (l.type === "point") return almostEqual(l.position, mid, 0.02);
      if (l.type === "udl") {
        return almostEqual(l.start, 0, 0.02) && almostEqual(l.end, length, 0.02);
      }
      return false;
    });
  const twoEndSupports =
    supports.length === 2 &&
    almostEqual(Math.min(...supports.map((s) => s.x)), 0, 0.02) &&
    almostEqual(Math.max(...supports.map((s) => s.x)), length, 0.02);

  if (symmetricLoads && twoEndSupports && almostEqual(xM, mid, 0.05)) {
    bullets.push(
      `Maximum bending moment occurs near mid-span (x ≈ ${xM.toPrecision(3)}) because of load and support symmetry.`
    );
  } else if (supports.length >= 3) {
    bullets.push(
      `Peak |M| ≈ ${maxMomentAbs.toPrecision(4)} at x ≈ ${xM.toPrecision(3)}; intermediate supports redistribute moment relative to a single-span beam.`
    );
  } else {
    bullets.push(
      `Maximum |bending moment| ≈ ${maxMomentAbs.toPrecision(4)} occurs at x ≈ ${xM.toPrecision(3)} along the span.`
    );
  }

  const Mpeak = result.moment[maxMomentIndex] ?? 0;
  if (Mpeak >= 0) {
    bullets.push(
      "With the sagging-positive sign convention, maximum tensile stress occurs at the lower fiber at the peak-moment section."
    );
  } else {
    bullets.push(
      "Peak moment is hogging (negative); maximum tensile stress occurs at the upper fiber at that section."
    );
  }

  if (applicationContext) {
    const ratio = applicationContext.deflectionLimitRatio;
    const util = applicationContext.deflectionUtilization;
    const ok = util <= 1;
    bullets.push(
      `Deflection ${ok ? "satisfies" : "exceeds"} the L/${ratio} serviceability limit (utilization ${(util * 100).toFixed(1)}%).`
    );
    const stressOk = applicationContext.stressUtilization <= 1;
    const std =
      (standards && standards[0]) ||
      applicationContext.standards[0] ||
      "the active design basis";
    bullets.push(
      stressOk
        ? `Flexural stress check passes under ${std} screening (stress utilization ${(applicationContext.stressUtilization * 100).toFixed(1)}%).`
        : `Flexural stress check fails under ${std} screening (stress utilization ${(applicationContext.stressUtilization * 100).toFixed(1)}%).`
    );
  }

  if (yieldMPa != null && yieldMPa > 0) {
    bullets.push(`Material ${materialName}: Fy ≈ ${Math.round(yieldMPa)} MPa (E from catalog; not entered manually).`);
  }

  bullets.push(
    "Governing model: EI d⁴w/dx⁴ = q(x) (Euler–Bernoulli). Screening results are not a substitute for stamped engineering judgment."
  );

  return bullets;
}
