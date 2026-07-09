"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import MaterialSelect from "@/components/materials/MaterialSelect";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";
import { CUSTOM_MATERIAL } from "@/data/materials";
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
  material: string;
  onMaterialChange: (name: string) => void;
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
  material,
  onMaterialChange,
  onCalculate,
}: Props) {
  const handleMaterial = (name: string) => {
    onMaterialChange(name);
    if (name !== CUSTOM_MATERIAL) {
      const u = getMaterialFieldUpdates(name, "structural");
      setE(u.E);
    }
  };

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

      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Span"
          value={span}
          onChange={setSpan}
          min={0.5}
          step={0.1}
          unit={<ModuleUnitSelect moduleId="frames" fieldKey="length" value={spanUnit} onChange={setSpanUnit} />}
        />
        <CalculatorUnitField
          label="Height"
          value={height}
          onChange={setHeight}
          min={0.5}
          step={0.1}
          unit={<ModuleUnitSelect moduleId="frames" fieldKey="length" value={heightUnit} onChange={setHeightUnit} />}
        />
        <CalculatorUnitField
          label="Axial area"
          value={area}
          onChange={setArea}
          min={1e-6}
          step="any"
          unit={<ModuleUnitSelect moduleId="sections" fieldKey="area" value={areaUnit} onChange={setAreaUnit} />}
        />
        <CalculatorUnitField
          label="Moment of inertia"
          value={I}
          onChange={setI}
          min={1e-10}
          step="any"
          unit={
            <ModuleUnitSelect moduleId="sections" fieldKey="inertia" value={inertiaUnit} onChange={setInertiaUnit} />
          }
        />
        <MaterialSelect profile="structural" value={material} onChange={handleMaterial} />
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e8}
          step="any"
          unit={<ModuleUnitSelect moduleId="frames" fieldKey="stress" value={EUnit} onChange={setEUnit} />}
        />
        <CalculatorUnitField
          label="Midspan downward load"
          value={load}
          onChange={setLoad}
          min={0}
          step={100}
          unit={<ModuleUnitSelect moduleId="frames" fieldKey="force" value={loadUnit} onChange={setLoadUnit} />}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={segments} onChangeElements={setSegments} refine />
      </div>
    </CalculatorInputPanel>
  );
}
