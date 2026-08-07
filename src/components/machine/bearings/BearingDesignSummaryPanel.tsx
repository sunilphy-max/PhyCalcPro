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

/** Context rail — type/catalog/duty. Pass/fail lives only in the Decision Strip. */
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
      status: "neutral",
    },
    { label: "Catalog", value: catalog, status: "neutral" },
  ];

  const footer =
    requiredLifeHours != null && requiredLifeHours > 0
      ? `Lnm ${formatDisplayNumber(preview.modifiedLife)} h · target ${formatDisplayNumber(requiredLifeHours)} h`
      : `Lnm ${formatDisplayNumber(preview.modifiedLife)} h · s₀ ${formatDisplayNumber(preview.staticSafetyFactor)}`;

  return (
    <ModuleDesignSummaryPanel rows={rows} footer={footer} committed={committed} />
  );
}
