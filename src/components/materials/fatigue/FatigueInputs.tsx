"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
import type { FatigueLoadType, SurfaceFinish } from "@/lib/materials/fatigue/types";

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
  surfaceFinish: SurfaceFinish;
  setSurfaceFinish: (s: SurfaceFinish) => void;
  loadType: FatigueLoadType;
  setLoadType: (l: FatigueLoadType) => void;
  onCalculate: () => void;
};

export default function FatigueInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Fatigue loading"
      description="Estimate safe alternating stress and life potential."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate fatigue" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Alternating stress"
          value={props.alternatingStress}
          onChange={props.setAlternatingStress}
          unit={
            <ModuleUnitSelect
              moduleId="fatigue"
              fieldKey="alternatingStress"
              value={props.alternatingUnit}
              onChange={props.setAlternatingUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Mean stress"
          value={props.meanStress}
          onChange={props.setMeanStress}
          unit={
            <ModuleUnitSelect moduleId="fatigue" fieldKey="meanStress" value={props.meanUnit} onChange={props.setMeanUnit} />
          }
        />
        <CalculatorUnitField
          label="Ultimate strength"
          value={props.ultimateStrength}
          onChange={props.setUltimateStrength}
          unit={
            <ModuleUnitSelect
              moduleId="fatigue"
              fieldKey="ultimateStrength"
              value={props.ultimateUnit}
              onChange={props.setUltimateUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Endurance limit"
          value={props.enduranceLimit}
          onChange={props.setEnduranceLimit}
          unit={
            <ModuleUnitSelect
              moduleId="fatigue"
              fieldKey="enduranceLimit"
              value={props.enduranceUnit}
              onChange={props.setEnduranceUnit}
            />
          }
        />
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Mean-stress criterion</span>
          <select
            value={props.meanStressMethod}
            onChange={(e) => props.setMeanStressMethod(e.target.value as "goodman" | "gerber" | "morrow")}
            className={calculatorSelectClass}
          >
            <option value="goodman">Goodman (linear)</option>
            <option value="gerber">Gerber (parabolic)</option>
            <option value="morrow">Morrow (σf&apos; mean stress)</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Surface finish (Marin ka)</span>
          <select
            value={props.surfaceFinish}
            onChange={(e) => props.setSurfaceFinish(e.target.value as SurfaceFinish)}
            className={calculatorSelectClass}
          >
            <option value="ground">Ground</option>
            <option value="machined">Machined / cold-drawn</option>
            <option value="hot-rolled">Hot-rolled</option>
            <option value="as-forged">As-forged</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Load type (Marin kc)</span>
          <select
            value={props.loadType}
            onChange={(e) => props.setLoadType(e.target.value as FatigueLoadType)}
            className={calculatorSelectClass}
          >
            <option value="bending">Bending</option>
            <option value="axial">Axial</option>
            <option value="torsion">Torsion</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
