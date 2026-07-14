"use client";

import type { HousingResult } from "@/lib/machine/housing/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import ModuleDesignSummaryPanel, {
  type DesignSummaryRow,
} from "@/components/machine/bearings-shared/ModuleDesignSummaryPanel";

type Props = {
  preview: HousingResult | null;
  committed?: boolean;
};

export default function HousingDesignSummaryPanel({ preview, committed = false }: Props) {
  if (!preview) {
    return (
      <ModuleDesignSummaryPanel
        empty
        committed={committed}
        emptyMessage="Enter bore, loads, and mount style — this panel updates continuously."
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

  const rows: DesignSummaryRow[] = [
    {
      label: "Mount",
      value: preview.housingSku ?? "Screening geometry",
      status: preview.housingSku ? "ok" : "neutral",
    },
    {
      label: "Body SF",
      value: formatDisplayNumber(preview.bodySafetyFactor),
      status:
        preview.bodySafetyFactor < 1 ? "fail" : preview.bodySafetyFactor < 1.5 ? "warn" : "ok",
    },
    {
      label: "Bolt T",
      value: `${formatDisplayNumber(preview.boltTensionPerBolt / 1000)} kN`,
      status: "ok",
    },
    {
      label: "Bolt V",
      value: `${formatDisplayNumber(preview.boltShearPerBolt / 1000)} kN`,
      status: "ok",
    },
    {
      label: "Deflection",
      value: `${formatDisplayNumber(preview.housingDeflection * 1000)} mm`,
      status: preview.housingDeflection > 0.05e-3 ? "warn" : "ok",
    },
    {
      label: "Fits",
      value: `${preview.recommendedShaftFit} / ${preview.recommendedHousingFit}`,
      status: "ok",
    },
    { label: "Status", value: overall.label, status: overall.status },
  ];

  return (
    <ModuleDesignSummaryPanel
      rows={rows}
      committed={committed}
      footer={`${preview.governingFailureMode} · bolts ${preview.recommendedBoltSize}`}
    />
  );
}
