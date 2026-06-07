"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import MeshControls from "@/components/shared/MeshControls";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";

type Props = {
  span: number;
  setSpan: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  panels: number;
  setPanels: (value: number) => void;
  area: number;
  setArea: (value: number) => void;
  E: number;
  setE: (value: number) => void;
  load: number;
  setLoad: (value: number) => void;
  spanUnit: string;
  setSpanUnit: (value: string) => void;
  heightUnit: string;
  setHeightUnit: (value: string) => void;
  areaUnit: string;
  setAreaUnit: (value: string) => void;
  loadUnit: string;
  setLoadUnit: (value: string) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  onCalculate: () => void;
};

export default function TrussInputs({
  span,
  setSpan,
  height,
  setHeight,
  panels,
  setPanels,
  area,
  setArea,
  E,
  setE,
  load,
  setLoad,
  spanUnit,
  setSpanUnit,
  heightUnit,
  setHeightUnit,
  areaUnit,
  setAreaUnit,
  loadUnit,
  setLoadUnit,
  EUnit,
  setEUnit,
  sectionDesignation,
  setSectionDesignation,
  onSectionApplied,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Truss geometry"
      description="Define span, height, panel count, and material properties for the truss."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Analyze truss" designAware />}
    >
      <RolledSectionPicker
        designation={sectionDesignation}
        onDesignationChange={setSectionDesignation}
        onSectionApplied={onSectionApplied}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Span"
          value={span}
          onChange={setSpan}
          min={0.1}
          step={0.1}
          unit={
            <UnitSelector dimension="length" value={spanUnit} onChange={setSpanUnit} label="" />
          }
        />
        <CalculatorUnitField
          label="Height"
          value={height}
          onChange={setHeight}
          min={0.1}
          step={0.05}
          unit={
            <UnitSelector dimension="length" value={heightUnit} onChange={setHeightUnit} label="" />
          }
        />
        <CalculatorUnitField
          label="Axial area"
          value={area}
          onChange={setArea}
          min={1e-6}
          step="any"
          unit={
            <UnitSelector dimension="area" value={areaUnit} onChange={setAreaUnit} label="" />
          }
        />
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e6}
          step="any"
          unit={
            <UnitSelector dimension="stress" value={EUnit} onChange={setEUnit} label="" />
          }
        />
        <CalculatorUnitField
          label="Midspan downward load"
          value={load}
          onChange={setLoad}
          min={0}
          step={100}
          colSpan
          unit={
            <UnitSelector dimension="force" value={loadUnit} onChange={setLoadUnit} label="" />
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <p className="text-xs text-slate-500">{panels} panels along the span</p>
        <MeshControls elements={panels} onChangeElements={setPanels} refine />
      </div>
    </CalculatorInputPanel>
  );
}
