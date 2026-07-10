"use client";

import { useMemo, useState } from "react";
import { Bot, CircleCheck, Sparkles, TriangleAlert } from "lucide-react";
import {
  BEARING_COPILOT_EXAMPLES,
  runBearingCopilotSession,
  type BearingCopilotApplyPayload,
  type BearingCopilotSession,
} from "@/lib/copilot/bearingCopilot";

type Props = {
  onApply: (payload: BearingCopilotApplyPayload) => void;
};

export default function BearingCopilotPanel({ onApply }: Props) {
  const [text, setText] = useState("");
  const [session, setSession] = useState<BearingCopilotSession | null>(null);

  const run = (brief: string) => {
    const value = brief.trim();
    if (!value) return;
    setText(brief);
    setSession(runBearingCopilotSession(value));
  };

  const tokenSummary = useMemo(() => session?.tokens ?? [], [session]);

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30">
      <div className="flex items-start gap-3 border-b border-indigo-200/50 px-4 py-3 dark:border-indigo-900/40">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <Bot className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Bearing copilot</h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Describe loads, speed, and life — ranks the catalog using ISO 281 / SKF rating life. Bearing
            module only; does not run shafts or housing.
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <label htmlFor="bearing-copilot-brief" className="sr-only">
          Bearing design brief
        </label>
        <textarea
          id="bearing-copilot-brief"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="e.g. Deep groove SKF bearing, 5 kN radial, 1 kN axial, 3000 rpm, 20000 h life"
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/90 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {BEARING_COPILOT_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => run(example)}
                className="max-w-[14rem] truncate rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[10px] text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                title={example}
              >
                {example.length > 42 ? `${example.slice(0, 40)}…` : example}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => run(text)}
            disabled={!text.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Size bearing
          </button>
        </div>
      </div>

      {session ? (
        <div className="space-y-3 border-t border-indigo-200/40 px-4 py-3 dark:border-indigo-900/30">
          {tokenSummary.length > 0 || session.hints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tokenSummary.map((token, index) => (
                <span
                  key={`${token.param}-${index}`}
                  className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                >
                  {token.param}: {formatTokenValue(token.value)} {token.unit}
                </span>
              ))}
              {session.hints.map((hint) => (
                <span
                  key={hint}
                  className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-medium text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
                >
                  {hint}
                </span>
              ))}
            </div>
          ) : null}

          {session.design?.best ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/25">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    <CircleCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Recommended designation
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {session.design.best.label}
                  </p>
                  {session.design.best.detail ? (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {session.design.best.detail}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {session.design.method}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onApply(session.apply)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Apply to form
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Could not size a bearing from this brief</p>
                <p className="mt-1 opacity-90">
                  Include radial load (kN), speed (rpm), and life (hours). Example: &quot;5 kN radial at
                  3000 rpm, 20000 h&quot;.
                </p>
              </div>
            </div>
          )}

          {session.notes.length > 0 ? (
            <ul className="space-y-0.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              {session.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-indigo-200/40 px-4 py-2 text-[10px] text-slate-400 dark:border-indigo-900/30">
          Deterministic sizing — numbers come from PhyCalcPro solvers, not a language model.
        </p>
      )}
    </section>
  );
}

function formatTokenValue(value: number): string {
  if (value >= 1000 || (value !== 0 && Math.abs(value) < 0.01)) return value.toExponential(2);
  return String(value);
}
