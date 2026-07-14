"use client";

import type { Dispatch, SetStateAction } from "react";
import { Box, Gauge, Layers, Ruler } from "lucide-react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import CalculatorInputSteps from "@/components/machine/bearings-shared/CalculatorInputSteps";
import PlainBearingTypePicker from "@/components/machine/plain-bearings/PlainBearingTypePicker";
import PlainBearingReferenceVisual from "@/components/machine/plain-bearings/PlainBearingReferenceVisual";
import type { PlainBearingType } from "@/lib/machine/plain-bearings/types";

type Props = {
  bearingType: PlainBearingType;
  setBearingType: Dispatch<SetStateAction<PlainBearingType>>;
  load: number;
  setLoad: Dispatch<SetStateAction<number>>;
  loadUnit: string;
  setLoadUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  diameter: number;
  setDiameter: Dispatch<SetStateAction<number>>;
  length: number;
  setLength: Dispatch<SetStateAction<number>>;
  clearance: number;
  setClearance: Dispatch<SetStateAction<number>>;
  viscosity: number;
  setViscosity: Dispatch<SetStateAction<number>>;
  padDiameterRatio: number;
  setPadDiameterRatio: Dispatch<SetStateAction<number>>;
  padCount: number;
  setPadCount: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
};

const STEPS = [
  {
    id: "application",
    label: "Application",
    description: "Bearing family — journal, thrust pad, or tilting pad",
    icon: Layers,
  },
  {
    id: "loads",
    label: "Loads",
    description: "Applied load for film and specific-pressure screening",
    icon: Box,
  },
  {
    id: "operating",
    label: "Operating",
    description: "Speed and lubricant viscosity",
    icon: Gauge,
  },
  {
    id: "geometry",
    label: "Geometry",
    description: "Diameter, length/pads, and clearance",
    icon: Ruler,
  },
];

export default function PlainBearingsInputs(props: Props) {
  const isJournal = props.bearingType === "journal";

  return (
    <CalculatorInputPanel
      title="Plain bearing"
      description="Hydrodynamic journal, thrust pad and tilting-pad thrust screening. Calculation standard is set above — type stays free."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={props.onCalculate} label="Calculate bearing" designAware />
          {props.onSave && props.setProjectName != null ? (
            <>
              <input
                type="text"
                value={props.projectName ?? ""}
                onChange={(e) => props.setProjectName?.(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                placeholder="Project name"
              />
              <button
                type="button"
                onClick={props.onSave}
                disabled={props.saving}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {props.saving ? "Saving..." : "Save project"}
              </button>
            </>
          ) : null}
        </div>
      }
    >
      <CalculatorInputSteps steps={STEPS} ariaLabel="Plain bearing input steps">
        {(activeTab) => (
          <>
            {activeTab === "application" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Bearing type</p>
                  <PlainBearingTypePicker
                    value={props.bearingType}
                    onChange={props.setBearingType}
                  />
                </div>
                <PlainBearingReferenceVisual bearingType={props.bearingType} />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Application presets set safety / service factors only — they do not lock this type.
                </p>
              </div>
            ) : null}

            {activeTab === "loads" ? (
              <div className={calculatorInputGridClass}>
                <CalculatorUnitField
                  label={isJournal ? "Radial load" : "Axial thrust load"}
                  value={props.load}
                  onChange={props.setLoad}
                  unit={
                    <ModuleUnitSelect
                      moduleId="plain-bearings"
                      fieldKey="load"
                      value={props.loadUnit}
                      onChange={props.setLoadUnit}
                    />
                  }
                />
              </div>
            ) : null}

            {activeTab === "operating" ? (
              <div className={calculatorInputGridClass}>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Shaft speed (rpm)</span>
                  <input
                    type="number"
                    value={props.speed}
                    onChange={(e) => props.setSpeed(Number(e.target.value))}
                    className={calculatorNumberInputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Dynamic viscosity (Pa·s)</span>
                  <input
                    type="number"
                    step="0.001"
                    value={props.viscosity}
                    onChange={(e) => props.setViscosity(Number(e.target.value))}
                    className={calculatorNumberInputClass}
                  />
                </label>
              </div>
            ) : null}

            {activeTab === "geometry" ? (
              <div className={calculatorInputGridClass}>
                <CalculatorUnitField
                  label={isJournal ? "Journal diameter" : "Pad outer diameter"}
                  value={props.diameter}
                  onChange={props.setDiameter}
                  unit={
                    <ModuleUnitSelect
                      moduleId="plain-bearings"
                      fieldKey="diameter"
                      value={props.lengthUnit}
                      onChange={props.setLengthUnit}
                    />
                  }
                />
                {isJournal ? (
                  <CalculatorUnitField
                    label="Bearing length"
                    value={props.length}
                    onChange={props.setLength}
                    unit={
                      <ModuleUnitSelect
                        moduleId="plain-bearings"
                        fieldKey="length"
                        value={props.lengthUnit}
                        onChange={props.setLengthUnit}
                      />
                    }
                  />
                ) : (
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <span>Outer / inner diameter ratio</span>
                    <input
                      type="number"
                      step="0.1"
                      value={props.padDiameterRatio}
                      onChange={(e) => props.setPadDiameterRatio(Number(e.target.value))}
                      className={calculatorNumberInputClass}
                    />
                  </label>
                )}
                <CalculatorUnitField
                  label="Clearance / film gap"
                  value={props.clearance}
                  onChange={props.setClearance}
                  unit={
                    <ModuleUnitSelect
                      moduleId="plain-bearings"
                      fieldKey="clearance"
                      value={props.lengthUnit}
                      onChange={props.setLengthUnit}
                    />
                  }
                />
                {props.bearingType === "tilting_pad" ? (
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <span>Number of pads</span>
                    <input
                      type="number"
                      min={3}
                      value={props.padCount}
                      onChange={(e) => props.setPadCount(Number(e.target.value))}
                      className={calculatorNumberInputClass}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </CalculatorInputSteps>
    </CalculatorInputPanel>
  );
}
