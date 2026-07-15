"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Wand2 } from "lucide-react";
import CalculatorInputSteps from "@/components/machine/bearings-shared/CalculatorInputSteps";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import {
  calculatorFieldLabelClass,
  calculatorInputGridClass,
  calculatorNumberInputClass,
} from "@/components/calculator/styles";
import BearingMountingSystem, {
  type BearingMountingSystemId,
} from "@/components/machine/bearings/BearingMountingSystem";
import { sizeLocatingFloatingStations } from "@/lib/machine/bearings/systemSizing";
import type { BearingConfig, BearingType } from "@/lib/machine/bearings/types";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { Box, Gauge, Layers, Ruler, Thermometer } from "lucide-react";

const WIZARD_STEPS = [
  {
    id: "layout",
    label: "Layout",
    description: "Locating + floating or duplex mounting",
    icon: Layers,
  },
  {
    id: "loads",
    label: "Loads",
    description: "Per-station radial reactions and axial thrust",
    icon: Box,
  },
  {
    id: "size",
    label: "Size both",
    description: "Catalog sizing for locating and floating stations",
    icon: Ruler,
  },
  {
    id: "thermal",
    label: "Thermal",
    description: "Expansion float check over bearing span",
    icon: Thermometer,
  },
  {
    id: "apply",
    label: "Apply",
    description: "Review and write values to the form",
    icon: Gauge,
  },
];

export type BearingSystemWizardValues = {
  mountingSystem: BearingMountingSystemId;
  designation: string;
  floatingDesignation: string;
  stationRadialLoadsN: number[];
  axialLoad: number;
  bearingSpanMm: number;
  availableFloatMm: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  values: BearingSystemWizardValues;
  sizingConfig: BearingConfig;
  manufacturer: string;
  onApply: (values: BearingSystemWizardValues) => void;
  onMountingSystemChange: (id: BearingMountingSystemId) => void;
  onSuggestBearingType?: (type: BearingType) => void;
};

function mountingToEngineTypes(id: BearingMountingSystemId): {
  locatingType: BearingType;
  floatingType: BearingType;
} {
  if (id === "locating_ac_floating_nu") {
    return { locatingType: "angular_contact", floatingType: "cylindrical_roller" };
  }
  if (id === "locating_dg_floating_nu") {
    return { locatingType: "deep_groove", floatingType: "cylindrical_roller" };
  }
  return { locatingType: "angular_contact", floatingType: "cylindrical_roller" };
}

export default function BearingSystemWizard({
  open,
  onClose,
  values,
  sizingConfig,
  manufacturer,
  onApply,
  onMountingSystemChange,
  onSuggestBearingType,
}: Props) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const isLocatingFloating =
    draft.mountingSystem === "locating_dg_floating_nu" ||
    draft.mountingSystem === "locating_ac_floating_nu";

  const sizedStations = useMemo(() => {
    if (!isLocatingFloating) return null;
    const { locatingType, floatingType } = mountingToEngineTypes(draft.mountingSystem);
    const stationConfig: BearingConfig = {
      ...sizingConfig,
      radialLoad: draft.stationRadialLoadsN[0]! + draft.stationRadialLoadsN[1]!,
      axialLoad: draft.axialLoad,
      stationRadialLoadsN: draft.stationRadialLoadsN,
      bearingSpanMm: draft.bearingSpanMm,
      availableFloatMm: draft.availableFloatMm,
      designation: draft.designation,
      floatingDesignation: draft.floatingDesignation || undefined,
    };
    try {
      return sizeLocatingFloatingStations({
        config: stationConfig,
        locatingType,
        floatingType,
        locatingDesignation: draft.designation,
        floatingDesignation: draft.floatingDesignation || undefined,
        a1: 1,
        aIso: 1,
        tempFactor: 1,
        criteriaBase: {
          manufacturer: sizingConfig.manufacturer,
          applicationProfile: sizingConfig.applicationProfile,
          speedRpm: sizingConfig.speed,
          boreMaxMm: sizingConfig.boreMm,
        },
      });
    } catch {
      return null;
    }
  }, [draft, isLocatingFloating, sizingConfig]);

  const thermalNote = useMemo(() => {
    const deltaT = 40;
    const alpha = 12e-6;
    const growth = alpha * draft.bearingSpanMm * deltaT;
    const margin = draft.availableFloatMm - growth;
    if (margin < 0) {
      return `Required float ${growth.toFixed(2)} mm exceeds available ${draft.availableFloatMm} mm — increase NU axial play or shorten span.`;
    }
    if (margin < 0.3) {
      return `Thermal growth ~${growth.toFixed(2)} mm over ${draft.bearingSpanMm} mm span — float margin ${margin.toFixed(2)} mm is marginal.`;
    }
    return `Thermal growth ~${growth.toFixed(2)} mm; float margin ${margin.toFixed(2)} mm over ${draft.availableFloatMm} mm available.`;
  }, [draft.bearingSpanMm, draft.availableFloatMm]);

  if (!open) return null;

  const updateStationLoad = (index: number, value: number) => {
    const next = [...draft.stationRadialLoadsN];
    next[index] = value;
    setDraft({ ...draft, stationRadialLoadsN: next });
  };

  const handleApply = () => {
    const next = { ...draft };
    if (sizedStations?.[0]?.designation) next.designation = sizedStations[0].designation;
    if (sizedStations?.[1]?.designation) next.floatingDesignation = sizedStations[1].designation;
    onApply(next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bearing-system-wizard-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700/60 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-cyan-600" aria-hidden />
            <h2 id="bearing-system-wizard-title" className="text-sm font-semibold text-slate-900 dark:text-white">
              Bearing system wizard
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wizard"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <CalculatorInputSteps steps={WIZARD_STEPS} ariaLabel="Bearing system wizard steps">
            {(activeTab) => {
              switch (activeTab) {
                case "layout":
                  return (
                    <CalculatorFormSection
                      title="Shaft layout"
                      description="Choose locating + floating pair or duplex angular contact."
                    >
                      <BearingMountingSystem
                        value={draft.mountingSystem}
                        onChange={(id) => {
                          setDraft({ ...draft, mountingSystem: id });
                          onMountingSystemChange(id);
                        }}
                        onSuggestType={onSuggestBearingType}
                      />
                    </CalculatorFormSection>
                  );

                case "loads":
                  return (
                    <div className="space-y-4">
                      <CalculatorFormSection
                        title="Station radial loads"
                        description="Fr₀ at locating end, Fr₁ at floating end (N)."
                      >
                        <div className={calculatorInputGridClass}>
                          <CalculatorUnitField
                            label="Fr₀ locating (N)"
                            value={draft.stationRadialLoadsN[0] ?? 0}
                            onChange={(v) => updateStationLoad(0, v)}
                            unit={<span className="text-sm text-slate-500">N</span>}
                          />
                          <CalculatorUnitField
                            label="Fr₁ floating (N)"
                            value={draft.stationRadialLoadsN[1] ?? 0}
                            onChange={(v) => updateStationLoad(1, v)}
                            unit={<span className="text-sm text-slate-500">N</span>}
                          />
                        </div>
                      </CalculatorFormSection>

                      <CalculatorFormSection title="Axial thrust">
                        <div className={calculatorInputGridClass}>
                          <CalculatorUnitField
                            label="Fa axial (N)"
                            value={draft.axialLoad}
                            onChange={(v) => setDraft({ ...draft, axialLoad: v })}
                            unit={<span className="text-sm text-slate-500">N</span>}
                          />
                        </div>
                        <p className="mt-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-2.5 py-1.5 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                          Fa is not from planar shaft FEM — verify thrust direction and magnitude for the
                          locating bearing.
                        </p>
                      </CalculatorFormSection>

                      <CalculatorFormSection title="Span & float">
                        <div className={calculatorInputGridClass}>
                          <CalculatorUnitField
                            label="Bearing span L"
                            value={draft.bearingSpanMm}
                            onChange={(v) => setDraft({ ...draft, bearingSpanMm: v })}
                            min={0}
                            unit={<span className="text-sm text-slate-500">mm</span>}
                          />
                          <CalculatorUnitField
                            label="Available float"
                            value={draft.availableFloatMm}
                            onChange={(v) => setDraft({ ...draft, availableFloatMm: v })}
                            min={0}
                            unit={<span className="text-sm text-slate-500">mm</span>}
                          />
                        </div>
                      </CalculatorFormSection>
                    </div>
                  );

                case "size":
                  if (!isLocatingFloating) {
                    return (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Duplex angular systems use the Operating → arrangement step. Select a locating +
                        floating layout in step 1 to size both stations.
                      </p>
                    );
                  }
                  if (!sizedStations) {
                    return (
                      <p className="text-sm text-slate-500">
                        Unable to size stations — check loads and catalog filters.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {sizedStations.map((station) => (
                        <div
                          key={station.role}
                          className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-700/60"
                        >
                          <p className="text-xs font-semibold uppercase text-slate-500">{station.label}</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {station.designation ?? "—"} · {BEARING_TYPE_LABELS[station.bearingType]}
                          </p>
                          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <div>
                              <dt className="text-slate-400">Fr / Fa</dt>
                              <dd className="tabular-nums">
                                {(station.radialLoad / 1000).toFixed(2)} / {(station.axialLoad / 1000).toFixed(2)} kN
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">P/C</dt>
                              <dd className="tabular-nums">{formatDisplayNumber(station.dynamicUtilization)}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Lnm</dt>
                              <dd className="tabular-nums">{formatDisplayNumber(station.modifiedLifeHours)} h</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">C</dt>
                              <dd className="tabular-nums">{(station.dynamicRatingN / 1000).toFixed(1)} kN</dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-500">
                        Recommendations use {manufacturer} catalog at {sizingConfig.speed} rpm.
                      </p>
                    </div>
                  );

                case "thermal":
                  return (
                    <CalculatorFormSection
                      title="Thermal expansion note"
                      description="NU floating station must absorb shaft–housing differential growth."
                    >
                      <p className="rounded-lg border border-orange-200/70 bg-orange-50/50 px-3 py-2 text-sm text-slate-700 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-slate-200">
                        {thermalNote}
                      </p>
                      <div className={calculatorInputGridClass + " mt-3"}>
                        <div className="min-w-0 space-y-1.5">
                          <label className={calculatorFieldLabelClass}>Span L (mm)</label>
                          <input
                            type="number"
                            value={draft.bearingSpanMm}
                            onChange={(e) => setDraft({ ...draft, bearingSpanMm: Number(e.target.value) })}
                            className={calculatorNumberInputClass}
                          />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <label className={calculatorFieldLabelClass}>Available float (mm)</label>
                          <input
                            type="number"
                            value={draft.availableFloatMm}
                            onChange={(e) => setDraft({ ...draft, availableFloatMm: Number(e.target.value) })}
                            className={calculatorNumberInputClass}
                          />
                        </div>
                      </div>
                    </CalculatorFormSection>
                  );

                case "apply":
                  return (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        Apply mounting system, station loads, span, float, and sized designations to the
                        calculator form.
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <li>
                          <span className="font-medium">Layout:</span> {draft.mountingSystem}
                        </li>
                        <li>
                          <span className="font-medium">Locating:</span>{" "}
                          {sizedStations?.[0]?.designation ?? draft.designation}
                        </li>
                        <li>
                          <span className="font-medium">Floating:</span>{" "}
                          {sizedStations?.[1]?.designation ?? (draft.floatingDesignation || "auto")}
                        </li>
                        <li>
                          <span className="font-medium">Fr₀ / Fr₁:</span>{" "}
                          {(draft.stationRadialLoadsN[0]! / 1000).toFixed(2)} /{" "}
                          {(draft.stationRadialLoadsN[1]! / 1000).toFixed(2)} kN
                        </li>
                        <li>
                          <span className="font-medium">Fa:</span> {(draft.axialLoad / 1000).toFixed(2)} kN
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={handleApply}
                        className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"
                      >
                        Apply to calculator
                      </button>
                    </div>
                  );

                default:
                  return null;
              }
            }}
          </CalculatorInputSteps>
        </div>
      </div>
    </div>
  );
}

/** Trigger button for opening the wizard. */
export function BearingSystemWizardButton({
  onClick,
  label = "Open system wizard",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
    >
      <Wand2 className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
