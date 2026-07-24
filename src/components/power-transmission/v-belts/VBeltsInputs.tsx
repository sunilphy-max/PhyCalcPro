"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import {
  VBELT_SECTION_CATALOG,
  VBELT_SERVICE_FACTOR_PRESETS,
} from "@/lib/powerTransmission/v-belts/catalog";
import {
  VBELT_APPLICATIONS,
  getApplicationProfile,
  type VBeltApplicationId,
  type VBeltApplicationOptions,
} from "@/lib/powerTransmission/v-belts/applications";

type Props = {
  applicationId: VBeltApplicationId;
  setApplicationId: Dispatch<SetStateAction<VBeltApplicationId>>;
  applicationOptions: VBeltApplicationOptions;
  setApplicationOptions: Dispatch<SetStateAction<VBeltApplicationOptions>>;
  useManualServiceFactor: boolean;
  setUseManualServiceFactor: Dispatch<SetStateAction<boolean>>;
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speedDriver: number;
  setSpeedDriver: Dispatch<SetStateAction<number>>;
  speedDriven: number;
  setSpeedDriven: Dispatch<SetStateAction<number>>;
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
  servicePreset: string;
  setServicePreset: Dispatch<SetStateAction<string>>;
  beltSection: string;
  setBeltSection: Dispatch<SetStateAction<string>>;
  useManualGeometry: boolean;
  setUseManualGeometry: Dispatch<SetStateAction<boolean>>;
  onCalculate: () => void;
  workflowMode?: DesignWorkflowMode;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </h3>
  );
}

export default function VBeltsInputs({
  applicationId,
  setApplicationId,
  applicationOptions,
  setApplicationOptions,
  useManualServiceFactor,
  setUseManualServiceFactor,
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speedDriver,
  setSpeedDriver,
  speedDriven,
  setSpeedDriven,
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
  servicePreset,
  setServicePreset,
  beltSection,
  setBeltSection,
  useManualGeometry,
  setUseManualGeometry,
  onCalculate,
  workflowMode = "check",
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const isDesignMode = workflowMode === "design";
  const profile = getApplicationProfile(applicationId);

  const patchOptions = (patch: Partial<VBeltApplicationOptions>) => {
    setApplicationOptions((current) => ({ ...current, ...patch }));
  };

  return (
    <CalculatorInputPanel
      title="V-belt drive"
      description={profile.summary}
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label="Validate drive"
            designAware
          />
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
          ) : null}
        </div>
      }
    >
      <section className="mb-6 space-y-3">
        <SectionHeading>Application</SectionHeading>
        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <span>Application type</span>
          <select
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value as VBeltApplicationId)}
            className={calculatorNumberInputClass}
          >
            {VBELT_APPLICATIONS.map((app) => (
              <option key={app.id} value={app.id}>
                {app.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Typical service factor {profile.serviceFactorMin.toFixed(1)}–{profile.serviceFactorMax.toFixed(1)} · default{" "}
          {profile.defaultServiceFactor.toFixed(2)}
        </p>
        {setProjectName ? (
          <input
            className="w-full rounded border p-2 text-sm dark:border-slate-700"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name (optional)"
          />
        ) : null}
      </section>

      <div className="space-y-6">
        <section className="space-y-3">
          <SectionHeading>Core inputs</SectionHeading>
          <div className={`${calculatorInputGridClass}`}>
            <CalculatorUnitField
              label="Motor power"
              value={power}
              onChange={setPower}
              unit={
                <ModuleUnitSelect moduleId="v-belts" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
              }
            />
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Driver speed (rpm)</span>
              <input
                type="number"
                value={speedDriver}
                onChange={(e) => setSpeedDriver(Number(e.target.value))}
                className={calculatorNumberInputClass}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Driven speed (rpm)</span>
              <input
                type="number"
                value={speedDriven}
                onChange={(e) => setSpeedDriven(Number(e.target.value))}
                className={calculatorNumberInputClass}
              />
            </label>
            <div className="flex items-end text-sm text-slate-600 dark:text-slate-400">
              Speed ratio ≈ {(speedDriver / Math.max(speedDriven, 1)).toFixed(2)} : 1
            </div>
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
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Operating hours / day</span>
              <select
                value={applicationOptions.operatingHoursPerDay}
                onChange={(e) => patchOptions({ operatingHoursPerDay: Number(e.target.value) })}
                className={calculatorNumberInputClass}
              >
                <option value={8}>8 hr/day</option>
                <option value={16}>16 hr/day</option>
                <option value={24}>24 hr/day</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Application details</SectionHeading>
          <div className={`${calculatorInputGridClass}`}>
            {profile.subTypes ? (
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span>{profile.label} type</span>
                <select
                  value={applicationOptions.subTypeId ?? profile.subTypes[0]?.id ?? ""}
                  onChange={(e) => patchOptions({ subTypeId: e.target.value })}
                  className={calculatorNumberInputClass}
                >
                  {profile.subTypes.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {(applicationId === "pump" || applicationId === "machine-tool") && (
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span>Duty cycle</span>
                <select
                  value={applicationOptions.dutyCycle ?? "continuous"}
                  onChange={(e) =>
                    patchOptions({ dutyCycle: e.target.value as VBeltApplicationOptions["dutyCycle"] })
                  }
                  className={calculatorNumberInputClass}
                >
                  <option value="continuous">Continuous</option>
                  <option value="intermittent">Intermittent</option>
                  <option value="batch">Batch / cyclic</option>
                </select>
              </label>
            )}

            {applicationId === "agricultural" && (
              <>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Shock severity</span>
                  <select
                    value={applicationOptions.shockSeverity ?? "medium"}
                    onChange={(e) =>
                      patchOptions({ shockSeverity: e.target.value as VBeltApplicationOptions["shockSeverity"] })
                    }
                    className={calculatorNumberInputClass}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={applicationOptions.outdoorEnvironment ?? true}
                    onChange={(e) => patchOptions({ outdoorEnvironment: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Outdoor / dusty environment
                </label>
              </>
            )}

            {applicationId === "conveyor" && (
              <>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Conveyor length (m)</span>
                  <input
                    type="number"
                    min={0}
                    value={applicationOptions.conveyorLengthM ?? 20}
                    onChange={(e) => patchOptions({ conveyorLengthM: Number(e.target.value) })}
                    className={calculatorNumberInputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Material weight (kg)</span>
                  <input
                    type="number"
                    min={0}
                    value={applicationOptions.materialWeightKg ?? 500}
                    onChange={(e) => patchOptions({ materialWeightKg: Number(e.target.value) })}
                    className={calculatorNumberInputClass}
                  />
                </label>
              </>
            )}

            {applicationId === "packaging" && (
              <>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Cycles per minute</span>
                  <input
                    type="number"
                    min={0}
                    value={applicationOptions.cyclesPerMinute ?? 20}
                    onChange={(e) => patchOptions({ cyclesPerMinute: Number(e.target.value) })}
                    className={calculatorNumberInputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Start/stop frequency</span>
                  <select
                    value={applicationOptions.startStopFrequency ?? "medium"}
                    onChange={(e) =>
                      patchOptions({
                        startStopFrequency: e.target.value as VBeltApplicationOptions["startStopFrequency"],
                      })
                    }
                    className={calculatorNumberInputClass}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </>
            )}

            {applicationId === "machine-tool" && (
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span>Speed accuracy</span>
                <select
                  value={applicationOptions.speedAccuracy ?? "standard"}
                  onChange={(e) =>
                    patchOptions({ speedAccuracy: e.target.value as VBeltApplicationOptions["speedAccuracy"] })
                  }
                  className={calculatorNumberInputClass}
                >
                  <option value="standard">Standard</option>
                  <option value="high">High precision</option>
                </select>
              </label>
            )}

            {applicationId === "fan" && (
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span>Speed adjustment</span>
                <select
                  value={applicationOptions.subTypeId ?? "fixed-speed"}
                  onChange={(e) => patchOptions({ subTypeId: e.target.value })}
                  className={calculatorNumberInputClass}
                >
                  <option value="fixed-speed">Fixed ratio</option>
                  <option value="variable-speed">Variable pulley / speed</option>
                </select>
              </label>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Duty & belt selection</SectionHeading>
          <div className={`${calculatorInputGridClass}`}>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={useManualServiceFactor}
                onChange={(e) => setUseManualServiceFactor(e.target.checked)}
                className="rounded border-slate-300"
              />
              Override application service factor manually
            </label>
            {!useManualServiceFactor ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                Using application service factor: <strong>{serviceFactor.toFixed(2)}</strong>
              </div>
            ) : (
              <>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Service factor preset</span>
                  <select
                    value={servicePreset}
                    onChange={(e) => {
                      setServicePreset(e.target.value);
                      const preset = VBELT_SERVICE_FACTOR_PRESETS.find((p) => p.id === e.target.value);
                      if (preset) setServiceFactor(preset.factor);
                    }}
                    className={calculatorNumberInputClass}
                  >
                    {VBELT_SERVICE_FACTOR_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} ({preset.factor.toFixed(1)})
                      </option>
                    ))}
                    <option value="custom">Custom value</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>Service factor</span>
                  <input
                    type="number"
                    step="0.05"
                    min={1}
                    value={serviceFactor}
                    onChange={(e) => {
                      setServiceFactor(Number(e.target.value));
                      setServicePreset("custom");
                    }}
                    className={calculatorNumberInputClass}
                  />
                </label>
              </>
            )}
            {!isDesignMode ? (
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={useManualGeometry}
                  onChange={(e) => setUseManualGeometry(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Enter pulley diameters manually (verify mode)
              </label>
            ) : null}
            {(isDesignMode ? false : useManualGeometry) ? (
              <>
                <CalculatorUnitField
                  label="Driver pulley diameter"
                  value={diameterDriver}
                  onChange={setDiameterDriver}
                  unit={
                    <ModuleUnitSelect
                      moduleId="v-belts"
                      fieldKey="diameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="Driven pulley diameter"
                  value={diameterDriven}
                  onChange={setDiameterDriven}
                  unit={
                    <ModuleUnitSelect
                      moduleId="v-belts"
                      fieldKey="diameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
              </>
            ) : null}
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Belt section</span>
              <select
                value={beltSection}
                onChange={(e) => setBeltSection(e.target.value)}
                className={calculatorNumberInputClass}
              >
                <option value="auto">Auto select (A–E, 3V/5V/8V)</option>
                {VBELT_SECTION_CATALOG.map((item) => (
                  <option key={item.section} value={item.section}>
                    {item.section} ({item.family})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      </div>
    </CalculatorInputPanel>
  );
}
