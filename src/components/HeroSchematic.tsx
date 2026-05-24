"use client";

export default function HeroSchematic() {
  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 shadow-[0_35px_60px_-25px_rgba(15,23,42,0.7)]">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Structural schematic
        </span>
        <span>Figure 1</span>
      </div>

      <div className="mb-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-slate-100">
        <svg viewBox="0 0 320 200" className="w-full h-[220px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="arrowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          <rect x="26" y="98" width="268" height="12" rx="6" fill="url(#beamGradient)" />
          <path d="M 50 110 L 50 130 L 44 126 M 50 130 L 56 126" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M 270 110 L 270 130 L 264 126 M 270 130 L 276 126" fill="none" stroke="#cbd5e1" strokeWidth="2" />

          <path d="M72 98 C82 72 108 52 136 56 S198 76 234 88" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />

          <path d="M 148 66 L 152 58 L 156 66" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 152 58 L 152 82" fill="none" stroke="#38bdf8" strokeWidth="2" />

          <g stroke="#f8fafc" strokeWidth="1.4" fill="none">
            <path d="M 52 170 L 52 136" />
            <path d="M 52 170 L 62 162" />
            <path d="M 52 170 L 42 162" />
            <path d="M 268 170 L 268 136" />
            <path d="M 268 170 L 278 162" />
            <path d="M 268 170 L 258 162" />
          </g>

          <path d="M 72 160 H 248" stroke="#64748b" strokeWidth="1" strokeDasharray="6 4" />
          <text x="160" y="177" textAnchor="middle" fontSize="10" fill="#cbd5e1">Span length</text>

          <circle cx="85" cy="82" r="5" fill="#38bdf8" />
          <circle cx="235" cy="90" r="5" fill="#f97316" />

          <text x="83" y="70" textAnchor="middle" fontSize="10" fill="#94a3b8">Support</text>
          <text x="235" y="100" textAnchor="middle" fontSize="10" fill="#94a3b8">Load</text>
        </svg>
      </div>

      <div className="grid gap-3 text-sm text-slate-300">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/90 p-3">
          <p className="text-slate-200 text-xs uppercase tracking-[0.22em]">Beam deflection</p>
          <p className="mt-2 text-sm">Visualize reactions, bending moment, and shear flow in a single view.</p>
        </div>
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/90 p-3">
          <p className="text-slate-200 text-xs uppercase tracking-[0.22em]">Precision design</p>
          <p className="mt-2 text-sm">Extract engineering quantities with confidence using FEM-based analysis.</p>
        </div>
      </div>
    </div>
  );
}
