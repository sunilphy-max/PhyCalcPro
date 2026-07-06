"use client";

import MathExpression from "@/components/shared/MathExpression";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  spec: CalculationSpec | null | undefined;
};

function EquationBlock({ expression, label, description }: { expression: string; label: string; description?: string }) {
  return (
    <li className="space-y-1">
      <p className="font-medium text-slate-800">{label}</p>
      <div className="rounded bg-slate-50 px-2 py-1.5 overflow-x-auto text-slate-800">
        <MathExpression expression={expression} display />
      </div>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
    </li>
  );
}

export default function CalculationBasisPanel({ spec }: Props) {
  if (!spec) return null;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-sm">
      <h3 className="font-semibold text-slate-900">Calculation basis</h3>

      {spec.standards.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">References</p>
          <ul className="mt-1 space-y-1 text-slate-700">
            {spec.standards.map((ref, index) => (
              <li key={`${ref.document}-${index}`}>
                {ref.body} {ref.document}
                {ref.clause ? ` — ${ref.clause}` : ""}
                {ref.edition ? ` (${ref.edition})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.equations.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Governing equations</p>
          <ul className="mt-2 space-y-3">
            {spec.equations.map((eq) => (
              <EquationBlock key={eq.id} label={eq.label} expression={eq.expression} description={eq.description} />
            ))}
          </ul>
        </div>
      ) : null}

      {spec.assumptions.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assumptions</p>
          <ul className="mt-1 list-disc pl-5 text-slate-600 space-y-1">
            {spec.assumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.limitations.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limitations</p>
          <ul className="mt-1 list-disc pl-5 text-slate-600 space-y-1">
            {spec.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.worksheetSteps?.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Worksheet steps</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Factor</th>
                  <th className="px-3 py-2 font-medium">Symbol</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {spec.worksheetSteps.map((row) => (
                  <tr key={`${row.label}-${row.symbol ?? row.value}`} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{row.label}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{row.symbol ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-slate-900">
                      {row.value}
                      {row.unit ? ` ${row.unit}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-2">
        Engine {spec.engineVersion} · {new Date(spec.computedAt).toLocaleString()}
      </p>
      <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
        Indicative and beta results do not constitute code compliance. Verify with the governing
        standard and a qualified engineer.
      </p>
    </div>
  );
}
