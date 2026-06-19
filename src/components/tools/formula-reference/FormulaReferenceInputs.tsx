"use client";

import { useMemo, useState } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MathExpression from "@/components/shared/MathExpression";
import { calculatorInputGridClass, calculatorInputGridTightClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import {
  FORMULA_CATEGORIES,
  FORMULA_INPUTS,
  FORMULAS,
  formulasByCategory,
  type FormulaCategory,
} from "@/lib/tools/formula-reference/formulas";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";

type Props = {
  formulaId: string;
  setFormulaId: (id: string) => void;
  inputs: Record<string, number>;
  setInput: (key: string, value: number) => void;
  inputUnits: Record<string, string>;
  setInputUnit: (key: string, unit: string) => void;
  onCalculate: () => void;
};

export default function FormulaReferenceInputs({
  formulaId,
  setFormulaId,
  inputs,
  setInput,
  inputUnits,
  setInputUnit,
  onCalculate,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FormulaCategory | "all">("all");
  const fields = FORMULA_INPUTS[formulaId] ?? FORMULA_INPUTS.kinetic_energy;
  const formulaMeta = FORMULAS[formulaId] ?? FORMULAS.kinetic_energy;

  const filteredIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return formulasByCategory(category).filter((id) => {
      const meta = FORMULAS[id];
      if (!q) return true;
      return meta.name.toLowerCase().includes(q) || id.includes(q) || meta.expression.toLowerCase().includes(q);
    });
  }, [search, category]);

  return (
    <CalculatorInputPanel
      title="Engineering formulas"
      description="Quick reference calculations with explicit expressions."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Evaluate formula" designAware />}
    >
      <div className="space-y-4">
        <div className={`${calculatorInputGridTightClass}`}>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FormulaCategory | "all")}
              className={`${calculatorNumberInputClass} w-full`}
            >
              <option value="all">All categories</option>
              {(Object.keys(FORMULA_CATEGORIES) as FormulaCategory[]).map((c) => (
                <option key={c} value={c}>
                  {FORMULA_CATEGORIES[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or expression…"
              className={calculatorNumberInputClass}
            />
          </label>
        </div>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Formula ({filteredIds.length})</span>
          <select
            value={formulaId}
            onChange={(e) => setFormulaId(e.target.value)}
            className={`${calculatorNumberInputClass} w-full`}
          >
            {filteredIds.map((id) => (
              <option key={id} value={id}>
                {FORMULAS[id].name}
              </option>
            ))}
          </select>
        </label>

        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          <MathExpression expression={formulaMeta.expression} display />
        </p>

        <div className={`${calculatorInputGridClass}`}>
          {fields.map((field) => {
            const profile = field.moduleFieldKey
              ? getModuleFieldProfile("formula-reference", field.moduleFieldKey)
              : undefined;

            if (profile) {
              return (
                <CalculatorUnitField
                  key={field.key}
                  label={field.label}
                  value={inputs[field.key] ?? 0}
                  onChange={(v) => setInput(field.key, v)}
                  unit={
                    <ModuleUnitSelect
                      moduleId="formula-reference"
                      fieldKey={field.moduleFieldKey!}
                      value={inputUnits[field.key] ?? profile.defaultUnit}
                      onChange={(u) => setInputUnit(field.key, u)}
                    />
                  }
                />
              );
            }

            return (
              <label key={field.key} className="space-y-2 text-sm text-slate-700">
                <span>{field.label}</span>
                <input
                  type="number"
                  step="any"
                  value={inputs[field.key] ?? 0}
                  onChange={(e) => setInput(field.key, Number(e.target.value))}
                  className={calculatorNumberInputClass}
                />
              </label>
            );
          })}
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

export function defaultFormulaInputs(formulaId: string): Record<string, number> {
  switch (formulaId) {
    case "kinetic_energy":
      return { mass: 10, velocity: 5 };
    case "pump_power":
      return { flow: 0.05, pressureDrop: 250000 };
    case "thermal_expansion":
      return { alpha: 12e-6, length: 2, deltaT: 40 };
    case "friction_force":
      return { mu: 0.35, normalForce: 500 };
    default:
      return { mass: 10, velocity: 5 };
  }
}

export function defaultFormulaInputUnits(formulaId: string): Record<string, string> {
  const units: Record<string, string> = {};
  const fields = FORMULA_INPUTS[formulaId] ?? [];
  for (const field of fields) {
    if (!field.moduleFieldKey) continue;
    const profile = getModuleFieldProfile("formula-reference", field.moduleFieldKey);
    if (profile) units[field.key] = profile.defaultUnit;
  }
  return units;
}
