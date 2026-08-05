"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  assistantToDesignerHref,
  defaultAssistantAnswers,
  storeAssistantApply,
  toAssistantApplyPayload,
  type AssistantAnswers,
  type BearingApplicationAssistant,
} from "@/lib/machine/bearings/bearingApplicationAssistants";
import {
  calculatorNumberInputClass,
  calculatorSelectClass,
} from "@/components/calculator/styles";

type Props = {
  assistant: BearingApplicationAssistant;
};

export default function BearingAssistantForm({ assistant }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AssistantAnswers>(() =>
    defaultAssistantAnswers(assistant)
  );

  const preview = useMemo(
    () => toAssistantApplyPayload(assistant.id, answers),
    [assistant.id, answers]
  );

  const setField = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const continueToDesigner = () => {
    const payload = toAssistantApplyPayload(assistant.id, answers);
    storeAssistantApply(payload);
    router.push(assistantToDesignerHref(assistant.id, answers));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/products/bearings"
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to start
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          Selection assistant
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {assistant.label}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {assistant.blurb}
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        onSubmit={(e) => {
          e.preventDefault();
          continueToDesigner();
        }}
      >
        {assistant.fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={`assistant-${field.id}`}
              className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              <span>{field.label}</span>
              {field.unit ? (
                <span className="text-xs font-normal text-slate-400">{field.unit}</span>
              ) : null}
            </label>
            {field.kind === "select" ? (
              <select
                id={`assistant-${field.id}`}
                className={`${calculatorSelectClass} mt-1`}
                value={String(answers[field.id] ?? field.defaultValue)}
                onChange={(e) => setField(field.id, e.target.value)}
              >
                {(field.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`assistant-${field.id}`}
                type="number"
                className={`${calculatorNumberInputClass} mt-1`}
                value={answers[field.id] ?? field.defaultValue}
                min={field.min}
                max={field.max}
                step={field.step ?? "any"}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setField(field.id, "");
                    return;
                  }
                  const n = Number.parseFloat(v);
                  setField(field.id, Number.isFinite(n) ? n : v);
                }}
              />
            )}
            {field.help ? (
              <p className="mt-1 text-xs text-slate-500">{field.help}</p>
            ) : null}
          </div>
        ))}

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Preview defaults</p>
          <p className="mt-1">
            Fr {Math.round(preview.radialLoad ?? 0)} N · Fa {Math.round(preview.axialLoad ?? 0)} N ·{" "}
            {preview.speed ?? "—"} rpm · {preview.bearingType?.replace(/_/g, " ")} ·{" "}
            {preview.mountingSystem?.replace(/_/g, " ") ?? "single"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Open calculator
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href={assistantToDesignerHref(assistant.id)}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:text-slate-200"
            onClick={() =>
              storeAssistantApply(
                toAssistantApplyPayload(assistant.id, defaultAssistantAnswers(assistant))
              )
            }
          >
            Use defaults
          </Link>
        </div>
      </form>
    </div>
  );
}
