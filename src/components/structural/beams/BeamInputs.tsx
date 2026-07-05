"use client";

import { Load, UDL } from "@/lib/structural/beams/types";
import { materials } from "@/data/materials";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import {
  getBeamApplicationPreset,
} from "@/lib/structural/beams/applicationPresets";
import { useBeamApplicationPreset } from "@/hooks/useApplicationPreset";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import { calculatorDangerLinkClass, calculatorFieldLabelClass, calculatorInputGridCompactClass, calculatorInputGridTightClass, calculatorLoadCardClass, calculatorNumberInputClass, calculatorSecondaryButtonClass, calculatorSelectClass, calculatorTextInputClass } from "@/components/calculator/styles";

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

  support: "simply_supported" | "cantilever" | "fixed_fixed";
  setSupport: (v: "simply_supported" | "cantilever" | "fixed_fixed") => void;

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
};

export default function BeamInputs(props: Props) {
  const { applicationId } = useBeamApplicationPreset();
  const beamMaterials = materials.filter((material) =>
    ["structural-steel", "alloy-steel", "stainless-steel", "aluminum", "titanium", "other"].includes(
      material.category
    )
  );
  const selectedApplication = getBeamApplicationPreset(applicationId);
  const isDesignMode = props.workflowMode === "design";
  const showManualSection = !isDesignMode;

  const defaultDesignStress =
    ((materials.find((m) => m.name === props.material)?.yieldStress ?? 250e6) *
      selectedApplication.allowableStressRatio) /
    (props.stressUnit === "MPa" ? 1e6 : props.stressUnit === "Pa" ? 1 : 1e6);

  return (
    <CalculatorInputPanel
      title="Beam analysis"
      description="Deflection, bending moment, and shear for point loads, UDLs, and applied moments."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={props.onCalculate}
            label={isDesignMode ? "Size section" : "Solve beam"}
            designAware
          />
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
      <CalculatorFormSection title="Project">
        <label className={calculatorFieldLabelClass}>
          Project name
          <input
            className={`${calculatorTextInputClass} mt-2`}
            value={props.projectName}
            onChange={(e) => props.setProjectName(e.target.value)}
            placeholder="Optional label for save/export"
          />
        </label>
      </CalculatorFormSection>

      <CalculatorFormSection title="Support & material">
        <label className={calculatorFieldLabelClass}>
          Support condition
          <select
            className={`${calculatorSelectClass} mt-2`}
            value={props.support}
            onChange={(e) => props.setSupport(e.target.value as Props["support"])}
          >
            <option value="simply_supported">Simply supported</option>
            <option value="cantilever">Cantilever</option>
            <option value="fixed_fixed">Fixed–fixed</option>
          </select>
        </label>

        <label className={calculatorFieldLabelClass}>
          Material
          <select
            className={`${calculatorSelectClass} mt-2`}
            value={props.material}
            onChange={(e) => props.setMaterial(e.target.value)}
          >
            {beamMaterials.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </CalculatorFormSection>

      {isDesignMode ? (
        <CalculatorFormSection title="Design targets" description="Limits used when sizing from the rolled-section catalog.">
          <CalculatorUnitField
            label="Max deflection"
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
            label="Max bending stress"
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
        </CalculatorFormSection>
      ) : (
        <RolledSectionPicker
          designation={props.sectionDesignation}
          onDesignationChange={props.setSectionDesignation}
          onSectionApplied={props.onSectionApplied}
        />
      )}

      <CalculatorFormSection title="Geometry">
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
      </CalculatorFormSection>

      <CalculatorFormSection
        title="Loads"
        description="Add point forces, distributed loads, or moments along the span."
      >
        {(props.loads ?? []).map((load, i) => (
          <div key={i} className={calculatorLoadCardClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {load.type === "point" ? "Point load" : load.type === "udl" ? "UDL" : "Applied moment"}
              </span>
              <button type="button" className={calculatorDangerLinkClass} onClick={() => props.removeLoad(i)}>
                Remove
              </button>
            </div>

            <label className={calculatorFieldLabelClass}>
              Magnitude
              <input
                type="number"
                step="any"
                className={`${calculatorNumberInputClass} mt-1 w-full`}
                value={load.value}
                onChange={(e) =>
                  props.updateLoad(i, {
                    ...load,
                    value: +e.target.value,
                  })
                }
              />
            </label>

            {load.type === "point" || load.type === "moment" ? (
              <label className={calculatorFieldLabelClass}>
                Position along span
                <input
                  type="number"
                  step="any"
                  className={`${calculatorNumberInputClass} mt-1 w-full`}
                  value={load.position}
                  onChange={(e) =>
                    props.updateLoad(i, {
                      ...load,
                      position: +e.target.value,
                    })
                  }
                />
              </label>
            ) : load.type === "udl" ? (
              <div className={`${calculatorInputGridCompactClass}`}>
                <label className={calculatorFieldLabelClass}>
                  Start position
                  <input
                    type="number"
                    step="any"
                    className={`${calculatorNumberInputClass} mt-1 w-full`}
                    value={load.start}
                    onChange={(e) =>
                      props.updateLoad(i, {
                        ...(load as UDL),
                        start: +e.target.value,
                      })
                    }
                  />
                </label>
                <label className={calculatorFieldLabelClass}>
                  End position
                  <input
                    type="number"
                    step="any"
                    className={`${calculatorNumberInputClass} mt-1 w-full`}
                    value={load.end}
                    onChange={(e) =>
                      props.updateLoad(i, {
                        ...(load as UDL),
                        end: +e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={props.addPointLoad} className={calculatorSecondaryButtonClass}>
            + Point load
          </button>
          <button type="button" onClick={props.addUDL} className={calculatorSecondaryButtonClass}>
            + UDL
          </button>
        </div>
      </CalculatorFormSection>

      <CalculatorFormSection title="Result units">
        <div className={`${calculatorInputGridTightClass}`}>
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

      <CalculatorFormSection title="Mesh refinement" description="Increase element count for smoother curves.">
        <MeshControls elements={props.meshSegments} onChangeElements={props.setMeshSegments} refine />
      </CalculatorFormSection>
    </CalculatorInputPanel>
  );
}
