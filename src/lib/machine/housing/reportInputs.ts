import type { ReportRow } from "@/lib/export/reportPayload";
import type { HousingMountStyle } from "./types";

export type HousingReportInputContext = {
  boreDiameter: number;
  radialLoad: number;
  axialLoad: number;
  speed: number;
  mountStyle: HousingMountStyle;
  boltCount: number;
  boltCircleDiameter: number;
  yieldStress: number;
  lengthUnit: string;
  forceUnit: string;
  stressUnit: string;
};

const MOUNT_LABELS: Record<HousingMountStyle, string> = {
  pillow_block: "Pillow block",
  flange: "Flange",
  foot: "Foot mount",
};

export function buildHousingReportInputRows(ctx: HousingReportInputContext): ReportRow[] {
  return [
    { parameter: "Bore diameter", value: String(ctx.boreDiameter), unit: ctx.lengthUnit },
    { parameter: "Radial load", value: String(ctx.radialLoad), unit: ctx.forceUnit },
    { parameter: "Axial load", value: String(ctx.axialLoad), unit: ctx.forceUnit },
    { parameter: "Speed", value: String(ctx.speed), unit: "RPM" },
    { parameter: "Mount style", value: MOUNT_LABELS[ctx.mountStyle] },
    { parameter: "Bolt count", value: String(ctx.boltCount) },
    { parameter: "Bolt circle diameter", value: String(ctx.boltCircleDiameter), unit: ctx.lengthUnit },
    { parameter: "Housing yield stress", value: String(ctx.yieldStress), unit: ctx.stressUnit },
  ];
}
