"use client";

import {
  Load,
  UDL,
  TriangularLoad,
  type BeamSupport,
  type SupportKind,
  type SupportType,
} from "@/lib/structural/beams/types";
import { useState } from "react";
import MaterialSelect from "@/components/materials/MaterialSelect";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import { getBeamApplicationPreset } from "@/lib/structural/beams/applicationPresets";
import { useBeamApplicationPreset } from "@/hooks/useApplicationPreset";
import { materials } from "@/data/materials";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import DesignWorkflowStepper, {
  BEAM_DESIGN_STEPS,
  type DesignWorkflowStep,
  type DesignWorkflowStepId,
} from "@/components/calculator/DesignWorkflowStepper";
import { useModuleWorkspaceOptional } from "@/contexts/ModuleWorkspaceContext";
import {
  calculatorDangerLinkClass,
  calculatorFieldLabelClass,
  calculatorInputGridCompactClass,
  calculatorInputGridTightClass,
  calculatorLoadCardClass,
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import BeamLoadLibrary, {
  type BeamLoadLibraryType,
} from "@/components/structural/beams/BeamLoadLibrary";

type Props = {
  projectName: string;
  setProjectName: (v: string) => void;

  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (v: string) => void;

  force: number;
  setForce: (v: number) => void;
  forceUnit: string;
  setForceUnit: (v: string) => void;

  udl: number;
  setUdl: (v: number) => void;
  udlUnit: string;
  setUdlUnit: (v: string) => void;

  I: number;
  setI: (v: number) => void;
  inertiaUnit: string;
  setInertiaUnit: (v: string) => void;
  momentUnit: string;
  setMomentUnit: (v: string) => void;
  stressUnit: string;
  setStressUnit: (v: string) => void;

  c: number;
  setC: (v: number) => void;

  support: SupportType;
  setSupport: (v: SupportType) => void;
  supports: BeamSupport[];
  updateSupport: (id: string, patch: Partial<BeamSupport>) => void;
  addSupport: () => void;
  removeSupport: (id: string) => void;

  material: string;
  setMaterial: (v: string) => void;

  onCalculate: () => void;
  saveProject: () => void;
  saving: boolean;

  loads: Load[];
  updateLoad: (i: number, l: Load) => void;
  removeLoad: (i: number) => void;
  addPointLoad: () => void;
  addUDL: () => void;
  addPartialUDL: () => void;
  addMoment: () => void;
  addTriangular: () => void;
  onLoadLibraryAdd: (type: BeamLoadLibraryType) => void;

  includeSelfWeight: boolean;
  setIncludeSelfWeight: (v: boolean) => void;
  sectionArea?: number;

  meshSegments: number;
  setMeshSegments: (value: number) => void;

  workflowMode?: DesignWorkflowMode;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  designMaxDeflection?: number;
  setDesignMaxDeflection?: (value: number) => void;
  designMaxStress?: number;
  setDesignMaxStress?: (value: number) => void;

  /** True once a solve has produced results (enables Results / Verification / Report steps). */
  hasResult?: boolean;
};

function loadTitle(load: Load): string {
  if (load.type === "point") return "Point load";
  if (load.type === "udl") return load.id === "self-weight" ? "Self-weight (UDL)" : "UDL";
  if (load.type === "triangular") return "Triangular / variable";
  return "Applied moment";
}

export default function BeamInputs(props: Props) {
  const { applicationId } = useBeamApplicationPreset();
  const selectedApplication = getBeamApplicationPreset(applicationId);
  const isDesignMode = props.workflowMode === "design";
  const showManualSection = !isDesignMode;
  const hasResult = Boolean(props.hasResult);
  const workspace = useModuleWorkspaceOptional();
  const [activeDesignStepId, setActiveDesignStepId] = useState<DesignWorkflowStepId>("problem");

  const selectedMaterial =
    materials.find((m) => m.name === props.material) ?? materials[0];
  const defaultDesignStress =
    ((selectedMaterial?.yieldStress ?? 250e6) * selectedApplication.allowableStressRatio) /
    (props.stressUnit === "MPa" ? 1e6 : props.stressUnit === "Pa" ? 1 : 1e6);

  const steps: DesignWorkflowStep[] = BEAM_DESIGN_STEPS.map((step) => {
    if (step.id === "problem") {
      return { ...step, complete: Boolean(props.projectName.trim()) };
    }
    if (step.id === "geometry") {
      return { ...step, complete: props.length > 0 && props.supports.length > 0 };
    }
    if (step.id === "material") {
      return { ...step, complete: Boolean(props.material) };
    }
    if (step.id === "loads") {
      return { ...step, complete: (props.loads?.length ?? 0) > 0 };
    }
    if (step.id === "results" || step.id === "verification" || step.id === "report") {
      return { ...step, complete: hasResult, disabled: !hasResult };
    }
    return { ...step };
  });

  const handleStepSelect = (step: DesignWorkflowStep) => {
    setActiveDesignStepId(step.id);
    if (step.id === "results" || step.id === "verification") {
      workspace?.setActiveWorkspaceTab("calculator");
      const anchor =
        step.id === "verification" ? "design-step-verification" : "design-step-results";
      requestAnimationFrame(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (step.id === "report") {
      workspace?.setActiveWorkspaceTab("report");
      return;
    }
    if (step.id === "material") {
      // Stay on calculator; Materials tab remains available for catalog browse.
    }
  };

  return (
    <CalculatorInputPanel
      title="Beam design"
      description="Define the problem, geometry, material, and loads — then validate, verify, and export a design-review report."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={props.onCalculate} label="Run design check" designAware />
          <button
            type="button"
            onClick={props.saveProject}
            disabled={props.saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {props.saving ? "Saving…" : "Save project"}
          </button>
        </div>
      }
    >
      <DesignWorkflowStepper
        steps={steps}
        activeStepId={activeDesignStepId}
        onStepSelect={handleStepSelect}
      />

      <CalculatorFormSection
        id="design-step-problem"
        title="Problem"
        description="Project label and design targets for this beam case."
      >
        <label className={calculatorFieldLabelClass}>
          Project name
          <input
            className={`${calculatorTextInputClass} mt-2`}
            value={props.projectName}
            onChange={(e) => props.setProjectName(e.target.value)}
            placeholder="Optional label for save/export"
          />
        </label>
        <p className="text-xs text-slate-500">
          Application preset and design-code defaults are set above. In Auto-design mode, set stress and
          deflection targets with the geometry below.
        </p>
        {isDesignMode ? (
          <div className={`${calculatorInputGridTightClass} mt-2`}>
            <CalculatorUnitField
              label="Design max deflection"
              value={props.designMaxDeflection ?? props.length / selectedApplication.deflectionLimitRatio}
              onChange={(v) => props.setDesignMaxDeflection?.(v)}
              unit={
                <ModuleUnitSelect
                  moduleId="beams"
                  fieldKey="length"
                  value={props.lengthUnit}
                  onChange={props.setLengthUnit}
                />
              }
            />
            <CalculatorUnitField
              label="Design max stress"
              value={props.designMaxStress ?? defaultDesignStress}
              onChange={(v) => props.setDesignMaxStress?.(v)}
              unit={
                <ModuleUnitSelect
                  moduleId="beams"
                  fieldKey="stress"
                  value={props.stressUnit}
                  onChange={props.setStressUnit}
                />
              }
            />
          </div>
        ) : null}
      </CalculatorFormSection>

      <CalculatorFormSection
        id="design-step-geometry"
        title="Geometry"
        description="Span, supports, and cross-section (catalog or manual I and c)."
      >
        <label className={calculatorFieldLabelClass}>
          Support preset
          <select
            className={`${calculatorSelectClass} mt-2`}
            value={props.support}
            onChange={(e) => props.setSupport(e.target.value as SupportType)}
          >
            <option value="simply_supported">Simply supported</option>
            <option value="cantilever">Cantilever</option>
            <option value="fixed_fixed">Fixed–fixed</option>
          </select>
        </label>
        <p className="text-xs text-slate-500">
          Preset seeds end supports. Add or drag supports for continuous beams.
        </p>

        <div className="space-y-2">
          {props.supports.map((sp) => (
            <div key={sp.id} className={calculatorLoadCardClass}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Support {sp.id}
                </span>
                {props.supports.length > 1 ? (
                  <button
                    type="button"
                    className={calculatorDangerLinkClass}
                    onClick={() => props.removeSupport(sp.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className={calculatorInputGridCompactClass}>
                <label className={calculatorFieldLabelClass}>
                  Kind
                  <select
                    className={`${calculatorSelectClass} mt-2`}
                    value={sp.kind}
                    onChange={(e) =>
                      props.updateSupport(sp.id, { kind: e.target.value as SupportKind })
                    }
                  >
                    <option value="pin">Pin</option>
                    <option value="roller">Roller</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
                <CalculatorUnitField
                  label="Position"
                  value={sp.x}
                  onChange={(v) => props.updateSupport(sp.id, { x: v })}
                  step="any"
                  unit={
                    <ModuleUnitSelect
                      moduleId="beams"
                      fieldKey="length"
                      value={props.lengthUnit}
                      onChange={props.setLengthUnit}
                    />
                  }
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={props.addSupport} className={calculatorSecondaryButtonClass}>
            + Intermediate support
          </button>
        </div>

        <CalculatorUnitField
          label="Span length"
          value={props.length}
          onChange={props.setLength}
          unit={
            <ModuleUnitSelect
              moduleId="beams"
              fieldKey="length"
              value={props.lengthUnit}
              onChange={props.setLengthUnit}
            />
          }
        />

        {isDesignMode ? null : (
          <RolledSectionPicker
            designation={props.sectionDesignation}
            onDesignationChange={props.setSectionDesignation}
            onSectionApplied={props.onSectionApplied}
          />
        )}

        {showManualSection ? (
          <>
            <CalculatorUnitField
              label="Second moment of area (I)"
              value={props.I}
              onChange={props.setI}
              unit={
                <ModuleUnitSelect
                  moduleId="beams"
                  fieldKey="inertia"
                  value={props.inertiaUnit}
                  onChange={props.setInertiaUnit}
                />
              }
            />
            <CalculatorUnitField
              label="Distance to extreme fiber (c)"
              value={props.c}
              onChange={props.setC}
              unit={
                <ModuleUnitSelect
                  moduleId="beams"
                  fieldKey="length"
                  value={props.lengthUnit}
                  onChange={props.setLengthUnit}
                />
              }
            />
          </>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Mesh refinement</p>
          <p className="text-xs text-slate-500">Increase element count for smoother curves.</p>
          <MeshControls elements={props.meshSegments} onChangeElements={props.setMeshSegments} refine />
        </div>
      </CalculatorFormSection>

      <CalculatorFormSection
        id="design-step-material"
        title="Material"
        description="Grade and elastic properties for stress and deflection checks. Use the Materials workspace tab to browse the catalog."
      >
        <MaterialSelect
          profile="structural"
          value={props.material}
          onChange={props.setMaterial}
        />
        {selectedMaterial ? (
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              E {(selectedMaterial.E / 1e9).toFixed(1)} GPa
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              Fy {((selectedMaterial.yieldStress ?? 0) / 1e6).toFixed(0)} MPa
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              ρ {selectedMaterial.density} kg/m³
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              α {((selectedMaterial.thermalExpansion ?? 0) * 1e6).toFixed(1)} µ/°C
            </span>
          </div>
        ) : null}
      </CalculatorFormSection>

      <CalculatorFormSection
        id="design-step-loads"
        title="Loads"
        description="Add loads from the library or buttons. Drag onto the beam diagram to place."
      >
        <BeamLoadLibrary
          includeSelfWeight={props.includeSelfWeight}
          onAdd={props.onLoadLibraryAdd}
        />

        {props.sectionArea != null && props.sectionArea > 0 ? (
          <p className="text-xs text-slate-500">
            Catalog area A = {(props.sectionArea * 1e4).toFixed(2)} cm² (used for self-weight).
          </p>
        ) : null}

        {(props.loads ?? []).map((load, i) => (
          <div key={load.id || i} className={calculatorLoadCardClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {loadTitle(load)}
              </span>
              <button
                type="button"
                className={calculatorDangerLinkClass}
                onClick={() => props.removeLoad(i)}
              >
                Remove
              </button>
            </div>

            {load.type === "triangular" ? (
              <div className={calculatorInputGridCompactClass}>
                <CalculatorUnitField
                  label="w at start"
                  value={load.wStart}
                  onChange={(v) =>
                    props.updateLoad(i, { ...(load as TriangularLoad), wStart: v })
                  }
                  step="any"
                  unit={
                    <ModuleUnitSelect
                      moduleId="beams"
                      fieldKey="udl"
                      value={props.udlUnit}
                      onChange={props.setUdlUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="w at end"
                  value={load.wEnd}
                  onChange={(v) =>
                    props.updateLoad(i, { ...(load as TriangularLoad), wEnd: v })
                  }
                  step="any"
                  unit={
                    <ModuleUnitSelect
                      moduleId="beams"
                      fieldKey="udl"
                      value={props.udlUnit}
                      onChange={props.setUdlUnit}
                    />
                  }
                />
              </div>
            ) : (
              <CalculatorUnitField
                label="Magnitude"
                value={load.value}
                onChange={(v) => props.updateLoad(i, { ...load, value: v })}
                step="any"
                unit={
                  <ModuleUnitSelect
                    moduleId="beams"
                    fieldKey={
                      load.type === "point" ? "force" : load.type === "udl" ? "udl" : "moment"
                    }
                    value={
                      load.type === "point"
                        ? props.forceUnit
                        : load.type === "udl"
                          ? props.udlUnit
                          : props.momentUnit
                    }
                    onChange={
                      load.type === "point"
                        ? props.setForceUnit
                        : load.type === "udl"
                          ? props.setUdlUnit
                          : props.setMomentUnit
                    }
                  />
                }
              />
            )}

            {load.type === "point" || load.type === "moment" ? (
              <CalculatorUnitField
                label="Position along span"
                value={load.position}
                onChange={(v) => props.updateLoad(i, { ...load, position: v })}
                step="any"
                unit={
                  <ModuleUnitSelect
                    moduleId="beams"
                    fieldKey="length"
                    value={props.lengthUnit}
                    onChange={props.setLengthUnit}
                  />
                }
              />
            ) : load.type === "udl" || load.type === "triangular" ? (
              <div className={calculatorInputGridCompactClass}>
                <CalculatorUnitField
                  label="Start position"
                  value={load.start}
                  onChange={(v) =>
                    props.updateLoad(i, {
                      ...(load as UDL | TriangularLoad),
                      start: v,
                    })
                  }
                  step="any"
                  unit={
                    <ModuleUnitSelect
                      moduleId="beams"
                      fieldKey="length"
                      value={props.lengthUnit}
                      onChange={props.setLengthUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="End position"
                  value={load.end}
                  onChange={(v) =>
                    props.updateLoad(i, {
                      ...(load as UDL | TriangularLoad),
                      end: v,
                    })
                  }
                  step="any"
                  unit={
                    <ModuleUnitSelect
                      moduleId="beams"
                      fieldKey="length"
                      value={props.lengthUnit}
                      onChange={props.setLengthUnit}
                    />
                  }
                />
              </div>
            ) : null}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={props.addPointLoad} className={calculatorSecondaryButtonClass}>
            + Point load
          </button>
          <button type="button" onClick={props.addUDL} className={calculatorSecondaryButtonClass}>
            + Full UDL
          </button>
          <button type="button" onClick={props.addPartialUDL} className={calculatorSecondaryButtonClass}>
            + Partial UDL
          </button>
          <button type="button" onClick={props.addTriangular} className={calculatorSecondaryButtonClass}>
            + Triangular
          </button>
          <button type="button" onClick={props.addMoment} className={calculatorSecondaryButtonClass}>
            + Moment
          </button>
        </div>
      </CalculatorFormSection>

      <CalculatorFormSection title="Result units">
        <div className={calculatorInputGridTightClass}>
          <label className={calculatorFieldLabelClass}>
            Moment units
            <div className="mt-2">
              <ModuleUnitSelect
                moduleId="beams"
                fieldKey="moment"
                value={props.momentUnit}
                onChange={props.setMomentUnit}
              />
            </div>
          </label>
          <label className={calculatorFieldLabelClass}>
            Stress units
            <div className="mt-2">
              <ModuleUnitSelect
                moduleId="beams"
                fieldKey="stress"
                value={props.stressUnit}
                onChange={props.setStressUnit}
              />
            </div>
          </label>
        </div>
      </CalculatorFormSection>
    </CalculatorInputPanel>
  );
}
