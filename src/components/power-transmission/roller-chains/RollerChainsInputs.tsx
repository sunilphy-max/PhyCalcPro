"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speedDriver: number;
  setSpeedDriver: Dispatch<SetStateAction<number>>;
  pitch: number;
  setPitch: Dispatch<SetStateAction<number>>;
  teethDriver: number;
  setTeethDriver: Dispatch<SetStateAction<number>>;
  teethDriven: number;
  setTeethDriven: Dispatch<SetStateAction<number>>;
  strands: number;
  setStrands: Dispatch<SetStateAction<number>>;
  serviceFactor: number;
  setServiceFactor: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function RollerChainsInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Roller chain drive"
      description="Size sprockets, estimate chain tension and life."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate drive" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField label="Power" value={props.power} onChange={props.setPower} unit={<ModuleUnitSelect moduleId="roller-chains" fieldKey="power" value={props.powerUnit} onChange={props.setPowerUnit} />} />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Driver speed (rpm)</span>
          <input type="number" value={props.speedDriver} onChange={(e) => props.setSpeedDriver(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <CalculatorUnitField label="Chain pitch" value={props.pitch} onChange={props.setPitch} unit={<ModuleUnitSelect moduleId="roller-chains" fieldKey="pitch" value={props.lengthUnit} onChange={props.setLengthUnit} />} />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Driver teeth</span>
          <input type="number" min={11} value={props.teethDriver} onChange={(e) => props.setTeethDriver(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Driven teeth</span>
          <input type="number" min={11} value={props.teethDriven} onChange={(e) => props.setTeethDriven(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Strands</span>
          <input type="number" min={1} max={4} value={props.strands} onChange={(e) => props.setStrands(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Service factor</span>
          <input type="number" step={0.05} value={props.serviceFactor} onChange={(e) => props.setServiceFactor(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
