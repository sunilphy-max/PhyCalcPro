"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CUSTOM_MATERIAL } from "@/data/materials";
import {
  resolveMaterial,
  type CustomMaterialOverrides,
  type ResolvedMaterialProps,
} from "@/lib/materials/materialCatalogService";
import {
  getDefaultMaterialNameForDesignCode,
  profileAllowsCustom,
  type MaterialProfile,
} from "@/lib/materials/materialProfiles";

type UseMaterialSelectionOptions = {
  profile: MaterialProfile;
  designCode?: string;
  initialMaterialName?: string;
  initialOverrides?: CustomMaterialOverrides;
  onResolved?: (props: ResolvedMaterialProps) => void;
};

export function useMaterialSelection({
  profile,
  designCode,
  initialMaterialName,
  initialOverrides,
  onResolved,
}: UseMaterialSelectionOptions) {
  const searchParams = useSearchParams();
  const queryMaterial = searchParams.get("material");

  const defaultName = useMemo(
    () => initialMaterialName ?? getDefaultMaterialNameForDesignCode(profile, designCode),
    [initialMaterialName, profile, designCode]
  );

  const [materialName, setMaterialName] = useState(defaultName);
  const [customOverrides, setCustomOverrides] = useState<CustomMaterialOverrides>(
    initialOverrides ?? {}
  );

  useEffect(() => {
    if (queryMaterial) {
      setMaterialName(decodeURIComponent(queryMaterial));
    }
  }, [queryMaterial]);

  const resolved = useMemo(
    () =>
      resolveMaterial(
        materialName,
        profile,
        materialName === CUSTOM_MATERIAL ? customOverrides : undefined
      ),
    [materialName, profile, customOverrides]
  );

  useEffect(() => {
    onResolved?.(resolved);
  }, [resolved, onResolved]);

  const setMaterial = useCallback(
    (name: string) => {
      setMaterialName(name);
      if (name !== CUSTOM_MATERIAL) {
        const next = resolveMaterial(name, profile);
        setCustomOverrides({
          E: next.E,
          G: next.G,
          yieldStress: next.yieldStress,
          ultimateStrength: next.ultimateStrength,
          density: next.density,
          poisson: next.poisson,
          enduranceLimit: next.enduranceLimit,
          hardnessHB: next.hardnessHB,
          weldElectrodeStrength: next.weldElectrodeStrength,
          weldAllowableShear: next.weldAllowableShear,
          shearStrength: next.shearStrength,
          bearingStrength: next.bearingStrength,
          thermalExpansion: next.thermalExpansion,
        });
      }
    },
    [profile]
  );

  const updateOverride = useCallback(
    <K extends keyof CustomMaterialOverrides>(key: K, value: CustomMaterialOverrides[K]) => {
      setMaterialName(CUSTOM_MATERIAL);
      setCustomOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyMaterialFromHandoff = useCallback(
    (fields: Record<string, unknown>) => {
      if (typeof fields.material === "string") {
        setMaterial(fields.material);
      }
      const overrides: CustomMaterialOverrides = {};
      if (typeof fields.E === "number") overrides.E = fields.E;
      if (typeof fields.G === "number") overrides.G = fields.G;
      if (typeof fields.yieldStress === "number") overrides.yieldStress = fields.yieldStress;
      if (typeof fields.ultimateStrength === "number") overrides.ultimateStrength = fields.ultimateStrength;
      if (typeof fields.density === "number") overrides.density = fields.density;
      if (typeof fields.poisson === "number") overrides.poisson = fields.poisson;
      if (Object.keys(overrides).length > 0) {
        setCustomOverrides((prev) => ({ ...prev, ...overrides }));
      }
    },
    [setMaterial]
  );

  return {
    materialName,
    setMaterial,
    resolved,
    customOverrides,
    updateOverride,
    isCustom: materialName === CUSTOM_MATERIAL,
    allowCustom: profileAllowsCustom(profile),
    applyMaterialFromHandoff,
  };
}
