"use client";

import { useState } from "react";
import type {
  BearingSupport,
  KeywayStyle,
  LoadCase,
  ShaftLoadKind,
  ShaftSegment,
  StressFeature,
  StressFeatureType,
} from "@/lib/machine/shafts/types";
import {
  createShaftStation,
  inferShaftLoadKind,
  SHAFT_LOAD_KINDS,
  shaftLoadKindLabel,
} from "@/lib/machine/shafts/loadKind";
import ShaftLoadLibrary from "@/components/machine/shafts/ShaftLoadLibrary";
import type { SurfaceFinish } from "@/lib/materials/fatigue/types";
import type { Din743MeanStressCase } from "@/lib/machine/shafts/din743/types";
import type { Din743HeatTreatment, Din743SurfaceProcess } from "@/data/catalogs/din743/types";
import type { Agma6001DutyClass, Agma6001InterfaceKind } from "@/lib/machine/shafts/agma6001/interfaceLoads";
import { DIN743_MATERIAL_CATALOG } from "@/data/catalogs/din743/materials";
import { featureTypeLabel } from "@/lib/machine/shafts/stressConcentration";
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
  alternatingTorqueFraction: number;
  setAlternatingTorqueFraction: (v: number) => void;
  useNotchSensitivity: boolean;
  setUseNotchSensitivity: (v: boolean) => void;
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
  din743MaterialId: string;
  setDin743MaterialId: (v: string) => void;
  din743HeatTreatment: Din743HeatTreatment | "";
  setDin743HeatTreatment: (v: Din743HeatTreatment | "") => void;
  din743Rz: number;
  setDin743Rz: (v: number) => void;
  din743SurfaceProcess: Din743SurfaceProcess;
  setDin743SurfaceProcess: (v: Din743SurfaceProcess) => void;
  din743MeanCase: Din743MeanStressCase;
  setDin743MeanCase: (v: Din743MeanStressCase) => void;
  agma6001Enabled: boolean;
  setAgma6001Enabled: (v: boolean) => void;
  agma6001Kind: Agma6001InterfaceKind;
  setAgma6001Kind: (v: Agma6001InterfaceKind) => void;
  agma6001Duty: Agma6001DutyClass;
  setAgma6001Duty: (v: Agma6001DutyClass) => void;
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

function updateFeature(features: StressFeature[], index: number, patch: Partial<StressFeature>) {
  const next = [...features];
  next[index] = { ...next[index]!, ...patch };
  return next;
}

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
  alternatingTorqueFraction,
  setAlternatingTorqueFraction,
  useNotchSensitivity,
  setUseNotchSensitivity,
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
  din743MaterialId,
  setDin743MaterialId,
  din743HeatTreatment,
  setDin743HeatTreatment,
  din743Rz,
  setDin743Rz,
  din743SurfaceProcess,
  setDin743SurfaceProcess,
  din743MeanCase,
  setDin743MeanCase,
  agma6001Enabled,
  setAgma6001Enabled,
  agma6001Kind,
  setAgma6001Kind,
  agma6001Duty,
  setAgma6001Duty,
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
    newLoad.kind = inferShaftLoadKind(newLoad);
    setLoads([...loads, newLoad]);
    setTorqueInput(0);
    setBendingMomentInput(0);
    setAxialInput(0);
    setTransverseInput(0);
    setPositionInput(length / 2);
  };

  const addLibraryStation = (kind: ShaftLoadKind) => {
    setLoads([...loads, createShaftStation(kind, length / 2, length)]);
  };

  const updateLoad = (index: number, patch: Partial<LoadCase>) => {
    const next = [...loads];
    next[index] = { ...next[index]!, ...patch };
    setLoads(next);
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

  const addFeature = (type: StressFeatureType) => {
    const base: StressFeature = {
      position: length / 2,
      type,
    };
    if (type === "shoulder_fillet") {
      setStressFeatures([
        ...stressFeatures,
        {
          ...base,
          largerDiameter: diameter * 1.2,
          smallerDiameter: diameter,
          filletRadius: diameter * 0.05,
        },
      ]);
    } else if (type === "keyway") {
      setStressFeatures([
        ...stressFeatures,
        { ...base, keywayStyle: "sled_runner", smallerDiameter: diameter },
      ]);
    } else if (type === "retaining_ring") {
      setStressFeatures([
        ...stressFeatures,
        {
          ...base,
          smallerDiameter: diameter,
          grooveDepth: diameter * 0.03,
          grooveWidth: diameter * 0.04,
          axialRetentionLoad: 0,
        },
      ]);
    } else {
      setStressFeatures([...stressFeatures, { ...base, customKt: 2 }]);
    }
  };

  return (
    <CalculatorInputPanel
      title="Shaft design"
      description="Full shaft worksheet: static + combined loading, fatigue (Goodman/Kf), bearings, keys, retaining rings, and critical speed."
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
          label="Operating speed (RPM) — fatigue, critical speed, bearing L10"
          value={operatingRpm}
          onChange={setOperatingRpm}
          min={0}
          step="any"
          unit={<span className="text-sm text-slate-500">RPM</span>}
        />
        <CalculatorNumberField
          label="Alternating torque fraction (0 = steady torsion, 1 = fully reversing)"
          value={alternatingTorqueFraction}
          onChange={setAlternatingTorqueFraction}
          min={0}
          max={1}
          step={0.05}
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
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={useNotchSensitivity}
            onChange={(e) => setUseNotchSensitivity(e.target.checked)}
          />
          Apply notch sensitivity (Kf = 1 + q(Kt − 1))
        </label>
      </section>

      <CalculatorFormSection
        title="DIN 743 EU worksheet"
        description="Parts 1–3: material catalog, notch α/β, size/surface factors, multi-station fatigue & static safety (Smin ≥ 1.2)."
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">DIN 743-3 material</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={din743MaterialId}
            onChange={(e) => setDin743MaterialId(e.target.value)}
          >
            <option value="">Auto-match from Su</option>
            {DIN743_MATERIAL_CATALOG.map((m) => (
              <option key={m.id} value={m.id}>
                {m.designation} (σB={m.sigmaB_MPa} MPa)
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Heat treatment override</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={din743HeatTreatment}
            onChange={(e) => setDin743HeatTreatment(e.target.value as Din743HeatTreatment | "")}
          >
            <option value="">From catalog material</option>
            <option value="normalized">Normalized</option>
            <option value="quenched_tempered">Quenched & tempered</option>
            <option value="case_hardened">Case hardened</option>
            <option value="nitrided">Nitrided</option>
            <option value="induction_hardened">Induction hardened</option>
          </select>
        </div>
        <div className={calculatorInputGridTightClass}>
          <CalculatorNumberField label="Rz roughness (µm)" value={din743Rz} onChange={setDin743Rz} min={0.4} step={0.1} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Surface process KV</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={din743SurfaceProcess}
              onChange={(e) => setDin743SurfaceProcess(e.target.value as Din743SurfaceProcess)}
            >
              <option value="none">None (KV=1)</option>
              <option value="rolled">Rolled</option>
              <option value="shot_peened">Shot peened</option>
              <option value="nitrided_surface">Nitrided surface</option>
              <option value="induction_surface">Induction surface</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mean-stress case</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={din743MeanCase}
              onChange={(e) => setDin743MeanCase(Number(e.target.value) as Din743MeanStressCase)}
            >
              <option value={1}>Case 1 — constant mean</option>
              <option value={2}>Case 2 — proportional</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Manual overrides below only apply when &gt; 1; otherwise K_σ, K_τ, γ_F are computed from DIN 743-2.
        </p>
        <div className={calculatorInputGridTightClass}>
          <CalculatorNumberField
            label="K_σ override"
            value={din743K_sigma}
            onChange={setDin743K_sigma}
            step={0.05}
            min={1}
          />
          <CalculatorNumberField
            label="K_τ override"
            value={din743K_tau}
            onChange={setDin743K_tau}
            step={0.05}
            min={1}
          />
          <CalculatorNumberField
            label="γ_F override"
            value={din743Gamma_F}
            onChange={setDin743Gamma_F}
            step={0.05}
            min={1}
          />
        </div>
      </CalculatorFormSection>

      <CalculatorFormSection
        title="AGMA 6001 interface loads (US)"
        description="Optional application / overload templates for gearing and belt drives on the shaft."
      >
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={agma6001Enabled}
            onChange={(e) => setAgma6001Enabled(e.target.checked)}
          />
          Enable AGMA 6001 load template
        </label>
        {agma6001Enabled && (
          <div className={calculatorInputGridTightClass}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Interface</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={agma6001Kind}
                onChange={(e) => setAgma6001Kind(e.target.value as Agma6001InterfaceKind)}
              >
                <option value="helical_gear">Helical gear</option>
                <option value="spur_gear">Spur gear</option>
                <option value="bevel_gear">Bevel gear</option>
                <option value="worm_gear">Worm gear</option>
                <option value="v_belt">V-belt</option>
                <option value="chain">Chain</option>
                <option value="coupling">Coupling</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Duty</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={agma6001Duty}
                onChange={(e) => setAgma6001Duty(e.target.value as Agma6001DutyClass)}
              >
                <option value="uniform">Uniform</option>
                <option value="light_shock">Light shock</option>
                <option value="moderate_shock">Moderate shock</option>
                <option value="heavy_shock">Heavy shock</option>
              </select>
            </div>
          </div>
        )}
      </CalculatorFormSection>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Load stations</h3>
        <p className="text-xs text-slate-500">
          Place Gear, Pulley, Torque, Bending, or Force stations. Combined loading is analyzed as von
          Mises + principal stress (torsion is not shown separately).
        </p>
        <ShaftLoadLibrary onAdd={addLibraryStation} />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-700">Or enter components manually</p>
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
            {loads.map((load, index) => {
              const kind = inferShaftLoadKind(load);
              return (
                <li
                  key={`${index}-${load.position}-${kind}`}
                  className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
                          value={kind}
                          onChange={(e) =>
                            updateLoad(index, { kind: e.target.value as ShaftLoadKind })
                          }
                        >
                          {SHAFT_LOAD_KINDS.map((k) => (
                            <option key={k} value={k}>
                              {shaftLoadKindLabel(k)}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-slate-500">
                          Station {index + 1}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        Position
                        <input
                          type="number"
                          className="w-24 rounded border px-2 py-1"
                          value={load.position}
                          min={0}
                          max={length}
                          step="any"
                          onChange={(e) =>
                            updateLoad(index, {
                              position: Math.min(Math.max(0, Number(e.target.value)), length),
                            })
                          }
                        />
                        <span>{lengthUnit}</span>
                      </label>
                      <div className="text-slate-600">{formatLoadSummary(load)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLoad(index)}
                      className="shrink-0 text-xs font-medium text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No stations yet — use the load library above.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Stress concentrations & features</h3>
        <CalculatorUnitField
          label="Global Kt (fallback)"
          value={stressConcentrationFactor}
          onChange={setStressConcentrationFactor}
          min={1}
          step="any"
          unit={<span className="text-sm text-slate-500">—</span>}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addFeature("shoulder_fillet")} className="text-xs font-medium text-blue-600">
            + Shoulder fillet
          </button>
          <button type="button" onClick={() => addFeature("keyway")} className="text-xs font-medium text-blue-600">
            + Keyway
          </button>
          <button type="button" onClick={() => addFeature("retaining_ring")} className="text-xs font-medium text-blue-600">
            + Retaining ring groove
          </button>
          <button type="button" onClick={() => addFeature("custom")} className="text-xs font-medium text-blue-600">
            + Custom Kt
          </button>
        </div>

        {stressFeatures.map((f, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-800">{featureTypeLabel(f.type)}</span>
              <button
                type="button"
                className="text-red-600"
                onClick={() => setStressFeatures(stressFeatures.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-slate-600">Position</span>
              <input
                type="number"
                className="w-full rounded border px-2 py-1"
                value={f.position}
                onChange={(e) =>
                  setStressFeatures(updateFeature(stressFeatures, i, { position: Number(e.target.value) }))
                }
              />
            </label>

            {f.type === "shoulder_fillet" && (
              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="text-slate-600">D large</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.largerDiameter ?? diameter * 1.2}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, { largerDiameter: Number(e.target.value) })
                      )
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-600">d small</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.smallerDiameter ?? diameter}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, { smallerDiameter: Number(e.target.value) })
                      )
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-600">Fillet r</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.filletRadius ?? diameter * 0.05}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, { filletRadius: Number(e.target.value) })
                      )
                    }
                  />
                </label>
              </div>
            )}

            {f.type === "keyway" && (
              <label className="block space-y-1">
                <span className="text-slate-600">Keyway style</span>
                <select
                  className="w-full rounded border px-2 py-1"
                  value={f.keywayStyle ?? "sled_runner"}
                  onChange={(e) =>
                    setStressFeatures(
                      updateFeature(stressFeatures, i, {
                        keywayStyle: e.target.value as KeywayStyle,
                      })
                    )
                  }
                >
                  <option value="sled_runner">Sled-runner (Kt≈1.6)</option>
                  <option value="end_milled">End-milled (Kt≈2.14)</option>
                </select>
              </label>
            )}

            {f.type === "retaining_ring" && (
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-slate-600">Groove depth</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.grooveDepth ?? diameter * 0.03}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, { grooveDepth: Number(e.target.value) })
                      )
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-600">Groove width</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.grooveWidth ?? diameter * 0.04}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, { grooveWidth: Number(e.target.value) })
                      )
                    }
                  />
                </label>
                <label className="col-span-2 space-y-1">
                  <span className="text-slate-600">Axial retention load ({forceUnit})</span>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1"
                    value={f.axialRetentionLoad ?? 0}
                    onChange={(e) =>
                      setStressFeatures(
                        updateFeature(stressFeatures, i, {
                          axialRetentionLoad: Number(e.target.value),
                        })
                      )
                    }
                  />
                </label>
              </div>
            )}

            {f.type === "custom" && (
              <label className="block space-y-1">
                <span className="text-slate-600">Custom Kt</span>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={f.customKt ?? 2}
                  min={1}
                  step={0.05}
                  onChange={(e) =>
                    setStressFeatures(updateFeature(stressFeatures, i, { customKt: Number(e.target.value) }))
                  }
                />
              </label>
            )}
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
