"use client";

import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorSelectField from "@/components/calculator/CalculatorSelectField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorTextInputClass } from "@/components/calculator/styles";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { SpringWireType, HookType } from "@/lib/springs/shared/wireStrength";
import type { En13906LifeClass, En13906WireQuality } from "@/lib/springs/shared/en13906Fatigue";
import SpringFatigueFields from "@/components/springs/shared/SpringFatigueFields";
import SpringWireCatalogPicker from "@/components/springs/shared/SpringWireCatalogPicker";

type Props = {
  wireDiameter: number;
  setWireDiameter: Dispatch<SetStateAction<number>>;
  meanDiameter: number;
  setMeanDiameter: Dispatch<SetStateAction<number>>;
  activeCoils: number;
  setActiveCoils: Dispatch<SetStateAction<number>>;
  freeLength: number;
  setFreeLength: Dispatch<SetStateAction<number>>;
  deflection: number;
  setDeflection: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  modulusUnit: string;
  setModulusUnit: Dispatch<SetStateAction<string>>;
  ultimateStrength: number;
  setUltimateStrength: Dispatch<SetStateAction<number>>;
  wireType: SpringWireType;
  setWireType: (wireType: SpringWireType) => void;
  initialTension: number;
  setInitialTension: Dispatch<SetStateAction<number>>;
  hookType: HookType;
  setHookType: (hookType: HookType) => void;
  operatingFrequencyHz: number;
  setOperatingFrequencyHz: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
  workflowMode?: DesignWorkflowMode;
  targetRate?: number;
  setTargetRate?: Dispatch<SetStateAction<number>>;
  maxForce?: number;
  setMaxForce?: Dispatch<SetStateAction<number>>;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
  enableFatigueCheck?: boolean;
  setEnableFatigueCheck?: Dispatch<SetStateAction<boolean>>;
  lifeClass?: En13906LifeClass;
  setLifeClass?: (value: En13906LifeClass) => void;
  wireQuality?: En13906WireQuality;
  setWireQuality?: (value: En13906WireQuality) => void;
  minDeflection?: number;
  setMinDeflection?: Dispatch<SetStateAction<number>>;
  catalogDesignation?: string;
  setCatalogDesignation?: Dispatch<SetStateAction<string>>;
  onCatalogPick?: (entry: { diameterMm: number; tensileStrengthPa: number; shearModulusPa: number }) => void;
};

export default function ExtensionSpringInputs({
  wireDiameter,
  setWireDiameter,
  meanDiameter,
  setMeanDiameter,
  activeCoils,
  setActiveCoils,
  freeLength,
  setFreeLength,
  deflection,
  setDeflection,
  modulus,
  setModulus,
  modulusUnit,
  setModulusUnit,
  ultimateStrength,
  setUltimateStrength,
  wireType,
  setWireType,
  initialTension,
  setInitialTension,
  hookType,
  setHookType,
  operatingFrequencyHz,
  setOperatingFrequencyHz,
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
  workflowMode = "check",
  targetRate = 40,
  setTargetRate,
  maxForce = 200,
  setMaxForce,
  onSave,
  saving = false,
  projectName,
  setProjectName,
  enableFatigueCheck = false,
  setEnableFatigueCheck,
  lifeClass = "VL",
  setLifeClass,
  wireQuality = 1,
  setWireQuality,
  minDeflection = 0,
  setMinDeflection,
  catalogDesignation = "",
  setCatalogDesignation,
  onCatalogPick,
}: Props) {
  const isDesignMode = workflowMode === "design";

  return (
    <CalculatorInputPanel
      title="Extension spring"
      description={
        isDesignMode
          ? "Enter target rate and load; design mode sweeps wire diameter and coil count."
          : "Helical extension spring with initial tension, body and hook stress checks."
      }
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label="Calculate spring"
            designAware
          />
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
          ) : null}
        </div>
      }
    >
      {setProjectName ? (
        <input
          className={`mb-4 ${calculatorTextInputClass}`}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}

      {setProjectName ? (
        <input
          className={`mb-4 ${calculatorTextInputClass}`}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}

      <div className={calculatorInputGridClass}>
        {!isDesignMode ? (
          <>
            <CalculatorUnitField
              label="Wire diameter (d)"
              value={wireDiameter}
              onChange={setWireDiameter}
              unit={
                <ModuleUnitSelect moduleId="extension-springs" fieldKey="wireDiameter" value={lengthUnit} onChange={setLengthUnit} />
              }
            />
            <CalculatorUnitField
              label="Mean coil diameter (D)"
              value={meanDiameter}
              onChange={setMeanDiameter}
              unit={
                <ModuleUnitSelect moduleId="extension-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
              }
            />
          </>
        ) : null}
        <CalculatorUnitField
          label="Free length (coils only)"
          value={freeLength}
          onChange={setFreeLength}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="freeLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        {!isDesignMode ? (
          <>
            <CalculatorUnitField
              label="Extension at load"
              value={deflection}
              onChange={setDeflection}
              unit={
                <ModuleUnitSelect moduleId="extension-springs" fieldKey="deflection" value={lengthUnit} onChange={setLengthUnit} />
              }
            />
            <CalculatorNumberField
              label="Active coils (n)"
              value={activeCoils}
              onChange={setActiveCoils}
              min={1}
              step={0.5}
            />
          </>
        ) : null}
        <CalculatorUnitField
          label="Initial tension Fi"
          value={initialTension}
          onChange={setInitialTension}
          unit={<span className="text-sm text-slate-500">N</span>}
        />
        <CalculatorSelectField
          label="Hook type"
          value={hookType}
          onChange={(value) => setHookType(value as HookType)}
        >
          <option value="machine">Machine hook (K = 1.25)</option>
          <option value="crossover">Cross-over hook (K = 1.4)</option>
          <option value="extended">Extended hook (K = 1.15)</option>
          <option value="none">Body only (no hook factor)</option>
        </CalculatorSelectField>
        <CalculatorUnitField
          label="Shear modulus G"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="modulus" value={modulusUnit} onChange={setModulusUnit} />
          }
        />
        <CalculatorSelectField
          label="Wire grade (EN 10270 / ASTM)"
          value={wireType}
          onChange={(value) => setWireType(value as SpringWireType)}
        >
          <option value="music">Music wire (A228 / EN 10270-1 SH)</option>
          <option value="hard-drawn">Hard-drawn (A227)</option>
          <option value="oil-tempered">Oil-tempered (A229)</option>
          <option value="chrome-vanadium">Chrome-vanadium (A232)</option>
          <option value="chrome-silicon">Chrome-silicon (A401)</option>
          <option value="custom">Custom (enter Rm below)</option>
        </CalculatorSelectField>
        {setCatalogDesignation && onCatalogPick ? (
          <SpringWireCatalogPicker
            wireType={wireType}
            catalogDesignation={catalogDesignation}
            setCatalogDesignation={setCatalogDesignation}
            onPick={onCatalogPick}
          />
        ) : null}
        {wireType === "custom" ? (
          <CalculatorUnitField
            label="Ultimate tensile strength Rm"
            value={ultimateStrength}
            onChange={setUltimateStrength}
            unit={
              <ModuleUnitSelect moduleId="extension-springs" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
            }
          />
        ) : null}
        <CalculatorNumberField
          label="Operating frequency (Hz, optional)"
          value={operatingFrequencyHz}
          onChange={setOperatingFrequencyHz}
          min={0}
          step={1}
        />
      </div>
      {setEnableFatigueCheck && setMinDeflection && setLifeClass && setWireQuality ? (
        <SpringFatigueFields
          enableFatigueCheck={enableFatigueCheck}
          setEnableFatigueCheck={setEnableFatigueCheck}
          lifeClass={lifeClass}
          setLifeClass={setLifeClass}
          wireQuality={wireQuality}
          setWireQuality={setWireQuality}
          minStrokeLabel="Minimum extension (fatigue range)"
          minStroke={minDeflection}
          setMinStroke={setMinDeflection}
          minStrokeUnit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="deflection" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
      ) : null}
    </CalculatorInputPanel>
  );
}
