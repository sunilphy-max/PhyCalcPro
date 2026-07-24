"use client";

import { useState } from "react";
import type { ScrewConfig, ScrewType, ThreadType } from "@/lib/fasteners/bolts/types";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { fromBase, toBase } from "@/lib/units/conversions";
import {
  calculatorFieldLabelClass,
  calculatorInputGridClass,
  calculatorNumberInputClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
  config: ScrewConfig;
  setConfig: (config: ScrewConfig) => void;
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function PowerScrewInputs({
  projectName,
  setProjectName,
  config,
  setConfig,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [screwType, setScrewType] = useState<ScrewType>(config.screwType);
  const [diameterUnit, setDiameterUnit] = useState("mm");
  const [forceUnit, setForceUnit] = useState("N");

  const updateConfig = (updates: Partial<ScrewConfig>) => {
    setConfig({ ...config, ...updates } as ScrewConfig);
  };

  const handleScrewTypeChange = (newType: ScrewType) => {
    setScrewType(newType);
    if (newType === "power_screw") {
      setConfig({
        screwType: "power_screw",
        threadType: "square",
        majorDiameter: 0.05,
        pitch: 0.01,
        lead: 0.01,
        length: 0.5,
        axialForce: 10000,
        frictionCoefficient: 0.15,
        starts: 1,
      });
    } else {
      setConfig({
        screwType: "ball_screw",
        majorDiameter: 0.05,
        pitch: 0.01,
        lead: 0.01,
        ballDiameter: 0.006,
        contactAngle: 45,
        axialForce: 10000,
        frictionCoefficient: 0.003,
        speed: 1000,
      });
    }
  };

  const renderDiameterSelect = () => (
    <ModuleUnitSelect
      moduleId="power-screws"
      fieldKey="diameter"
      value={diameterUnit}
      onChange={setDiameterUnit}
    />
  );
  const renderForceSelect = () => (
    <ModuleUnitSelect
      moduleId="power-screws"
      fieldKey="force"
      value={forceUnit}
      onChange={setForceUnit}
    />
  );

  return (
    <CalculatorInputPanel
      title="Power & ball screws"
      description="MITCalc-style lead screw worksheet — torque, efficiency, and safety screening for power screws and ball screws."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={onCalculate} label="Calculate screw drive" designAware />
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save project"}
          </button>
        </div>
      }
    >
      <input
        className={calculatorTextInputClass}
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
      />

      <CalculatorFormSection title="Screw type">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleScrewTypeChange("power_screw")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              screwType === "power_screw" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            Power screw
          </button>
          <button
            type="button"
            onClick={() => handleScrewTypeChange("ball_screw")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              screwType === "ball_screw" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            Ball screw
          </button>
        </div>
      </CalculatorFormSection>

      {screwType === "power_screw" && config.screwType === "power_screw" && (
        <CalculatorFormSection title="Power screw geometry & load">
          <label className="space-y-2">
            <span className={calculatorFieldLabelClass}>Thread type</span>
            <select
              value={config.threadType}
              onChange={(e) => updateConfig({ threadType: e.target.value as ThreadType })}
              className={calculatorSelectClass}
            >
              <option value="square">Square</option>
              <option value="acme">Acme</option>
              <option value="buttress">Buttress</option>
            </select>
          </label>
          <div className={calculatorInputGridClass}>
            <CalculatorUnitField
              label="Major diameter"
              value={fromBase(config.majorDiameter, "length", diameterUnit)}
              onChange={(v) => updateConfig({ majorDiameter: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <CalculatorUnitField
              label="Pitch"
              value={fromBase(config.pitch, "length", diameterUnit)}
              onChange={(v) => updateConfig({ pitch: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <CalculatorUnitField
              label="Lead"
              value={fromBase(config.lead ?? config.pitch, "length", diameterUnit)}
              onChange={(v) => updateConfig({ lead: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <label className="space-y-2 text-sm text-slate-700">
              <span>Starts</span>
              <input
                type="number"
                min={1}
                value={config.starts ?? 1}
                onChange={(e) => updateConfig({ starts: parseInt(e.target.value, 10) })}
                className={calculatorNumberInputClass}
              />
            </label>
            <CalculatorUnitField
              label="Axial force"
              value={fromBase(config.axialForce, "force", forceUnit)}
              onChange={(v) => updateConfig({ axialForce: toBase(v, "force", forceUnit) })}
              unit={renderForceSelect()}
            />
            <label className="space-y-2 text-sm text-slate-700">
              <span>Friction coefficient μ</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={1}
                value={config.frictionCoefficient}
                onChange={(e) => updateConfig({ frictionCoefficient: parseFloat(e.target.value) })}
                className={calculatorNumberInputClass}
              />
            </label>
          </div>
        </CalculatorFormSection>
      )}

      {screwType === "ball_screw" && config.screwType === "ball_screw" && (
        <CalculatorFormSection title="Ball screw geometry & duty">
          <div className={calculatorInputGridClass}>
            <CalculatorUnitField
              label="Major diameter"
              value={fromBase(config.majorDiameter, "length", diameterUnit)}
              onChange={(v) => updateConfig({ majorDiameter: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <CalculatorUnitField
              label="Pitch"
              value={fromBase(config.pitch, "length", diameterUnit)}
              onChange={(v) => updateConfig({ pitch: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <CalculatorUnitField
              label="Ball diameter"
              value={fromBase(config.ballDiameter, "length", diameterUnit)}
              onChange={(v) => updateConfig({ ballDiameter: toBase(v, "length", diameterUnit) })}
              unit={renderDiameterSelect()}
            />
            <label className="space-y-2 text-sm text-slate-700">
              <span>Contact angle (°)</span>
              <input
                type="number"
                value={config.contactAngle}
                onChange={(e) => updateConfig({ contactAngle: parseFloat(e.target.value) })}
                className={calculatorNumberInputClass}
              />
            </label>
            <CalculatorUnitField
              label="Axial force"
              value={fromBase(config.axialForce, "force", forceUnit)}
              onChange={(v) => updateConfig({ axialForce: toBase(v, "force", forceUnit) })}
              unit={renderForceSelect()}
            />
            <label className="space-y-2 text-sm text-slate-700">
              <span>Speed (rpm)</span>
              <input
                type="number"
                value={config.speed}
                onChange={(e) => updateConfig({ speed: parseFloat(e.target.value) })}
                className={calculatorNumberInputClass}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Friction coefficient</span>
              <input
                type="number"
                step={0.001}
                value={config.frictionCoefficient}
                onChange={(e) => updateConfig({ frictionCoefficient: parseFloat(e.target.value) })}
                className={calculatorNumberInputClass}
              />
            </label>
          </div>
        </CalculatorFormSection>
      )}
    </CalculatorInputPanel>
  );
}
