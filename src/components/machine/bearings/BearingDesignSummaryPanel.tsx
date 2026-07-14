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

function lifeSf(result: BearingResult): number | null {
  if (result.lifeSafetyFactor != null && result.lifeSafetyFactor > 0) {
    return result.lifeSafetyFactor;
  }
  if (result.lifeUtilization > 0 && Number.isFinite(result.lifeUtilization)) {
    return 1 / result.lifeUtilization;
  }
  return null;
}

/** Persistent Design Summary for rolling bearings (shared rail chrome). */
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

  const sf = lifeSf(preview);
  const loads =
    preview.dynamicUtilization > 1 || preview.staticSafetyFactor < 1
      ? { status: "fail" as const, label: "Overloaded" }
      : preview.dynamicUtilization > 0.85 || preview.staticSafetyFactor < 1.2
        ? { status: "warn" as const, label: "Marginal" }
        : { status: "ok" as const, label: "Acceptable" };

  const iso =
    preview.designStatus === "critical" || preview.lifeUtilization > 1
      ? { status: "fail" as const, label: "FAIL" }
      : preview.designStatus === "warning" || preview.lifeUtilization > 0.85
        ? { status: "warn" as const, label: "MARGINAL" }
        : { status: "ok" as const, label: "PASS" };

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
      label: "Bearing Type",
      value: BEARING_TYPE_LABELS[preview.bearingType] ?? preview.bearingType,
      status: "ok",
    },
    { label: "Loads", value: loads.label, status: loads.status },
    {
      label: "Life",
      value: `${formatDisplayNumber(preview.modifiedLife)} h`,
      status:
        sf != null && sf < 1 ? "fail" : sf != null && sf < 1.2 ? "warn" : preview.modifiedLife > 0 ? "ok" : "neutral",
    },
    {
      label: "Safety",
      value: sf != null ? formatDisplayNumber(sf) : "—",
      status: sf != null && sf < 1 ? "fail" : sf != null && sf < 1.2 ? "warn" : sf != null ? "ok" : "neutral",
    },
    { label: "ISO 281", value: iso.label, status: iso.status },
    { label: "Catalog", value: catalog, status: preview.designation ? "ok" : "neutral" },
    { label: "Status", value: overall.label, status: overall.status },
  ];

  const footer =
    requiredLifeHours != null && requiredLifeHours > 0
      ? `L_req ${formatDisplayNumber(requiredLifeHours)} h · P/C ${formatDisplayNumber(preview.dynamicUtilization)} · s₀ ${formatDisplayNumber(preview.staticSafetyFactor)}`
      : `P/C ${formatDisplayNumber(preview.dynamicUtilization)} · s₀ ${formatDisplayNumber(preview.staticSafetyFactor)}`;

  return (
    <ModuleDesignSummaryPanel rows={rows} footer={footer} committed={committed} />
  );
}
