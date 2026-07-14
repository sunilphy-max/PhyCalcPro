"use client";

import type { PlainBearingResult } from "@/lib/machine/plain-bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { fromBase } from "@/lib/units/conversions";
import ModuleDesignSummaryPanel, {
  type DesignSummaryRow,
} from "@/components/machine/bearings-shared/ModuleDesignSummaryPanel";

type Props = {
  preview: PlainBearingResult | null;
  lengthUnit: string;
  committed?: boolean;
};

export default function PlainBearingDesignSummaryPanel({
  preview,
  lengthUnit,
  committed = false,
}: Props) {
  if (!preview) {
    return (
      <ModuleDesignSummaryPanel
        empty
        committed={committed}
        emptyMessage="Enter load, speed, and geometry — this panel updates continuously."
        rows={[]}
      />
    );
  }

  const overall =
    preview.designStatus === "safe"
      ? { status: "ok" as const, label: "PASS" }
      : preview.designStatus === "warning"
        ? { status: "warn" as const, label: "MARGINAL" }
        : { status: "fail" as const, label: "FAIL" };

  const filmOk = preview.minFilmThickness > 5e-6;
  const loadOk = (preview.specificLoadPa ?? preview.unitLoad ?? 0) < 3.5e6;

  const rows: DesignSummaryRow[] = [
    {
      label: "Bearing Type",
      value: preview.bearingType.replace(/_/g, " "),
      status: "ok",
    },
    {
      label: "Film h_min",
      value: `${formatDisplayNumber(fromBase(preview.minFilmThickness, "length", lengthUnit))} ${lengthUnit}`,
      status: filmOk ? (preview.minFilmThickness > 10e-6 ? "ok" : "warn") : "fail",
    },
    {
      label: "Sommerfeld",
      value: formatDisplayNumber(preview.sommerfeldNumber),
      status: preview.sommerfeldNumber > 0 ? "ok" : "neutral",
    },
    {
      label: "Eccentricity",
      value:
        preview.bearingType === "journal"
          ? formatDisplayNumber(preview.eccentricityRatio)
          : "—",
      status:
        preview.bearingType === "journal"
          ? preview.eccentricityRatio > 0.85
            ? "fail"
            : preview.eccentricityRatio > 0.7
              ? "warn"
              : "ok"
          : "neutral",
    },
    {
      label: "Specific load",
      value:
        preview.specificLoadPa != null || preview.unitLoad != null
          ? `${formatDisplayNumber(((preview.specificLoadPa ?? preview.unitLoad)! / 1e6))} MPa`
          : "—",
      status: loadOk ? "ok" : "fail",
    },
    {
      label: "Outlet T",
      value: preview.outletTempC != null ? `${formatDisplayNumber(preview.outletTempC)} °C` : "—",
      status:
        preview.outletTempC == null
          ? "neutral"
          : preview.outletTempC > 120
            ? "fail"
            : preview.outletTempC > 95
              ? "warn"
              : "ok",
    },
    { label: "Status", value: overall.label, status: overall.status },
  ];

  return (
    <ModuleDesignSummaryPanel
      rows={rows}
      committed={committed}
      footer={preview.status}
    />
  );
}
