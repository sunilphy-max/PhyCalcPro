"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { MaterialFormSection } from "@/components/materials/MaterialFormSection";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  wormStarts: number;
  setWormStarts: Dispatch<SetStateAction<number>>;
  gearTeeth: number;
  setGearTeeth: Dispatch<SetStateAction<number>>;
  module: number;
  setModule: Dispatch<SetStateAction<number>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  frictionCoeff: number;
  setFrictionCoeff: Dispatch<SetStateAction<number>>;
  leadAngleDeg: number;
  setLeadAngleDeg: Dispatch<SetStateAction<number>>;
  yieldStress: number;
  setYieldStress: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  material: string;
  onMaterialChange: (name: string) => void;
  onCalculate: () => void;
};

export default function WormGearsInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speed,
  setSpeed,
  wormStarts,
  setWormStarts,
  gearTeeth,
  setGearTeeth,
  module,
  setModule,
  faceWidth,
  setFaceWidth,
  frictionCoeff,
  setFrictionCoeff,
  leadAngleDeg,
  setLeadAngleDeg,
  yieldStress,
  setYieldStress,
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  material,
  onMaterialChange,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Worm gear drive"
      description="Estimate ratio, efficiency, contact stress and axial load for a worm-and-wheel set."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate worm drive" designAware />}
    >
      <MaterialFormSection
        profile="structural"
        moduleId="worm-gears"
        material={material}
        onMaterialChange={onMaterialChange}
        yieldStrength={yieldStress}
        setYieldStrength={setYieldStress}
        stressUnit={stressUnit}
        setStressUnit={setStressUnit}
        yieldOnly
      />
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="worm-gears" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Worm speed (rpm)</span>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Worm starts (threads)</span>
          <input
            type="number"
            min={1}
            value={wormStarts}
            onChange={(e) => setWormStarts(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Wheel teeth</span>
          <input
            type="number"
            min={1}
            value={gearTeeth}
            onChange={(e) => setGearTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Module"
          value={module}
          onChange={setModule}
          unit={
            <ModuleUnitSelect moduleId="worm-gears" fieldKey="module" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Face width"
          value={faceWidth}
          onChange={setFaceWidth}
          unit={
            <ModuleUnitSelect moduleId="worm-gears" fieldKey="faceWidth" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Friction coefficient</span>
          <input
            type="number"
            step="0.01"
            value={frictionCoeff}
            onChange={(e) => setFrictionCoeff(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Lead angle (°)</span>
          <input
            type="number"
            step="0.5"
            value={leadAngleDeg}
            onChange={(e) => setLeadAngleDeg(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
