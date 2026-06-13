"use client";

function ColumnEndSchematic({ k }: { k: number }) {
  const label =
    k <= 0.51 ? "Fixed–fixed" : k <= 0.71 ? "Fixed–pinned" : k <= 1.01 ? "Pinned–pinned" : "Fixed–free";
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-diagram="true"
      data-export-caption="Column end conditions"
      role="img"
      aria-label={`Column schematic with effective length factor k=${k.toFixed(2)} (${label}).`}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">End conditions</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        k = {k.toFixed(2)} · {label}
      </p>
      <svg viewBox="0 0 320 200" className="mt-3 h-auto w-full" aria-hidden="true">
        <line x1="160" y1="30" x2="160" y2="170" stroke="currentColor" strokeWidth="8" className="text-slate-600" />
        <rect x="130" y="20" width="60" height="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
        {k >= 1.5 ? (
          <circle cx="160" cy="178" r="6" fill="currentColor" className="text-slate-500" />
        ) : (
          <rect x="130" y="178" width="60" height="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
        )}
        <text x="200" y="105" className="fill-slate-600 text-[12px]">
          Le = k·L
        </text>
      </svg>
    </div>
  );
}

export default ColumnEndSchematic;
