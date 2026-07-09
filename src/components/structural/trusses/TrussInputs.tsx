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
import { calculatorInputGridClass } from "@/components/calculator/styles";
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
  material: string;
  onMaterialChange: (name: string) => void;
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
  material,
  onMaterialChange,
  onCalculate,
}: Props) {
  const handleMaterial = (name: string) => {
    onMaterialChange(name);
    if (name !== CUSTOM_MATERIAL) {
      setE(getMaterialFieldUpdates(name, "structural").E);
    }
  };

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

      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Span"
          value={span}
          onChange={setSpan}
          min={0.1}
          step={0.1}
          unit={<ModuleUnitSelect moduleId="frames" fieldKey="length" value={spanUnit} onChange={setSpanUnit} />}
        />
        <CalculatorUnitField
          label="Height"
          value={height}
          onChange={setHeight}
          min={0.1}
          step={0.05}
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
        <MaterialSelect profile="structural" value={material} onChange={handleMaterial} />
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e6}
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
        <p className="text-xs text-slate-500">{panels} panels along the span</p>
        <MeshControls elements={panels} onChangeElements={setPanels} refine />
      </div>
    </CalculatorInputPanel>
  );
}
