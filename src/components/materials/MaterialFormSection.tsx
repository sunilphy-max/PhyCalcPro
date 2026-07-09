"use client";

import MaterialSelect from "@/components/materials/MaterialSelect";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";
import type { MaterialProfile } from "@/lib/materials/materialProfiles";

type BaseProps = {
  profile: MaterialProfile;
  material: string;
  onMaterialChange: (name: string) => void;
  moduleId: string;
};

type StructuralProps = BaseProps & {
  profile: "structural";
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  yieldStrength: number;
  setYieldStrength: (v: number) => void;
  stressUnit: string;
  setStressUnit: (u: string) => void;
};

type PlateShellProps = BaseProps & {
  profile: "plate-shell";
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  poisson: number;
  setPoisson: (v: number) => void;
  stressUnit: string;
  setStressUnit: (u: string) => void;
};

type CombinedProps = BaseProps & {
  profile: "structural";
  yieldStrength: number;
  setYieldStrength: (v: number) => void;
  stressUnit: string;
  setStressUnit: (u: string) => void;
  yieldOnly?: boolean;
};

type Props = StructuralProps | PlateShellProps | (CombinedProps & { yieldOnly: true });

function applyMaterial(
  name: string,
  profile: MaterialProfile,
  setters: {
    setElasticModulus?: (v: number) => void;
    setYieldStrength?: (v: number) => void;
    setPoisson?: (v: number) => void;
  }
) {
  if (name === CUSTOM_MATERIAL) return;
  const u = getMaterialFieldUpdates(name, profile);
  setters.setElasticModulus?.(u.E);
  setters.setYieldStrength?.(u.yieldStress);
  setters.setPoisson?.(u.poisson);
}

export function MaterialFormSection(props: Props) {
  const handleChange = (name: string) => {
    props.onMaterialChange(name);
    if ("yieldOnly" in props && props.yieldOnly) {
      applyMaterial(name, props.profile, { setYieldStrength: props.setYieldStrength });
      return;
    }
    if (props.profile === "plate-shell") {
      applyMaterial(name, props.profile, {
        setElasticModulus: props.setElasticModulus,
        setPoisson: props.setPoisson,
      });
      return;
    }
    if ("setElasticModulus" in props) {
      applyMaterial(name, props.profile, {
        setElasticModulus: props.setElasticModulus,
        setYieldStrength: props.setYieldStrength,
      });
      return;
    }
    applyMaterial(name, props.profile, {
      setYieldStrength: props.setYieldStrength,
    });
  };

  const isYieldOnly = "yieldOnly" in props && props.yieldOnly;
  const isPlateShell = props.profile === "plate-shell";

  return (
    <CalculatorFormSection title="Material">
      <MaterialSelect profile={props.profile} value={props.material} onChange={handleChange} />
      {!isYieldOnly && !isPlateShell && "setElasticModulus" in props ? (
        <>
          <CalculatorUnitField
            label="Elastic modulus (E)"
            value={props.elasticModulus}
            onChange={props.setElasticModulus}
            step={1e6}
            unit={
              <ModuleUnitSelect
                moduleId={props.moduleId}
                fieldKey="stress"
                value={props.stressUnit}
                onChange={props.setStressUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Yield strength (Fy)"
            value={props.yieldStrength}
            onChange={props.setYieldStrength}
            step={1e6}
            unit={
              <ModuleUnitSelect
                moduleId={props.moduleId}
                fieldKey="stress"
                value={props.stressUnit}
                onChange={props.setStressUnit}
              />
            }
          />
        </>
      ) : null}
      {isPlateShell ? (
        <>
          <CalculatorUnitField
            label="Elastic modulus (E)"
            value={props.elasticModulus}
            onChange={props.setElasticModulus}
            step={1e6}
            unit={
              <ModuleUnitSelect
                moduleId={props.moduleId}
                fieldKey="stress"
                value={props.stressUnit}
                onChange={props.setStressUnit}
              />
            }
          />
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Poisson ratio (ν)
            <input
              type="number"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={props.poisson}
              step={0.01}
              min={0}
              max={0.5}
              onChange={(e) => props.setPoisson(Number(e.target.value))}
            />
          </label>
        </>
      ) : null}
      {isYieldOnly ? (
        <CalculatorUnitField
          label="Yield strength (Fy)"
          value={props.yieldStrength}
          onChange={props.setYieldStrength}
          step={1}
          unit={
            <ModuleUnitSelect
              moduleId={props.moduleId}
              fieldKey="yieldStrength"
              value={props.stressUnit}
              onChange={props.setStressUnit}
            />
          }
        />
      ) : null}
    </CalculatorFormSection>
  );
}

export function createMaterialHandler(
  profile: MaterialProfile,
  setMaterial: (name: string) => void,
  setters: {
    setElasticModulus?: (v: number) => void;
    setYieldStrength?: (v: number) => void;
    setPoisson?: (v: number) => void;
    setDensity?: (v: number) => void;
  }
) {
  return (name: string) => {
    setMaterial(name);
    if (name === CUSTOM_MATERIAL) return;
    const u = getMaterialFieldUpdates(name, profile);
    setters.setElasticModulus?.(u.E);
    setters.setYieldStrength?.(u.yieldStress);
    setters.setPoisson?.(u.poisson);
    setters.setDensity?.(u.density);
  };
}
