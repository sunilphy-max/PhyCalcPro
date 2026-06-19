"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import {
  METRIC_BOLT_SIZES,
  type BoltPropertyClass,
  type TighteningMethod,
} from "@/lib/fasteners/bolts/vdi2230";

const selectClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

type Props = {
  size: string;
  setSize: (v: string) => void;
  propertyClass: BoltPropertyClass;
  setPropertyClass: (v: BoltPropertyClass) => void;
  tighteningMethod: TighteningMethod;
  setTighteningMethod: (v: TighteningMethod) => void;
  clampLength: number;
  setClampLength: (v: number) => void;
  axialLoad: number;
  setAxialLoad: (v: number) => void;
  transverseLoad: number;
  setTransverseLoad: (v: number) => void;
  threadFriction: number;
  setThreadFriction: (v: number) => void;
  interfaceFriction: number;
  setInterfaceFriction: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (v: string) => void;
  forceUnit: string;
  setForceUnit: (v: string) => void;
  onCalculate: () => void;
};

export default function Vdi2230Inputs({
  size,
  setSize,
  propertyClass,
  setPropertyClass,
  tighteningMethod,
  setTighteningMethod,
  clampLength,
  setClampLength,
  axialLoad,
  setAxialLoad,
  transverseLoad,
  setTransverseLoad,
  threadFriction,
  setThreadFriction,
  interfaceFriction,
  setInterfaceFriction,
  lengthUnit,
  setLengthUnit,
  forceUnit,
  setForceUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Preloaded joint (VDI 2230)"
      description="Single-bolt worksheet: resiliences, load factor, assembly preload, tightening torque, slip, fatigue and bearing pressure."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run VDI 2230 check" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Bolt size (ISO coarse)</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
            {METRIC_BOLT_SIZES.map((s) => (
              <option key={s.designation} value={s.designation}>
                {s.designation} × {s.pitch * 1000} mm
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Property class (ISO 898-1)</span>
          <select
            value={propertyClass}
            onChange={(e) => setPropertyClass(e.target.value as BoltPropertyClass)}
            className={selectClass}
          >
            <option value="8.8">8.8 (Rp0.2 = 640 MPa)</option>
            <option value="10.9">10.9 (Rp0.2 = 940 MPa)</option>
            <option value="12.9">12.9 (Rp0.2 = 1100 MPa)</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
          <span>Tightening method (scatter αA)</span>
          <select
            value={tighteningMethod}
            onChange={(e) => setTighteningMethod(e.target.value as TighteningMethod)}
            className={selectClass}
          >
            <option value="yield_controlled">Yield-controlled (αA = 1.1)</option>
            <option value="angle_controlled">Angle-controlled (αA = 1.2)</option>
            <option value="torque_wrench">Torque wrench (αA = 1.6)</option>
            <option value="impact">Impact driver (αA = 2.5)</option>
          </select>
        </label>
        <CalculatorUnitField
          label="Clamp length lK"
          value={clampLength}
          onChange={setClampLength}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />}
        />
        <CalculatorUnitField
          label="Axial working load FA"
          value={axialLoad}
          onChange={setAxialLoad}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Transverse load FQ"
          value={transverseLoad}
          onChange={setTransverseLoad}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Thread/head friction μG = μK"
          value={threadFriction}
          onChange={setThreadFriction}
          unit={<span className="text-xs text-slate-500">—</span>}
        />
        <CalculatorUnitField
          label="Interface friction μT"
          value={interfaceFriction}
          onChange={setInterfaceFriction}
          unit={<span className="text-xs text-slate-500">—</span>}
        />
      </div>
    </CalculatorInputPanel>
  );
}
