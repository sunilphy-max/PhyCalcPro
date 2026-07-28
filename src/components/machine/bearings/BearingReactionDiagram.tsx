"use client";

import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
  loadUnit?: string;
};

/**
 * Schematic shaft + bearing reaction diagram (screening FBD).
 * Single bearing or locating/floating / duplex stations when available.
 */
export default function BearingReactionDiagram({ result, loadUnit = "kN" }: Props) {
  const stations = result.pairedStations;
  const Fr = fromBase(Math.abs(result.radialLoad), "force", loadUnit);
  const Fa = fromBase(Math.abs(result.axialLoad), "force", loadUnit);

  if (stations && stations.length >= 2) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Shaft & bearing reaction diagram
        </p>
        <svg viewBox="0 0 420 160" className="mt-2 w-full" role="img" aria-label="Paired bearing reaction diagram">
          <line x1="40" y1="80" x2="380" y2="80" stroke="currentColor" className="text-slate-400" strokeWidth="3" />
          {stations.slice(0, 2).map((s, i) => {
            const x = i === 0 ? 110 : 310;
            const fr = fromBase(Math.abs(s.radialLoad), "force", loadUnit);
            const fa = fromBase(Math.abs(s.axialLoad), "force", loadUnit);
            return (
              <g key={s.index}>
                <rect
                  x={x - 14}
                  y={58}
                  width="28"
                  height="44"
                  rx="3"
                  className="fill-cyan-100 stroke-cyan-700 dark:fill-cyan-950 dark:stroke-cyan-400"
                  strokeWidth="2"
                />
                <text x={x} y={48} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="10" fontWeight="600">
                  {s.label ?? `B${i + 1}`}
                </text>
                <line x1={x} y1={102} x2={x} y2={130} stroke="#0e7490" strokeWidth="2" markerEnd="url(#arrowDown)" />
                <text x={x} y={144} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" fontSize="9">
                  Fr {formatDisplayNumber(fr)} {loadUnit}
                </text>
                {fa > 0 ? (
                  <>
                    <line
                      x1={x + 18}
                      y1={80}
                      x2={x + 48}
                      y2={80}
                      stroke="#7c3aed"
                      strokeWidth="2"
                      markerEnd="url(#arrowRight)"
                    />
                    <text x={x + 52} y={76} className="fill-violet-700 dark:fill-violet-300" fontSize="9">
                      Fa {formatDisplayNumber(fa)}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
          <defs>
            <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#0e7490" />
            </marker>
            <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#7c3aed" />
            </marker>
          </defs>
          {/* Applied load mid-span */}
          <line x1="210" y1="30" x2="210" y2="70" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrowLoad)" />
          <text x="210" y="22" textAnchor="middle" className="fill-red-600" fontSize="10" fontWeight="600">
            Applied loads
          </text>
          <defs>
            <marker id="arrowLoad" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
            </marker>
          </defs>
        </svg>
        <p className="mt-1 text-[11px] text-slate-500">
          Screening FBD — station Fr/Fa from arrangement split (not full shaft FEM). Use the shafts
          module for continuous reaction diagrams.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Shaft & bearing reaction diagram
      </p>
      <svg viewBox="0 0 360 150" className="mt-2 w-full" role="img" aria-label="Single bearing reaction diagram">
        <line x1="40" y1="75" x2="320" y2="75" stroke="currentColor" className="text-slate-400" strokeWidth="3" />
        <rect
          x="156"
          y="52"
          width="48"
          height="46"
          rx="4"
          className="fill-cyan-100 stroke-cyan-700 dark:fill-cyan-950 dark:stroke-cyan-400"
          strokeWidth="2"
        />
        <text x="180" y="44" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="11" fontWeight="600">
          {result.designation ?? "Bearing"}
        </text>
        <line x1="180" y1="98" x2="180" y2="128" stroke="#0e7490" strokeWidth="2.5" markerEnd="url(#sArrowDown)" />
        <text x="180" y="142" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" fontSize="10">
          Fr {formatDisplayNumber(Fr)} {loadUnit}
        </text>
        {Fa > 0 ? (
          <>
            <line x1="210" y1="75" x2="270" y2="75" stroke="#7c3aed" strokeWidth="2.5" markerEnd="url(#sArrowRight)" />
            <text x="275" y="70" className="fill-violet-700 dark:fill-violet-300" fontSize="10">
              Fa {formatDisplayNumber(Fa)} {loadUnit}
            </text>
          </>
        ) : null}
        <line x1="100" y1="28" x2="100" y2="68" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#sArrowLoad)" />
        <text x="100" y="20" textAnchor="middle" className="fill-red-600" fontSize="10" fontWeight="600">
          Load
        </text>
        <defs>
          <marker id="sArrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#0e7490" />
          </marker>
          <marker id="sArrowRight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#7c3aed" />
          </marker>
          <marker id="sArrowLoad" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-[11px] text-slate-500">
        Applied Fr / Fa at the bearing station (screening). Equivalent P ={" "}
        {formatDisplayNumber(fromBase(result.equivalentLoad, "force", loadUnit))} {loadUnit}.
      </p>
    </div>
  );
}
