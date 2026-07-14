import type { ReportRow } from "@/lib/export/reportPayload";
import type { LoadSpectrumUiStep } from "@/components/machine/bearings/BearingInputs";
import {
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
  SEAL_TYPE_LABELS,
} from "@/data/catalogs/bearingCatalog";
import type {
  BearingApplicationProfile,
  BearingArrangement,
  BearingManufacturer,
  BearingReliability,
  BearingSealType,
  BearingType,
  LubricantType,
} from "./types";
import type { ContaminationLevel } from "./iso281Life";
import { CONTAMINATION_EC } from "./iso281Life";

const A1_BY_RELIABILITY: Record<number, number> = {
  90: 1.0,
  95: 0.64,
  96: 0.55,
  97: 0.47,
  98: 0.37,
  99: 0.25,
};
export type BearingReportInputContext = {
  radialLoad: number;
  radialUnit: string;
  axialLoad: number;
  axialUnit: string;
  shockFactor: number;
  speed: number;
  lifeHours: number;
  lifeInputMode: "hours" | "revolutions";
  lifeRevolutions: number;
  safetyFactor: number;
  bearingType: BearingType;
  designation: string;
  manufacturer: BearingManufacturer;
  applicationProfile: BearingApplicationProfile | "all";
  arrangement: BearingArrangement;
  reliability: BearingReliability;
  lubricantType: LubricantType;
  isoVgGrade: number;
  operatingTempC: number;
  contamination: ContaminationLevel;
  sealFilter: BearingSealType | "all";
  useVariableLoad: boolean;
  loadSpectrumSteps: LoadSpectrumUiStep[];
  maxBoreMm: number | "";
  maxOuterMm: number | "";
};

export function buildBearingReportInputRows(ctx: BearingReportInputContext): ReportRow[] {
  const rows: ReportRow[] = [
    { parameter: "Radial load Fr", value: String(ctx.radialLoad), unit: ctx.radialUnit },
    { parameter: "Axial load Fa", value: String(ctx.axialLoad), unit: ctx.axialUnit },
    { parameter: "Shock factor Ks", value: String(ctx.shockFactor) },
    { parameter: "Speed n", value: String(ctx.speed), unit: "RPM" },
    {
      parameter: "Required life",
      value:
        ctx.lifeInputMode === "hours"
          ? String(ctx.lifeHours)
          : `${(ctx.lifeRevolutions / 1e6).toFixed(2)}`,
      unit: ctx.lifeInputMode === "hours" ? "h" : "M rev",
    },
    { parameter: "Life safety factor on C", value: String(ctx.safetyFactor) },
    { parameter: "Bearing type", value: BEARING_TYPE_LABELS[ctx.bearingType] },
    { parameter: "Designation", value: ctx.designation },
    { parameter: "Manufacturer", value: BEARING_MANUFACTURER_LABELS[ctx.manufacturer] },
    { parameter: "Application profile", value: ctx.applicationProfile },
    { parameter: "Arrangement", value: ctx.arrangement },
    {
      parameter: "Reliability factor a₁",
      value: String(A1_BY_RELIABILITY[ctx.reliability] ?? 1),
      unit: `${ctx.reliability}%`,
    },
    { parameter: "Lubricant", value: ctx.lubricantType },
  ];

  if (ctx.lubricantType !== "none") {
    rows.push(
      { parameter: "ISO VG @ 40 °C", value: String(ctx.isoVgGrade) },
      { parameter: "Operating temperature", value: String(ctx.operatingTempC), unit: "°C" },
      {
        parameter: "Contamination factor eC (ηc)",
        value: String(CONTAMINATION_EC[ctx.contamination]),
        unit: ctx.contamination,
      }
    );
  }

  if (ctx.sealFilter !== "all") {
    rows.push({ parameter: "Seal filter", value: SEAL_TYPE_LABELS[ctx.sealFilter] });
  }

  if (ctx.useVariableLoad) {
    ctx.loadSpectrumSteps.forEach((step, index) => {
      rows.push({
        parameter: `Load spectrum step ${index + 1}`,
        value: `${step.loadPercent}% load · ${step.durationPercent}% time`,
      });
    });
  }

  if (ctx.maxBoreMm !== "") {
    rows.push({ parameter: "Max bore", value: String(ctx.maxBoreMm), unit: "mm" });
  }
  if (ctx.maxOuterMm !== "") {
    rows.push({ parameter: "Max outer diameter", value: String(ctx.maxOuterMm), unit: "mm" });
  }

  return rows;
}
