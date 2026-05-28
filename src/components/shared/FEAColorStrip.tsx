"use client";

type Props = {
  title: string;
  x: number[];
  values: number[];
  unit: string;
};

function normalize(values: number[]): number[] {
  const max = Math.max(...values.map((v) => Math.abs(v)), 1e-12);
  return values.map((v) => Math.abs(v) / max);
}

function colorFromScale(value01: number): string {
  const v = Math.max(0, Math.min(1, value01));
  const r = Math.round(255 * Math.min(1, Math.max(0, (v - 0.2) * 1.4)));
  const g = Math.round(255 * Math.min(1, Math.max(0, 1.2 - Math.abs(v - 0.5) * 2.2)));
  const b = Math.round(255 * Math.min(1, Math.max(0, (0.8 - v) * 1.6)));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function FEAColorStrip({ title, x, values, unit }: Props) {
  if (!x.length || !values.length || x.length !== values.length) {
    return null;
  }

  const normalized = normalize(values);
  const max = Math.max(...values.map((v) => Math.abs(v)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <span className="text-xs text-slate-500">Peak: {max.toExponential(3)} {unit}</span>
      </div>
      <div className="mt-3 flex h-7 overflow-hidden rounded-lg border border-slate-200">
        {normalized.map((value, index) => (
          <div
            key={`${index}-${x[index]}`}
            className="h-full flex-1"
            style={{ backgroundColor: colorFromScale(value) }}
            title={`x=${x[index].toFixed(3)}, value=${values[index].toExponential(3)} ${unit}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>0</span>
        <span>Relative intensity</span>
        <span>1</span>
      </div>
    </div>
  );
}
