"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";
import {
  ROLLED_SECTIONS,
  ROLLED_SECTION_FAMILIES,
  sectionsByFamily,
} from "@/lib/materials/rolled-sections/data";

type Props = {
  family: string;
  setFamily: Dispatch<SetStateAction<string>>;
  designation: string;
  setDesignation: Dispatch<SetStateAction<string>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  areaUnit: string;
  setAreaUnit: Dispatch<SetStateAction<string>>;
  inertiaUnit: string;
  setInertiaUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function RolledSectionsInputs({
  family,
  setFamily,
  designation,
  setDesignation,
  lengthUnit,
  setLengthUnit,
  areaUnit,
  setAreaUnit,
  inertiaUnit,
  setInertiaUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Rolled section"
      description="AISC W/S/C/L and DIN IPE/UPN/L starter catalog (SI base units)."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Look up section" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Family</span>
          <select
            value={family}
            onChange={(e) => {
              const f = e.target.value;
              setFamily(f);
              const list = sectionsByFamily(f);
              if (list[0]) setDesignation(list[0]);
            }}
            className={`${calculatorNumberInputClass} w-full`}
          >
            {ROLLED_SECTION_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Section designation</span>
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className={`${calculatorNumberInputClass} w-full`}
          >
            {sectionsByFamily(family).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Length display</span>
          <ModuleUnitSelect moduleId="rolled-sections" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Area display</span>
          <ModuleUnitSelect moduleId="rolled-sections" fieldKey="area" value={areaUnit} onChange={setAreaUnit} />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Inertia display</span>
          <ModuleUnitSelect
            moduleId="rolled-sections"
            fieldKey="inertia"
            value={inertiaUnit}
            onChange={setInertiaUnit}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
