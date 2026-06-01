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
  diameterDriver: number;
  setDiameterDriver: Dispatch<SetStateAction<number>>;
  diameterDriven: number;
  setDiameterDriven: Dispatch<SetStateAction<number>>;
  centerDistance: number;
  setCenterDistance: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  serviceFactor: number;
  setServiceFactor: Dispatch<SetStateAction<number>>;
  onCalculate: () => void;
};

export default function VBeltsInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speedDriver,
  setSpeedDriver,
  diameterDriver,
  setDiameterDriver,
  diameterDriven,
  setDiameterDriven,
  centerDistance,
  setCenterDistance,
  lengthUnit,
  setLengthUnit,
  serviceFactor,
  setServiceFactor,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="V-belt drive"
      description="Size pulleys, estimate belt length, power capacity and pretension."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate drive" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Driver speed (rpm)</span>
          <input
            type="number"
            value={speedDriver}
            onChange={(e) => setSpeedDriver(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Driver pulley diameter"
          value={diameterDriver}
          onChange={setDiameterDriver}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Driven pulley diameter"
          value={diameterDriven}
          onChange={setDiameterDriven}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Center distance"
          value={centerDistance}
          onChange={setCenterDistance}
          unit={
            <ModuleUnitSelect
              moduleId="v-belts"
              fieldKey="centerDistance"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Service factor</span>
          <input
            type="number"
            step="0.05"
            value={serviceFactor}
            onChange={(e) => setServiceFactor(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
