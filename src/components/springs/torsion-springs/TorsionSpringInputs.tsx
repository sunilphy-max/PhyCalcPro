"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorSelectField from "@/components/calculator/CalculatorSelectField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorTextInputClass } from "@/components/calculator/styles";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { SpringWireType } from "@/lib/springs/shared/wireStrength";
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
  legLength: number;
  setLegLength: Dispatch<SetStateAction<number>>;
  deflectionAngleDeg: number;
  setDeflectionAngleDeg: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  modulusUnit: string;
  setModulusUnit: Dispatch<SetStateAction<string>>;
  ultimateStrength: number;
  setUltimateStrength: Dispatch<SetStateAction<number>>;
  wireType: SpringWireType;
  setWireType: (wireType: SpringWireType) => void;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
  workflowMode?: DesignWorkflowMode;
  targetRate?: number;
  setTargetRate?: Dispatch<SetStateAction<number>>;
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
  minDeflectionAngleDeg?: number;
  setMinDeflectionAngleDeg?: Dispatch<SetStateAction<number>>;
  catalogDesignation?: string;
  setCatalogDesignation?: Dispatch<SetStateAction<string>>;
  onCatalogPick?: (entry: { diameterMm: number; tensileStrengthPa: number; elasticModulusPa: number }) => void;
};

export default function TorsionSpringInputs({
  wireDiameter,
  setWireDiameter,
  meanDiameter,
  setMeanDiameter,
  activeCoils,
  setActiveCoils,
  legLength,
  setLegLength,
  deflectionAngleDeg,
  setDeflectionAngleDeg,
  modulus,
  setModulus,
  modulusUnit,
  setModulusUnit,
  ultimateStrength,
  setUltimateStrength,
  wireType,
  setWireType,
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
  workflowMode = "check",
  targetRate = 0.5,
  setTargetRate,
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
  minDeflectionAngleDeg = 0,
  setMinDeflectionAngleDeg,
  catalogDesignation = "",
  setCatalogDesignation,
  onCatalogPick,
}: Props) {
  const isDesignMode = workflowMode === "design";

  return (
    <CalculatorInputPanel
      title="Torsion spring"
      description={
        isDesignMode
          ? "Enter target rate; design mode sweeps wire diameter, coil count and leg length."
          : "Helical torsion spring — bending rate k = Ed⁴/(64·D·n), curvature-corrected coil stress."
      }
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label={isDesignMode ? "Size spring" : "Calculate spring"}
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

      {isDesignMode ? (
        <div className={`mb-4 ${calculatorInputGridClass} rounded-xl border border-cyan-200 bg-cyan-50/70 p-4`}>
          <CalculatorUnitField
            label="Target spring rate"
            value={targetRate}
            onChange={(value) => setTargetRate?.(value)}
            unit={<span className="text-sm text-slate-500">N·m/rad</span>}
          />
        </div>
      ) : null}

      <div className={calculatorInputGridClass}>
        {!isDesignMode ? (
          <>
            <CalculatorUnitField
              label="Wire diameter (d)"
              value={wireDiameter}
              onChange={setWireDiameter}
              unit={
                <ModuleUnitSelect moduleId="torsion-springs" fieldKey="wireDiameter" value={lengthUnit} onChange={setLengthUnit} />
              }
            />
            <CalculatorUnitField
              label="Mean coil diameter (D)"
              value={meanDiameter}
              onChange={setMeanDiameter}
              unit={
                <ModuleUnitSelect moduleId="torsion-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
              }
            />
          </>
        ) : null}
        <CalculatorUnitField
          label="Leg length"
          value={legLength}
          onChange={setLegLength}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="legLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorNumberField
          label="Deflection angle (deg)"
          value={deflectionAngleDeg}
          onChange={setDeflectionAngleDeg}
          min={0}
        />
        {!isDesignMode ? (
          <CalculatorNumberField
            label="Active coils (n)"
            value={activeCoils}
            onChange={setActiveCoils}
            min={1}
            step={0.5}
          />
        ) : null}
        <CalculatorUnitField
          label="Elastic modulus E"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="modulus" value={modulusUnit} onChange={setModulusUnit} />
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
              <ModuleUnitSelect moduleId="torsion-springs" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
            }
          />
        ) : null}
      </div>
      {setEnableFatigueCheck && setMinDeflectionAngleDeg && setLifeClass && setWireQuality ? (
        <SpringFatigueFields
          enableFatigueCheck={enableFatigueCheck}
          setEnableFatigueCheck={setEnableFatigueCheck}
          lifeClass={lifeClass}
          setLifeClass={setLifeClass}
          wireQuality={wireQuality}
          setWireQuality={setWireQuality}
          minStrokeLabel="Minimum angle (deg, fatigue range)"
          minStroke={minDeflectionAngleDeg}
          setMinStroke={setMinDeflectionAngleDeg}
        />
      ) : null}
    </CalculatorInputPanel>
  );
}
