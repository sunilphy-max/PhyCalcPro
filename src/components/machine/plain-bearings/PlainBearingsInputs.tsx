"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
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
};

export default function PlainBearingsInputs(props: Props) {
  const isJournal = props.bearingType === "journal";

  return (
    <CalculatorInputPanel
      title="Plain bearing"
      description="Hydrodynamic journal, thrust pad and tilting-pad thrust screening."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate bearing" designAware />}
    >
      <label className="space-y-2 text-sm text-slate-700 block">
        <span>Bearing type</span>
        <select
          value={props.bearingType}
          onChange={(e) => props.setBearingType(e.target.value as PlainBearingType)}
          className={calculatorNumberInputClass}
        >
          <option value="journal">Journal (radial)</option>
          <option value="thrust_pad">Thrust pad (flat)</option>
          <option value="tilting_pad">Tilting-pad thrust</option>
        </select>
      </label>
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label={isJournal ? "Radial load" : "Axial thrust load"}
          value={props.load}
          onChange={props.setLoad}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="load" value={props.loadUnit} onChange={props.setLoadUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Shaft speed (rpm)</span>
          <input type="number" value={props.speed} onChange={(e) => props.setSpeed(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <CalculatorUnitField
          label={isJournal ? "Journal diameter" : "Pad outer diameter"}
          value={props.diameter}
          onChange={props.setDiameter}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="diameter" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        {isJournal ? (
          <CalculatorUnitField
            label="Bearing length"
            value={props.length}
            onChange={props.setLength}
            unit={
              <ModuleUnitSelect moduleId="plain-bearings" fieldKey="length" value={props.lengthUnit} onChange={props.setLengthUnit} />
            }
          />
        ) : (
          <label className="space-y-2 text-sm text-slate-700">
            <span>Outer / inner diameter ratio</span>
            <input type="number" step="0.1" value={props.padDiameterRatio} onChange={(e) => props.setPadDiameterRatio(Number(e.target.value))} className={calculatorNumberInputClass} />
          </label>
        )}
        <CalculatorUnitField
          label="Clearance / film gap"
          value={props.clearance}
          onChange={props.setClearance}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="clearance" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Dynamic viscosity (Pa·s)</span>
          <input type="number" step="0.001" value={props.viscosity} onChange={(e) => props.setViscosity(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        {props.bearingType === "tilting_pad" ? (
          <label className="space-y-2 text-sm text-slate-700">
            <span>Number of pads</span>
            <input type="number" min={3} value={props.padCount} onChange={(e) => props.setPadCount(Number(e.target.value))} className={calculatorNumberInputClass} />
          </label>
        ) : null}
      </div>
    </CalculatorInputPanel>
  );
}
