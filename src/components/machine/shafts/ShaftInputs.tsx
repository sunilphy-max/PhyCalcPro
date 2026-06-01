"use client";

import { useState } from "react";
import type { LoadCase } from "@/lib/machine/shafts/types";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { calculatorPrimaryButtonClass } from "@/components/calculator/styles";

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
  meshSegments: number;
  setMeshSegments: (value: number) => void;
  stressConcentrationFactor: number;
  setStressConcentrationFactor: (value: number) => void;
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
  meshSegments,
  setMeshSegments,
  stressConcentrationFactor,
  setStressConcentrationFactor,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [torqueInput, setTorqueInput] = useState(0);
  const [bendingMomentInput, setBendingMomentInput] = useState(0);
  const [axialInput, setAxialInput] = useState(0);
  const [positionInput, setPositionInput] = useState(length / 2);

  const addLoad = () => {
    const hasTorque = Math.abs(torqueInput) > 0;
    const hasMoment = Math.abs(bendingMomentInput) > 0;
    const hasAxial = Math.abs(axialInput) > 0;
    if (!hasTorque && !hasMoment && !hasAxial) return;

    const newLoad: LoadCase = {
      position: Math.min(Math.max(0, positionInput), length),
      ...(hasTorque ? { torque: torqueInput } : {}),
      ...(hasMoment ? { bendingMoment: bendingMomentInput } : {}),
      ...(hasAxial ? { axialForce: axialInput } : {}),
    };
    setLoads([...loads, newLoad]);
    setTorqueInput(0);
    setBendingMomentInput(0);
    setAxialInput(0);
    setPositionInput(length / 2);
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

  const formatLoadSummary = (load: LoadCase) => {
    const parts: string[] = [];
    if (load.torque) {
      parts.push(`T = ${formatEngineeringValue(load.torque, torqueUnit)}`);
    }
    if (load.bendingMoment) {
      parts.push(`M = ${formatEngineeringValue(load.bendingMoment, momentUnit)}`);
    }
    if (load.axialForce) {
      parts.push(`P = ${formatEngineeringValue(load.axialForce, forceUnit)}`);
    }
    return parts.join(" · ");
  };

  return (
    <div className="space-y-6 rounded-xl bg-white p-4 shadow-sm">
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
      />

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Shaft geometry</h3>
        <CalculatorUnitField
          label="Diameter"
          value={diameter}
          onChange={setDiameter}
          step="any"
          unit={
            <ModuleUnitSelect
              moduleId="shafts"
              fieldKey="diameter"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Length"
          value={length}
          onChange={setLength}
          step="any"
          unit={
            <ModuleUnitSelect
              moduleId="shafts"
              fieldKey="length"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Material</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Preset</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="Steel">Steel</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Titanium">Titanium</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {material === "custom" && (
          <>
            <CalculatorUnitField
              label="Elastic modulus (E)"
              value={elasticModulus}
              onChange={setElasticModulus}
              step="any"
              unit={
                <ModuleUnitSelect
                  moduleId="shafts"
                  fieldKey="stress"
                  value={modulusUnit}
                  onChange={setModulusUnit}
                />
              }
            />
            <CalculatorUnitField
              label="Shear modulus (G)"
              value={shearModulus}
              onChange={setShearModulus}
              step="any"
              unit={
                <ModuleUnitSelect
                  moduleId="shafts"
                  fieldKey="stress"
                  value={modulusUnit}
                  onChange={setModulusUnit}
                />
              }
            />
          </>
        )}
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Load cases along the shaft</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Each entry is a <strong>station</strong> at a distance from the left end. Enter the
            torsion, bending, and/or axial load acting at that station. Leave a magnitude at zero if
            that load type does not apply there, then click <strong>Add load case</strong>. You can
            add multiple stations (e.g. gear torque at mid-span and a bearing reaction near an end).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            New load case at one station
          </p>
          <CalculatorUnitField
            label="Torque (T) — torsion about shaft axis"
            value={torqueInput}
            onChange={setTorqueInput}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="shafts"
                fieldKey="torque"
                value={torqueUnit}
                onChange={setTorqueUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Bending moment (M) — about horizontal axis"
            value={bendingMomentInput}
            onChange={setBendingMomentInput}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="shafts"
                fieldKey="moment"
                value={momentUnit}
                onChange={setMomentUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Axial force (P) — tension (+) / compression (−)"
            value={axialInput}
            onChange={setAxialInput}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="shafts"
                fieldKey="force"
                value={forceUnit}
                onChange={setForceUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Position along shaft (from left end)"
            value={positionInput}
            onChange={setPositionInput}
            min={0}
            max={length}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="shafts"
                fieldKey="length"
                value={lengthUnit}
                onChange={setLengthUnit}
              />
            }
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
                    Station {index + 1} @{" "}
                    {formatEngineeringValue(load.position, lengthUnit, { digits: 3 })}
                  </div>
                  <div className="mt-1 text-slate-600">{formatLoadSummary(load)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLoad(index)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No load cases yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 border-t-0">
        <h3 className="text-sm font-semibold text-slate-900">Stress concentration</h3>
        <p className="text-xs text-slate-500">
          Kt multiplies peak von Mises stress for fillets, keyways, or shoulder steps (1.0 = none).
        </p>
        <CalculatorUnitField
          label="Stress concentration factor (Kt)"
          value={stressConcentrationFactor}
          onChange={setStressConcentrationFactor}
          min={1}
          step="any"
          unit={<span className="text-sm text-slate-500">—</span>}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 border-t-0">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <p className="text-xs text-slate-500">
          More elements along the shaft length give smoother stress and deflection curves in the
          FEA mesh.
        </p>
        <MeshControls
          elements={meshSegments}
          onChangeElements={setMeshSegments}
          minElements={10}
          maxElements={500}
        />
      </section>

      <button type="button" onClick={onCalculate} className={calculatorPrimaryButtonClass}>
        Solve
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save project"}
      </button>
    </div>
  );
}
