"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { calculatorSelectClass } from "@/components/calculator/styles";
import { getDesignCodeOption } from "@/lib/standards/designCodes";
import {
  formatPresetKnobs,
  getDefaultPresetId,
  getModuleApplicationPreset,
  getPresetsForModule,
  groupPresetsByDesignCode,
} from "@/lib/applications";
import type { ModuleApplicationPreset } from "@/lib/applications";

type Props = {
  moduleId: string;
};

function StandardChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
      {label}
    </span>
  );
}

function PresetOptionGroup({
  label,
  presets,
  designCodeLabel,
}: {
  label: string;
  presets: ModuleApplicationPreset[];
  designCodeLabel: string;
}) {
  if (!presets.length) return null;
  return (
    <optgroup label={`${label} (${designCodeLabel})`}>
      {presets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.label}
          {preset.fatigueSensitive ? " · fatigue-sensitive" : ""}
        </option>
      ))}
    </optgroup>
  );
}

export default function ApplicationPresetSelector({ moduleId }: Props) {
  const { designCode } = useDesignCode();
  const { mergedUserInputs, patchDesignTarget } = useDesignWorkflow();
  const designCodeOption = getDesignCodeOption(designCode);

  const presets = useMemo(() => getPresetsForModule(moduleId), [moduleId]);
  const { recommended, other } = useMemo(
    () => groupPresetsByDesignCode(presets, designCode),
    [presets, designCode]
  );

  const presetId =
    mergedUserInputs.applicationPresetId ?? getDefaultPresetId(moduleId, designCode);
  const selected = useMemo(
    () => getModuleApplicationPreset(moduleId, presetId),
    [moduleId, presetId]
  );
  const knobSummary = useMemo(() => formatPresetKnobs(selected), [selected]);

  const applyKnobs = useCallback(
    (preset: ModuleApplicationPreset) => {
      const { knobs } = preset;
      if (knobs.loadFactor != null) patchDesignTarget("loadFactor", knobs.loadFactor);
      if (knobs.serviceFactor != null) patchDesignTarget("serviceFactor", knobs.serviceFactor);
      if (knobs.targetSafetyFactor != null) {
        patchDesignTarget("targetSafetyFactor", knobs.targetSafetyFactor);
      }
      if (knobs.allowableStressRatio != null) {
        patchDesignTarget("allowableStressRatio", knobs.allowableStressRatio);
      }
      if (knobs.deflectionLimitRatio != null) {
        patchDesignTarget("deflectionLimitRatio", knobs.deflectionLimitRatio);
      }
    },
    [patchDesignTarget]
  );

  useEffect(() => {
    if (mergedUserInputs.applicationPresetId != null) return;
    const defaultId = getDefaultPresetId(moduleId, designCode);
    patchDesignTarget("applicationPresetId", defaultId);
    applyKnobs(getModuleApplicationPreset(moduleId, defaultId));
  }, [
    moduleId,
    designCode,
    mergedUserInputs.applicationPresetId,
    patchDesignTarget,
    applyKnobs,
  ]);

  const prevDesignCode = useRef(designCode);
  useEffect(() => {
    if (prevDesignCode.current === designCode) return;
    prevDesignCode.current = designCode;
    const current = mergedUserInputs.applicationPresetId;
    if (current) {
      const stillValid = getModuleApplicationPreset(moduleId, current).designCodes.includes(
        designCode
      );
      if (stillValid) return;
    }
    const nextId = getDefaultPresetId(moduleId, designCode);
    patchDesignTarget("applicationPresetId", nextId);
    applyKnobs(getModuleApplicationPreset(moduleId, nextId));
  }, [designCode, moduleId, patchDesignTarget, mergedUserInputs.applicationPresetId, applyKnobs]);

  const handleChange = (id: string) => {
    patchDesignTarget("applicationPresetId", id);
    applyKnobs(getModuleApplicationPreset(moduleId, id));
  };

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 p-4 shadow-sm dark:border-violet-900/40 dark:from-violet-950/40 dark:via-slate-900 dark:to-indigo-950/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-800 dark:text-violet-200">
            Calculation standard
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sets screening knobs for{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {designCodeOption.shortLabel}
            </span>{" "}
            practice — not product type or catalog geometry
          </p>
        </div>
        {selected.fatigueSensitive ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            Fatigue-sensitive
          </span>
        ) : null}
      </div>

      <select
        className={`${calculatorSelectClass} mt-3 border-violet-200 bg-white/90 dark:border-violet-900/50 dark:bg-slate-950/80`}
        value={presetId}
        onChange={(e) => handleChange(e.target.value)}
      >
        <PresetOptionGroup
          label="Recommended"
          presets={recommended}
          designCodeLabel={designCodeOption.shortLabel}
        />
        {other.length ? (
          <PresetOptionGroup label="Other standards" presets={other} designCodeLabel="all" />
        ) : null}
      </select>

      <p className="mt-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {selected.description}
      </p>

      {knobSummary.length ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-violet-950/90 dark:text-violet-100/90">
          {knobSummary.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}

      {selected.standards.length ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reference standards
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selected.standards.map((std) => (
              <StandardChip key={std} label={std} />
            ))}
          </div>
        </div>
      ) : null}

      {selected.limitations?.length ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {selected.limitations[0]}
        </p>
      ) : null}
    </div>
  );
}
