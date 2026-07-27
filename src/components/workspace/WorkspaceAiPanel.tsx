"use client";

import { useState } from "react";
import type { CopilotParams } from "@/lib/copilot/types";

type ApplyPayload = {
  params: CopilotParams;
  startModuleId: string | null;
  explanation: string;
  source: "llm" | "deterministic";
};

type Props = {
  moduleId: string;
  defaultBrief?: string;
  onApply?: (payload: ApplyPayload) => void;
};

/**
 * Workspace AI panel (EDP-5) — calls /api/ai/parse-brief; numbers still come from solvers after apply.
 */
export default function WorkspaceAiPanel({ moduleId, defaultBrief = "", onApply }: Props) {
  const [brief, setBrief] = useState(defaultBrief);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<ApplyPayload | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parse-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, moduleId }),
      });
      const data = (await res.json()) as ApplyPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "AI parse failed");
      setLast(data);
      onApply?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI parse failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI design assistant</h3>
        <p className="mt-1 text-xs text-slate-500">
          Describe the design intent. The assistant proposes calculator inputs; verified solvers compute
          all results. Never invents numeric answers.
        </p>
      </div>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={4}
        placeholder='e.g. "Design a steel beam for a 500 kg machine spanning 3 m with less than 2 mm deflection."'
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
      />
      <button
        type="button"
        disabled={busy || !brief.trim()}
        onClick={() => void run()}
        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {busy ? "Parsing…" : "Parse brief → inputs"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {last ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/50">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Source: {last.source} · module {last.startModuleId ?? moduleId}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{last.explanation}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-white p-2 dark:bg-slate-900">
            {JSON.stringify(last.params, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
