import type { ReportRow } from "@/lib/export/reportPayload";
import type { PlainBearingType } from "./types";

export type PlainBearingReportInputContext = {
  bearingType: PlainBearingType;
  load: number;
  loadUnit: string;
  speed: number;
  diameter: number;
  length: number;
  clearance: number;
  lengthUnit: string;
  viscosity: number;
  padDiameterRatio?: number;
  padCount?: number;
};

const TYPE_LABELS: Record<PlainBearingType, string> = {
  journal: "Journal (ISO 7902)",
  thrust_pad: "Thrust pad (ISO 12131)",
  tilting_pad: "Tilting pad (ISO 12130)",
};

export function buildPlainBearingReportInputRows(
  ctx: PlainBearingReportInputContext
): ReportRow[] {
  const rows: ReportRow[] = [
    { parameter: "Bearing type", value: TYPE_LABELS[ctx.bearingType] },
    { parameter: "Load", value: String(ctx.load), unit: ctx.loadUnit },
    { parameter: "Speed", value: String(ctx.speed), unit: "RPM" },
    { parameter: "Diameter", value: String(ctx.diameter), unit: ctx.lengthUnit },
    { parameter: "Length", value: String(ctx.length), unit: ctx.lengthUnit },
    { parameter: "Clearance", value: String(ctx.clearance), unit: ctx.lengthUnit },
    { parameter: "Dynamic viscosity", value: String(ctx.viscosity), unit: "Pa·s" },
  ];
  if (ctx.bearingType !== "journal") {
    if (ctx.padDiameterRatio != null) {
      rows.push({ parameter: "Pad diameter ratio", value: String(ctx.padDiameterRatio) });
    }
    if (ctx.padCount != null) {
      rows.push({ parameter: "Pad count", value: String(ctx.padCount) });
    }
  }
  return rows;
}
