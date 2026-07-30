"use client";

import {
  calculatorNumberInputClass,
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
} from "@/components/calculator/styles";
import type {
  DimensionCallout,
  DrawingExtract,
  FeatureControlFrame,
  FitCallout,
  MaterialCondition,
  StackContributor,
} from "@/lib/manufacturing/gdt/types";
import { fromBase, toBase } from "@/lib/units/conversions";

type Props = {
  extract: DrawingExtract;
  displayUnit: string;
  mode: "tolerance" | "fits";
  onChange: (next: DrawingExtract) => void;
};

function siToDisplay(value: number, unit: string) {
  return fromBase(value, "length", unit);
}

function displayToSi(value: number, unit: string) {
  return toBase(value, "length", unit);
}

const CHARACTERISTICS: FeatureControlFrame["characteristic"][] = [
  "position",
  "perpendicularity",
  "parallelism",
  "profile",
  "concentricity",
  "coaxiality",
  "circularRunout",
  "totalRunout",
  "size",
];

const MATERIAL: MaterialCondition[] = ["RFS", "MMC", "LMC"];

export default function DrawingExtractReview({ extract, displayUnit, mode, onChange }: Props) {
  const updateDimension = (index: number, patch: Partial<DimensionCallout>) => {
    const dimensions = extract.dimensions.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange({ ...extract, dimensions });
  };

  const updateFrame = (index: number, patch: Partial<FeatureControlFrame>) => {
    const frames = extract.frames.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...extract, frames });
  };

  const updateFit = (index: number, patch: Partial<FitCallout>) => {
    const fitCallouts = extract.fitCallouts.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...extract, fitCallouts });
  };

  const updateContributor = (index: number, patch: Partial<StackContributor>) => {
    const suggestedContributors = extract.suggestedContributors.map((c, i) =>
      i === index ? { ...c, ...patch } : c
    );
    onChange({ ...extract, suggestedContributors });
  };

  const removeDimension = (index: number) => {
    onChange({
      ...extract,
      dimensions: extract.dimensions.filter((_, i) => i !== index),
    });
  };

  const removeFrame = (index: number) => {
    onChange({
      ...extract,
      frames: extract.frames.filter((_, i) => i !== index),
    });
  };

  const removeFit = (index: number) => {
    onChange({
      ...extract,
      fitCallouts: extract.fitCallouts.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Review extracted callouts
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Values shown in {displayUnit}. Edit before applying to the calculator.
        </p>
      </div>

      {extract.notes && extract.notes.length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300">
          {extract.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      {(mode === "tolerance" || extract.dimensions.length > 0) && (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dimensions
          </h4>
          {extract.dimensions.length === 0 ? (
            <p className="text-xs text-slate-500">No size dimensions extracted.</p>
          ) : (
            extract.dimensions.map((dim, index) => (
              <div
                key={dim.id}
                className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <label className="text-xs text-slate-600">
                  Label
                  <input
                    className={calculatorNumberInputClass}
                    value={dim.label ?? ""}
                    onChange={(e) => updateDimension(index, { label: e.target.value })}
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Nominal
                  <input
                    type="number"
                    className={calculatorNumberInputClass}
                    value={siToDisplay(dim.nominal, displayUnit)}
                    onChange={(e) =>
                      updateDimension(index, {
                        nominal: displayToSi(Number(e.target.value), displayUnit),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Upper dev.
                  <input
                    type="number"
                    className={calculatorNumberInputClass}
                    value={siToDisplay(dim.upperDeviation, displayUnit)}
                    onChange={(e) =>
                      updateDimension(index, {
                        upperDeviation: displayToSi(Number(e.target.value), displayUnit),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Lower dev.
                  <input
                    type="number"
                    className={calculatorNumberInputClass}
                    value={siToDisplay(dim.lowerDeviation, displayUnit)}
                    onChange={(e) =>
                      updateDimension(index, {
                        lowerDeviation: displayToSi(Number(e.target.value), displayUnit),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="col-span-2 text-left text-xs text-red-600"
                  onClick={() => removeDimension(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {mode === "tolerance" ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Feature control frames
          </h4>
          {extract.frames.length === 0 ? (
            <p className="text-xs text-slate-500">No FCFs extracted.</p>
          ) : (
            extract.frames.map((frame, index) => (
              <div
                key={frame.id}
                className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <label className="text-xs text-slate-600">
                  Characteristic
                  <select
                    className={calculatorSelectClass}
                    value={frame.characteristic}
                    onChange={(e) =>
                      updateFrame(index, {
                        characteristic: e.target
                          .value as FeatureControlFrame["characteristic"],
                      })
                    }
                  >
                    {CHARACTERISTICS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-slate-600">
                  Zone ({displayUnit})
                  <input
                    type="number"
                    className={calculatorNumberInputClass}
                    value={siToDisplay(frame.zoneValue, displayUnit)}
                    onChange={(e) =>
                      updateFrame(index, {
                        zoneValue: displayToSi(Number(e.target.value), displayUnit),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Material condition
                  <select
                    className={calculatorSelectClass}
                    value={frame.materialCondition}
                    onChange={(e) =>
                      updateFrame(index, {
                        materialCondition: e.target.value as MaterialCondition,
                      })
                    }
                  >
                    {MATERIAL.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-slate-600">
                  Datum refs
                  <input
                    className={calculatorNumberInputClass}
                    value={frame.datumRefs.map((r) => r.datumId).join(",")}
                    onChange={(e) =>
                      updateFrame(index, {
                        datumRefs: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((datumId) => ({ datumId })),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="col-span-2 text-left text-xs text-red-600"
                  onClick={() => removeFrame(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </section>
      ) : null}

      {mode === "tolerance" && extract.suggestedContributors.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Stack order
          </h4>
          {extract.suggestedContributors.map((c, index) => (
            <div
              key={c.id}
              className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
            >
              <label className="text-xs text-slate-600">
                Sense
                <select
                  className={calculatorSelectClass}
                  value={c.sense}
                  onChange={(e) =>
                    updateContributor(index, {
                      sense: Number(e.target.value) < 0 ? -1 : 1,
                    })
                  }
                >
                  <option value={1}>+</option>
                  <option value={-1}>−</option>
                </select>
              </label>
              <label className="text-xs text-slate-600">
                Axis
                <select
                  className={calculatorSelectClass}
                  value={c.axis}
                  onChange={(e) =>
                    updateContributor(index, {
                      axis: e.target.value as StackContributor["axis"],
                    })
                  }
                >
                  <option value="X">X</option>
                  <option value="Y">Y</option>
                  <option value="Z">Z</option>
                </select>
              </label>
              <p className="self-end truncate text-xs text-slate-500">
                {c.label ?? c.source.kind}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {(mode === "fits" || extract.fitCallouts.length > 0) && (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fit callouts
          </h4>
          {extract.fitCallouts.length === 0 ? (
            <p className="text-xs text-slate-500">No ISO fit callouts extracted.</p>
          ) : (
            extract.fitCallouts.map((fit, index) => (
              <div
                key={fit.id}
                className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <label className="text-xs text-slate-600">
                  Nominal
                  <input
                    type="number"
                    className={calculatorNumberInputClass}
                    value={siToDisplay(fit.nominal, displayUnit)}
                    onChange={(e) =>
                      updateFit(index, {
                        nominal: displayToSi(Number(e.target.value), displayUnit),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Hole
                  <input
                    className={calculatorNumberInputClass}
                    value={`${fit.holeLetter ?? ""}${fit.holeGrade ?? ""}`}
                    onChange={(e) => {
                      const m = e.target.value.match(/^([A-Za-z]?)(\d*)$/);
                      updateFit(index, {
                        holeLetter: m?.[1] ? m[1].toUpperCase() : undefined,
                        holeGrade: m?.[2] ? Number(m[2]) : undefined,
                      });
                    }}
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Shaft
                  <input
                    className={calculatorNumberInputClass}
                    value={`${fit.shaftLetter ?? ""}${fit.shaftGrade ?? ""}`}
                    onChange={(e) => {
                      const m = e.target.value.match(/^([A-Za-z]?)(\d*)$/);
                      updateFit(index, {
                        shaftLetter: m?.[1] ? m[1].toLowerCase() : undefined,
                        shaftGrade: m?.[2] ? Number(m[2]) : undefined,
                      });
                    }}
                  />
                </label>
                <button
                  type="button"
                  className={`${calculatorSecondaryButtonClass} self-end text-xs`}
                  onClick={() => removeFit(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
