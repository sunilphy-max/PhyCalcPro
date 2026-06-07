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
  segments: number;
  setSegments: (value: number) => void;
  area: number;
  setArea: (value: number) => void;
  I: number;
  setI: (value: number) => void;
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
  inertiaUnit: string;
  setInertiaUnit: (value: string) => void;
  loadUnit: string;
  setLoadUnit: (value: string) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  onCalculate: () => void;
};

export default function FrameInputs({
  span,
  setSpan,
  height,
  setHeight,
  segments,
  setSegments,
  area,
  setArea,
  I,
  setI,
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
  inertiaUnit,
  setInertiaUnit,
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
      title="Frame geometry"
      description="Define the portal frame geometry, beam properties, and the point load for analysis."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run frame analysis" designAware />}
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
          min={0.5}
          step={0.1}
          unit={
            <UnitSelector
              dimension="length"
              value={spanUnit}
              onChange={setSpanUnit}
              label=""
            />
          }
        />

        <CalculatorUnitField
          label="Height"
          value={height}
          onChange={setHeight}
          min={0.5}
          step={0.1}
          unit={
            <UnitSelector
              dimension="length"
              value={heightUnit}
              onChange={setHeightUnit}
              label=""
            />
          }
        />

        <CalculatorUnitField
          label="Axial area"
          value={area}
          onChange={setArea}
          min={1e-6}
          step="any"
          unit={
            <UnitSelector
              dimension="area"
              value={areaUnit}
              onChange={setAreaUnit}
              label=""
            />
          }
        />

        <CalculatorUnitField
          label="Moment of inertia"
          value={I}
          onChange={setI}
          min={1e-10}
          step="any"
          unit={
            <UnitSelector
              dimension="inertia"
              value={inertiaUnit}
              onChange={setInertiaUnit}
              label=""
            />
          }
        />

        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e8}
          step="any"
          colSpan
          unit={
            <UnitSelector
              dimension="stress"
              value={EUnit}
              onChange={setEUnit}
              label=""
            />
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
            <UnitSelector
              dimension="force"
              value={loadUnit}
              onChange={setLoadUnit}
              label=""
            />
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={segments} onChangeElements={setSegments} refine />
      </div>

    </CalculatorInputPanel>
  );
}
