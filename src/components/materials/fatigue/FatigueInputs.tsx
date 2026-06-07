"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";

type Props = {
  alternatingStress: number;
  setAlternatingStress: (v: number) => void;
  alternatingUnit: string;
  setAlternatingUnit: (u: string) => void;
  meanStress: number;
  setMeanStress: (v: number) => void;
  meanUnit: string;
  setMeanUnit: (u: string) => void;
  ultimateStrength: number;
  setUltimateStrength: (v: number) => void;
  ultimateUnit: string;
  setUltimateUnit: (u: string) => void;
  enduranceLimit: number;
  setEnduranceLimit: (v: number) => void;
  enduranceUnit: string;
  setEnduranceUnit: (u: string) => void;
  meanStressMethod: "goodman" | "gerber" | "morrow";
  setMeanStressMethod: (m: "goodman" | "gerber" | "morrow") => void;
  onCalculate: () => void;
};

export default function FatigueInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Fatigue loading"
      description="Estimate safe alternating stress and life potential."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate fatigue" designAware />}
    >
      <ModuleUnitField moduleId="fatigue" fieldKey="alternatingStress" value={props.alternatingStress} unit={props.alternatingUnit} onValueChange={props.setAlternatingStress} onUnitChange={props.setAlternatingUnit} />
      <ModuleUnitField moduleId="fatigue" fieldKey="meanStress" value={props.meanStress} unit={props.meanUnit} onValueChange={props.setMeanStress} onUnitChange={props.setMeanUnit} />
      <ModuleUnitField moduleId="fatigue" fieldKey="ultimateStrength" value={props.ultimateStrength} unit={props.ultimateUnit} onValueChange={props.setUltimateStrength} onUnitChange={props.setUltimateUnit} />
      <ModuleUnitField moduleId="fatigue" fieldKey="enduranceLimit" value={props.enduranceLimit} unit={props.enduranceUnit} onValueChange={props.setEnduranceLimit} onUnitChange={props.setEnduranceUnit} />
      <label className="space-y-2 text-sm text-slate-700">
        <span>Mean-stress criterion</span>
        <select
          value={props.meanStressMethod}
          onChange={(e) => props.setMeanStressMethod(e.target.value as "goodman" | "gerber" | "morrow")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="goodman">Goodman (linear)</option>
          <option value="gerber">Gerber (parabolic)</option>
          <option value="morrow">Morrow (σf&apos; mean stress)</option>
        </select>
      </label>
    </CalculatorInputPanel>
  );
}
