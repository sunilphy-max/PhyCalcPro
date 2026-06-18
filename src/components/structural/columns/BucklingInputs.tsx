"use client";

import type { EndCondition } from "@/lib/structural/columns/types";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import {
  calculatorFieldLabelClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (u: string) => void;
  load: number;
  setLoad: (v: number) => void;
  loadUnit: string;
  setLoadUnit: (u: string) => void;
  inertia: number;
  setInertia: (v: number) => void;
  area: number;
  setArea: (v: number) => void;
  inertiaUnit: string;
  setInertiaUnit: (u: string) => void;
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  elasticModulusUnit: string;
  setElasticModulusUnit: (u: string) => void;
  yieldStrength: number;
  setYieldStrength: (v: number) => void;
  endCondition: EndCondition;
  setEndCondition: (c: EndCondition) => void;
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
  workflowMode?: DesignWorkflowMode;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  targetSafetyFactor: number;
  setTargetSafetyFactor: (value: number) => void;
};

export default function BucklingInputs({
  projectName,
  setProjectName,
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  load,
  setLoad,
  loadUnit,
  setLoadUnit,
  inertia,
  setInertia,
  area,
  setArea,
  inertiaUnit,
  setInertiaUnit,
  elasticModulus,
  setElasticModulus,
  elasticModulusUnit,
  setElasticModulusUnit,
  yieldStrength,
  setYieldStrength,
  endCondition,
  setEndCondition,
  onCalculate,
  onSave,
  saving,
  workflowMode = "check",
  sectionDesignation,
  setSectionDesignation,
  onSectionApplied,
  targetSafetyFactor,
  setTargetSafetyFactor,
}: Props) {
  const isDesignMode = workflowMode === "design";
  const showManualSection = !isDesignMode;

  return (
    <CalculatorInputPanel
      title="Column buckling"
      description="Euler buckling and code utilization for slender compression members."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label={isDesignMode ? "Size section" : "Calculate buckling"}
            designAware
          />
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save project"}
          </button>
        </div>
      }
    >
      <CalculatorFormSection title="Project">
        <label className={calculatorFieldLabelClass}>
          Project name
          <input
            className={`${calculatorTextInputClass} mt-2`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Optional label for save/export"
          />
        </label>
      </CalculatorFormSection>

      {!isDesignMode ? (
        <RolledSectionPicker
          designation={sectionDesignation}
          onDesignationChange={setSectionDesignation}
          onSectionApplied={onSectionApplied}
        />
      ) : null}

      {isDesignMode ? (
        <CalculatorFormSection title="Design target">
          <CalculatorUnitField
            label="Target buckling safety factor"
            value={targetSafetyFactor}
            onChange={setTargetSafetyFactor}
            min={1}
            step={0.1}
            unit={<span className="inline-flex min-w-[5.5rem] items-center px-2 text-sm text-slate-500">—</span>}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Auto-design selects the lightest catalog section with Pcr/P at or above this target.
          </p>
        </CalculatorFormSection>
      ) : null}

      <CalculatorFormSection title="Geometry">
        <CalculatorUnitField
          label="Column length"
          value={length}
          onChange={setLength}
          step={0.001}
          unit={
            <ModuleUnitSelect moduleId="columns" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />

        {showManualSection ? (
          <>
            <CalculatorUnitField
              label="Cross-sectional area"
              value={area}
              onChange={setArea}
              step={1e-6}
              unit={<span className="inline-flex min-w-[5.5rem] items-center px-2 text-sm text-slate-600">m²</span>}
            />
            <CalculatorUnitField
              label="Second moment of inertia"
              value={inertia}
              onChange={setInertia}
              step={1e-8}
              unit={
                <ModuleUnitSelect
                  moduleId="columns"
                  fieldKey="inertia"
                  value={inertiaUnit}
                  onChange={setInertiaUnit}
                />
              }
            />
          </>
        ) : null}
      </CalculatorFormSection>

      <CalculatorFormSection title="Material">
        <CalculatorUnitField
          label="Elastic modulus (E)"
          value={elasticModulus}
          onChange={setElasticModulus}
          step={1e6}
          unit={
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="stress"
              value={elasticModulusUnit}
              onChange={setElasticModulusUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Yield strength (Fy)"
          value={yieldStrength}
          onChange={setYieldStrength}
          step={1e6}
          unit={
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="stress"
              value={elasticModulusUnit}
              onChange={setElasticModulusUnit}
            />
          }
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Used by AISC 360 §E3 / EN 1993-1-1 §6.3 compression checks.
        </p>
      </CalculatorFormSection>

      <CalculatorFormSection title="Loading & end condition">
        <CalculatorUnitField
          label="Axial compressive load"
          value={load}
          onChange={setLoad}
          unit={<ModuleUnitSelect moduleId="columns" fieldKey="load" value={loadUnit} onChange={setLoadUnit} />}
        />
        <label className={calculatorFieldLabelClass}>
          End condition
          <select
            value={endCondition}
            onChange={(e) => setEndCondition(e.target.value as EndCondition)}
            className={`${calculatorSelectClass} mt-2`}
          >
            <option value="pinned">Pinned–pinned</option>
            <option value="fixed">Fixed–fixed</option>
            <option value="cantilever">Cantilever</option>
            <option value="guided">Guided</option>
          </select>
        </label>
      </CalculatorFormSection>
    </CalculatorInputPanel>
  );
}
