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
import type { SpringWireType } from "@/lib/springs/compression-springs/types";

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
  maxOD?: number;
  setMaxOD?: Dispatch<SetStateAction<number>>;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
};

export default function CompressionSpringInputs({
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
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
  workflowMode = "check",
  targetRate = 50,
  setTargetRate,
  maxForce = 450,
  setMaxForce,
  maxOD = 40,
  setMaxOD,
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const isDesignMode = workflowMode === "design";

  return (
    <CalculatorInputPanel
      title="Compression spring"
      description={
        isDesignMode
          ? "Enter targets and envelope limits; design mode iterates wire diameter and active coils."
          : "Size wire and coils; estimate rate, solid height, shear stress and safety factor."
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
            unit={<span className="text-sm text-slate-500">N/m</span>}
          />
          <CalculatorUnitField
            label="Maximum force"
            value={maxForce}
            onChange={(value) => setMaxForce?.(value)}
            unit={<span className="text-sm text-slate-500">N</span>}
          />
          <CalculatorUnitField
            label="Maximum OD"
            value={maxOD}
            onChange={(value) => setMaxOD?.(value)}
            unit={
              <ModuleUnitSelect moduleId="compression-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
            }
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
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="wireDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Mean coil diameter (D)"
          value={meanDiameter}
          onChange={setMeanDiameter}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        </>
        ) : null}
        <CalculatorUnitField
          label="Free length"
          value={freeLength}
          onChange={setFreeLength}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="freeLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        {!isDesignMode ? (
        <>
        <CalculatorUnitField
          label="Operating deflection"
          value={deflection}
          onChange={setDeflection}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="deflection" value={lengthUnit} onChange={setLengthUnit} />
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
          label="Shear modulus G"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="modulus" value={modulusUnit} onChange={setModulusUnit} />
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
        {wireType === "custom" ? (
          <CalculatorUnitField
            label="Ultimate tensile strength Rm"
            value={ultimateStrength}
            onChange={setUltimateStrength}
            unit={
              <ModuleUnitSelect moduleId="compression-springs" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
            }
          />
        ) : null}
      </div>
    </CalculatorInputPanel>
  );
}
