"use client";

import { useState } from "react";
import type {
  BearingSupport,
  LoadCase,
  ShaftSegment,
  StressFeature,
} from "@/lib/machine/shafts/types";
import type { SurfaceFinish } from "@/lib/materials/fatigue/types";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import MaterialSelect from "@/components/materials/MaterialSelect";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { calculatorInputGridTightClass } from "@/components/calculator/styles";

export type SupportPreset = "fixed_left" | "simply_supported" | "custom";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
  diameter: number;
  setDiameter: (v: number) => void;
  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (u: string) => void;
  material: string;
  setMaterial: (m: string) => void;
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  shearModulus: number;
  setShearModulus: (v: number) => void;
  modulusUnit: string;
  setModulusUnit: (u: string) => void;
  torqueUnit: string;
  setTorqueUnit: (u: string) => void;
  momentUnit: string;
  setMomentUnit: (u: string) => void;
  forceUnit: string;
  setForceUnit: (u: string) => void;
  loads: LoadCase[];
  setLoads: (loads: LoadCase[]) => void;
  supports: BearingSupport[];
  setSupports: (s: BearingSupport[]) => void;
  supportPreset: SupportPreset;
  setSupportPreset: (p: SupportPreset) => void;
  segments: ShaftSegment[];
  setSegments: (s: ShaftSegment[]) => void;
  useSteppedGeometry: boolean;
  setUseSteppedGeometry: (v: boolean) => void;
  stressFeatures: StressFeature[];
  setStressFeatures: (f: StressFeature[]) => void;
  operatingRpm: number;
  setOperatingRpm: (v: number) => void;
  includeSelfWeight: boolean;
  setIncludeSelfWeight: (v: boolean) => void;
  surfaceFinish: SurfaceFinish;
  setSurfaceFinish: (f: SurfaceFinish) => void;
  meshSegments: number;
  setMeshSegments: (value: number) => void;
  stressConcentrationFactor: number;
  setStressConcentrationFactor: (value: number) => void;
  din743K_sigma: number;
  setDin743K_sigma: (v: number) => void;
  din743K_tau: number;
  setDin743K_tau: (v: number) => void;
  din743Gamma_F: number;
  setDin743Gamma_F: (v: number) => void;
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function ShaftInputs({
  projectName,
  setProjectName,
  diameter,
  setDiameter,
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  material,
  setMaterial,
  elasticModulus,
  setElasticModulus,
  shearModulus,
  setShearModulus,
  modulusUnit,
  setModulusUnit,
  torqueUnit,
  setTorqueUnit,
  momentUnit,
  setMomentUnit,
  forceUnit,
  setForceUnit,
  loads,
  setLoads,
  supports,
  setSupports,
  supportPreset,
  setSupportPreset,
  segments,
  setSegments,
  useSteppedGeometry,
  setUseSteppedGeometry,
  stressFeatures,
  setStressFeatures,
  operatingRpm,
  setOperatingRpm,
  includeSelfWeight,
  setIncludeSelfWeight,
  surfaceFinish,
  setSurfaceFinish,
  meshSegments,
  setMeshSegments,
  stressConcentrationFactor,
  setStressConcentrationFactor,
  din743K_sigma,
  setDin743K_sigma,
  din743K_tau,
  setDin743K_tau,
  din743Gamma_F,
  setDin743Gamma_F,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [torqueInput, setTorqueInput] = useState(0);
  const [bendingMomentInput, setBendingMomentInput] = useState(0);
  const [axialInput, setAxialInput] = useState(0);
  const [transverseInput, setTransverseInput] = useState(0);
  const [positionInput, setPositionInput] = useState(length / 2);

  const addLoad = () => {
    const hasTorque = Math.abs(torqueInput) > 0;
    const hasMoment = Math.abs(bendingMomentInput) > 0;
    const hasAxial = Math.abs(axialInput) > 0;
    const hasTransverse = Math.abs(transverseInput) > 0;
    if (!hasTorque && !hasMoment && !hasAxial && !hasTransverse) return;

    const newLoad: LoadCase = {
      position: Math.min(Math.max(0, positionInput), length),
      ...(hasTorque ? { torque: torqueInput } : {}),
      ...(hasMoment ? { bendingMoment: bendingMomentInput } : {}),
      ...(hasAxial ? { axialForce: axialInput } : {}),
      ...(hasTransverse ? { transverseForce: transverseInput } : {}),
    };
    setLoads([...loads, newLoad]);
    setTorqueInput(0);
    setBendingMomentInput(0);
    setAxialInput(0);
    setTransverseInput(0);
    setPositionInput(length / 2);
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

  const formatLoadSummary = (load: LoadCase) => {
    const parts: string[] = [];
    if (load.torque) parts.push(`T = ${formatEngineeringValue(load.torque, torqueUnit)}`);
    if (load.bendingMoment) parts.push(`M = ${formatEngineeringValue(load.bendingMoment, momentUnit)}`);
    if (load.axialForce) parts.push(`P = ${formatEngineeringValue(load.axialForce, forceUnit)}`);
    if (load.transverseForce) parts.push(`F = ${formatEngineeringValue(load.transverseForce, forceUnit)}`);
    return parts.join(" · ");
  };

  const applySupportPreset = (preset: SupportPreset) => {
    setSupportPreset(preset);
    if (preset === "fixed_left") {
      setSupports([{ position: 0, type: "fixed" }]);
    } else if (preset === "simply_supported") {
      setSupports([
        { position: 0, type: "pin" },
        { position: length, type: "pin" },
      ]);
    }
  };

  const addSegment = () => {
    setSegments([
      ...segments,
      { length: length / Math.max(segments.length + 1, 1), outerDiameter: diameter, innerDiameter: 0 },
    ]);
  };

  const addShoulderFeature = () => {
    setStressFeatures([
      ...stressFeatures,
      {
        position: length / 2,
        type: "shoulder_fillet",
        largerDiameter: diameter * 1.2,
        smallerDiameter: diameter,
        filletRadius: diameter * 0.02,
      },
    ]);
  };

  return (
    <CalculatorInputPanel
      title="Shaft design"
      description="FEA shaft analysis: stepped geometry, bearings, transverse loads, fatigue, and critical speed."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={onCalculate} label="Solve shaft" designAware />
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
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
      />

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Shaft geometry</h3>
        <CalculatorUnitField
          label="Diameter (uniform shaft)"
          value={diameter}
          onChange={setDiameter}
          step="any"
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Total length"
          value={length}
          onChange={setLength}
          step="any"
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={useSteppedGeometry}
            onChange={(e) => setUseSteppedGeometry(e.target.checked)}
          />
          Stepped / hollow segments
        </label>
        {useSteppedGeometry && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {segments.map((seg, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-xs">
                <input
                  className="rounded border px-2 py-1"
                  type="number"
                  value={seg.length}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...seg, length: Number(e.target.value) };
                    setSegments(next);
                  }}
                  placeholder="Length"
                />
                <input
                  className="rounded border px-2 py-1"
                  type="number"
                  value={seg.outerDiameter}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...seg, outerDiameter: Number(e.target.value) };
                    setSegments(next);
                  }}
                  placeholder="OD"
                />
                <input
                  className="rounded border px-2 py-1"
                  type="number"
                  value={seg.innerDiameter ?? 0}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...seg, innerDiameter: Number(e.target.value) };
                    setSegments(next);
                  }}
                  placeholder="ID (0=solid)"
                />
              </div>
            ))}
            <button type="button" onClick={addSegment} className="text-xs font-medium text-blue-600">
              + Add segment
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Bearings / supports</h3>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={supportPreset}
          onChange={(e) => applySupportPreset(e.target.value as SupportPreset)}
        >
          <option value="fixed_left">Fixed at left (cantilever-style)</option>
          <option value="simply_supported">Simply supported (pin both ends)</option>
          <option value="custom">Custom positions</option>
        </select>
        {supportPreset === "custom" && (
          <div className="space-y-2 text-sm">
            {supports.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="number"
                  className="w-24 rounded border px-2 py-1"
                  value={s.position}
                  onChange={(e) => {
                    const next = [...supports];
                    next[i] = { ...s, position: Number(e.target.value) };
                    setSupports(next);
                  }}
                />
                <select
                  className="flex-1 rounded border px-2 py-1"
                  value={s.type}
                  onChange={(e) => {
                    const next = [...supports];
                    next[i] = { ...s, type: e.target.value as BearingSupport["type"] };
                    setSupports(next);
                  }}
                >
                  <option value="pin">Pin (journal)</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-blue-600"
              onClick={() => setSupports([...supports, { position: length / 2, type: "pin" }])}
            >
              + Add support
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Operating conditions</h3>
        <CalculatorUnitField
          label="Operating speed (RPM) — for fatigue & critical speed margin"
          value={operatingRpm}
          onChange={setOperatingRpm}
          min={0}
          step="any"
          unit={<span className="text-sm text-slate-500">RPM</span>}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={includeSelfWeight}
            onChange={(e) => setIncludeSelfWeight(e.target.checked)}
          />
          Include shaft self-weight
        </label>
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Material</h3>
        <MaterialSelect
          profile="machine-shaft"
          value={material}
          onChange={setMaterial}
          allowCustom
        />
        {material === CUSTOM_MATERIAL && (
          <>
            <CalculatorUnitField
              label="Elastic modulus (E)"
              value={elasticModulus}
              onChange={setElasticModulus}
              step="any"
              unit={
                <ModuleUnitSelect moduleId="shafts" fieldKey="stress" value={modulusUnit} onChange={setModulusUnit} />
              }
            />
            <CalculatorUnitField
              label="Shear modulus (G)"
              value={shearModulus}
              onChange={setShearModulus}
              step="any"
              unit={
                <ModuleUnitSelect moduleId="shafts" fieldKey="stress" value={modulusUnit} onChange={setModulusUnit} />
              }
            />
          </>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Surface finish (fatigue)</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={surfaceFinish}
            onChange={(e) => setSurfaceFinish(e.target.value as SurfaceFinish)}
          >
            <option value="ground">Ground</option>
            <option value="machined">Machined</option>
            <option value="hot-rolled">Hot rolled</option>
            <option value="as-forged">As forged</option>
          </select>
        </div>
      </section>

      <CalculatorFormSection
        title="DIN 743 coefficients"
        description="Influence and fatigue reduction factors for EU shaft worksheets (K_σ, K_τ, γ_F)."
      >
        <div className={calculatorInputGridTightClass}>
          <CalculatorNumberField
            label="K_σ bending"
            value={din743K_sigma}
            onChange={setDin743K_sigma}
            step={0.05}
            min={1}
          />
          <CalculatorNumberField
            label="K_τ torsion"
            value={din743K_tau}
            onChange={setDin743K_tau}
            step={0.05}
            min={1}
          />
          <CalculatorNumberField
            label="γ_F fatigue"
            value={din743Gamma_F}
            onChange={setDin743Gamma_F}
            step={0.05}
            min={1}
          />
        </div>
      </CalculatorFormSection>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Load cases</h3>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <CalculatorUnitField
            label="Torque (T)"
            value={torqueInput}
            onChange={setTorqueInput}
            step="any"
            unit={<ModuleUnitSelect moduleId="shafts" fieldKey="torque" value={torqueUnit} onChange={setTorqueUnit} />}
          />
          <CalculatorUnitField
            label="Bending moment (M)"
            value={bendingMomentInput}
            onChange={setBendingMomentInput}
            step="any"
            unit={<ModuleUnitSelect moduleId="shafts" fieldKey="moment" value={momentUnit} onChange={setMomentUnit} />}
          />
          <CalculatorUnitField
            label="Transverse force (F)"
            value={transverseInput}
            onChange={setTransverseInput}
            step="any"
            unit={<ModuleUnitSelect moduleId="shafts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
          />
          <CalculatorUnitField
            label="Axial force (P)"
            value={axialInput}
            onChange={setAxialInput}
            step="any"
            unit={<ModuleUnitSelect moduleId="shafts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
          />
          <CalculatorUnitField
            label="Position from left end"
            value={positionInput}
            onChange={setPositionInput}
            min={0}
            max={length}
            step="any"
            unit={<ModuleUnitSelect moduleId="shafts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />}
          />
          <button
            type="button"
            onClick={addLoad}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Add load case
          </button>
        </div>
        {loads.length > 0 ? (
          <ul className="space-y-2">
            {loads.map((load, index) => (
              <li
                key={`${index}-${load.position}`}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    Station {index + 1} @ {formatEngineeringValue(load.position, lengthUnit, { digits: 3 })}
                  </div>
                  <div className="mt-1 text-slate-600">{formatLoadSummary(load)}</div>
                </div>
                <button type="button" onClick={() => removeLoad(index)} className="shrink-0 text-xs font-medium text-red-600">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No load cases yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Stress concentrations</h3>
        <CalculatorUnitField
          label="Global Kt (fallback)"
          value={stressConcentrationFactor}
          onChange={setStressConcentrationFactor}
          min={1}
          step="any"
          unit={<span className="text-sm text-slate-500">—</span>}
        />
        <button type="button" onClick={addShoulderFeature} className="text-xs font-medium text-blue-600">
          + Add shoulder fillet feature
        </button>
        {stressFeatures.map((f, i) => (
          <div key={i} className="text-xs text-slate-600">
            {f.type} @ {formatEngineeringValue(f.position, lengthUnit)}
            <button
              type="button"
              className="ml-2 text-red-600"
              onClick={() => setStressFeatures(stressFeatures.filter((_, j) => j !== i))}
            >
              remove
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={meshSegments} onChangeElements={setMeshSegments} minElements={10} maxElements={500} />
      </section>
    </CalculatorInputPanel>
  );
}
