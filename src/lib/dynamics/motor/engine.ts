import type { MotorConfig, MotorResult, MotorServiceClass } from "./types";

/** Indicative NEMA/IEC frame bands from shaft power (kW) at ≤1800 rpm. */
const FRAME_BANDS: { maxKw: number; nema: string; iec: string }[] = [
  { maxKw: 0.75, nema: "56", iec: "63" },
  { maxKw: 1.5, nema: "56", iec: "71" },
  { maxKw: 3.7, nema: "143T", iec: "80" },
  { maxKw: 7.5, nema: "182T", iec: "90L" },
  { maxKw: 15, nema: "213T", iec: "112M" },
  { maxKw: 22, nema: "254T", iec: "132M" },
  { maxKw: 37, nema: "284T", iec: "160M" },
  { maxKw: 55, nema: "324T", iec: "180M" },
  { maxKw: 75, nema: "326T", iec: "200L" },
  { maxKw: 110, nema: "364T", iec: "225M" },
  { maxKw: 150, nema: "404T", iec: "250M" },
  { maxKw: Infinity, nema: "445T", iec: "280M" },
];

function serviceFactorForClass(serviceClass: MotorServiceClass): number {
  if (serviceClass === "intermittent") return 1.15;
  if (serviceClass === "short_time") return 1.25;
  return 1.1;
}

function slipPercentForPoles(poles: number, serviceClass: MotorServiceClass): number {
  const base = poles <= 2 ? 2.5 : poles <= 4 ? 3 : poles <= 6 ? 4 : 5;
  const dutyBump = serviceClass === "short_time" ? 0.5 : serviceClass === "intermittent" ? 0.25 : 0;
  return base + dutyBump;
}

function lookupFrame(powerKw: number, synchronousRpm: number): { nema: string; iec: string; label: string } {
  const speedFactor = synchronousRpm > 1800 ? 0.85 : 1;
  const adjustedKw = powerKw / speedFactor;
  for (const band of FRAME_BANDS) {
    if (adjustedKw <= band.maxKw) {
      return { nema: band.nema, iec: band.iec, label: `NEMA ${band.nema} / IEC ${band.iec}` };
    }
  }
  const last = FRAME_BANDS[FRAME_BANDS.length - 1]!;
  return { nema: last.nema, iec: last.iec, label: `NEMA ${last.nema} / IEC ${last.iec}` };
}

export function solveMotorEngine(config: MotorConfig): MotorResult {
  const poles = Math.max(2, Math.min(12, Math.round(config.poles)));
  const polesEven = poles % 2 === 0 ? poles : poles + 1;
  const syncRpm = (120 * config.lineFrequencyHz) / polesEven;
  const slip = slipPercentForPoles(polesEven, config.serviceClass);
  const ratedRpm = syncRpm * (1 - slip / 100);
  const omega = (ratedRpm * 2 * Math.PI) / 60;
  const ratedTorque = omega > 0 ? config.power / omega : 0;
  const startingTorque = ratedTorque * Math.max(1, config.startingTorqueFactor);
  const efficiency = Math.max(0.5, Math.min(0.99, config.efficiency));
  const powerFactor = Math.max(0.5, Math.min(1, config.powerFactor));
  const electricalPower = config.power / efficiency;
  const apparentPower = electricalPower / powerFactor;
  const powerKw = config.power / 1000;
  const frame = lookupFrame(powerKw, syncRpm);
  const serviceFactor = serviceFactorForClass(config.serviceClass);

  const thermalMarginOk =
    config.serviceClass === "continuous"
      ? powerKw <= 75
      : config.serviceClass === "intermittent"
        ? powerKw <= 110
        : powerKw <= 150;

  const torqueMarginOk = startingTorque <= ratedTorque * 3;
  const isSafe = thermalMarginOk && torqueMarginOk && ratedTorque > 0;
  const designStatus: MotorResult["designStatus"] = !isSafe
    ? "critical"
    : slip > 6 || efficiency < 0.75
      ? "warning"
      : "safe";

  return {
    synchronousSpeedRpm: syncRpm,
    ratedSpeedRpm: ratedRpm,
    slipPercent: slip,
    ratedTorque,
    startingTorque,
    electricalPower,
    apparentPower,
    frameClass: frame.label,
    nemaFrame: frame.nema,
    iecFrame: frame.iec,
    serviceFactor,
    thermalMarginOk,
    isSafe,
    designStatus,
    governingFailureMode: !thermalMarginOk
      ? "Thermal duty exceeds indicative frame class"
      : !torqueMarginOk
        ? "Starting torque factor unusually high"
        : "Rated operation",
  };
}

/** Auto-design: pick pole count with best torque margin at required power. */
export function designMotorPoles(
  power: number,
  lineFrequencyHz: 50 | 60,
  serviceClass: MotorServiceClass,
  startingTorqueFactor: number,
  efficiency: number,
  powerFactor: number
): { best: MotorResult & { poles: number } | null; ranked: (MotorResult & { poles: number })[] } {
  const poleOptions = [2, 4, 6, 8];
  const ranked = poleOptions.map((poles) => {
    const res = solveMotorEngine({
      power,
      poles,
      lineFrequencyHz,
      serviceClass,
      startingTorqueFactor,
      efficiency,
      powerFactor,
    });
    const util =
      res.designStatus === "safe" ? 0.65 : res.designStatus === "warning" ? 0.9 : 1.35;
    return { ...res, poles, utilization: util };
  });
  ranked.sort((a, b) => a.utilization - b.utilization);
  const best = ranked[0] ?? null;
  return { best, ranked };
}
