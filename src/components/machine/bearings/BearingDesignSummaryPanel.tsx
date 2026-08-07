"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import {
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
  type BearingManufacturer,
} from "@/data/catalogs/bearingCatalog";
import ModuleDesignSummaryPanel, {
  type DesignSummaryRow,
} from "@/components/machine/bearings-shared/ModuleDesignSummaryPanel";

type Props = {
  preview: BearingResult | null;
  manufacturer?: BearingManufacturer;
  requiredLifeHours?: number;
  committed?: boolean;
};

/** Thin status rail — detailed Lnm / s₀ live in the results Decision Strip. */
export default function BearingDesignSummaryPanel({
  preview,
  manufacturer,
  requiredLifeHours,
  committed = false,
}: Props) {
  if (!preview) {
    return (
      <ModuleDesignSummaryPanel
        empty
        committed={committed}
        emptyMessage="Enter loads, speed, and a catalog designation — this panel updates continuously."
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

  const oem =
    manufacturer && BEARING_MANUFACTURER_LABELS[manufacturer]
      ? BEARING_MANUFACTURER_LABELS[manufacturer]
      : "";
  const catalog =
    preview.designation != null && preview.designation.trim()
      ? `${oem ? `${oem} ` : ""}${preview.designation}`
      : "—";

  const rows: DesignSummaryRow[] = [
    {
      label: "Type",
      value: BEARING_TYPE_LABELS[preview.bearingType] ?? preview.bearingType,
      status: "ok",
    },
    { label: "Catalog", value: catalog, status: preview.designation ? "ok" : "neutral" },
    { label: "Status", value: overall.label, status: overall.status },
  ];

  const footer =
    requiredLifeHours != null && requiredLifeHours > 0
      ? `Lnm ${formatDisplayNumber(preview.modifiedLife)} h · L_req ${formatDisplayNumber(requiredLifeHours)} h · see Decision Strip`
      : `Lnm ${formatDisplayNumber(preview.modifiedLife)} h · s₀ ${formatDisplayNumber(preview.staticSafetyFactor)} · see Decision Strip`;

  return (
    <ModuleDesignSummaryPanel rows={rows} footer={footer} committed={committed} />
  );
}
