"use client";

import React, { useEffect, useState } from "react";
import type {
  BeamSupport,
  Load,
  SupportReaction,
  SupportType,
} from "@/lib/structural/beams/types";
import {
  BEAM_LOAD_DRAG_MIME,
  type BeamLoadLibraryType,
} from "@/components/structural/beams/BeamLoadLibrary";

type DragTarget =
  | { kind: "point" | "moment"; id: string }
  | { kind: "udl-start" | "udl-end" | "tri-start" | "tri-end"; id: string }
  | { kind: "support"; id: string };

type Props = {
  length: number;
  loads: Load[];
  support?: SupportType | "continuous";
  supports?: BeamSupport[];

  onLoadDrag?: (id: string, updates: Partial<Load>) => void;
  onSupportDrag?: (id: string, x: number) => void;
  /** Drop a load-library tile onto the beam at position x */
  onDropLoad?: (type: BeamLoadLibraryType, x: number) => void;

  probeX?: number | null;
  setProbeX?: (x: number | null) => void;

  xPositions?: number[];
  deflection?: number[];
  supportReactions?: SupportReaction[];
  /** Animate deformed shape from flat → solved (EDP-1) */
  animateDeflection?: boolean;
};

export default function BeamDiagram({
  length,
  loads = [],
  support = "simply_supported",
  supports,
  onLoadDrag,
  onSupportDrag,
  onDropLoad,
  probeX,
  setProbeX,
  xPositions,
  deflection,
  supportReactions,
  animateDeflection = true,
}: Props) {
  const width = 600;
  const height = 168;
  const margin = 50;
  const beamY = 70;

  const scaleX = (x: number) => (x / Math.max(length, 1e-9)) * (width - 2 * margin) + margin;

  const clientXToBeamX = (svg: SVGSVGElement, clientX: number) => {
    const rect = svg.getBoundingClientRect();
    const raw = ((clientX - rect.left) / Math.max(rect.width, 1e-9)) * length;
    return Math.max(0, Math.min(length, raw));
  };

  const safeLoads = loads ?? [];
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [deflectionAmp, setDeflectionAmp] = useState(animateDeflection ? 0 : 1);

  const displaySupports: BeamSupport[] =
    supports && supports.length > 0
      ? supports
      : support === "cantilever"
        ? [{ id: "left", x: 0, kind: "fixed" }]
        : support === "fixed_fixed"
          ? [
              { id: "left", x: 0, kind: "fixed" },
              { id: "right", x: length, kind: "fixed" },
            ]
          : [
              { id: "left", x: 0, kind: "pin" },
              { id: "right", x: length, kind: "roller" },
            ];

  const maxLoad = Math.max(
    ...safeLoads.map((l) => {
      if (l.type === "point" || l.type === "moment" || l.type === "udl") return Math.abs(l.value);
      if (l.type === "triangular") return Math.max(Math.abs(l.wStart), Math.abs(l.wEnd));
      return 1;
    }),
    1
  );

  useEffect(() => {
    if (!animateDeflection) {
      setDeflectionAmp(1);
      return;
    }
    setDeflectionAmp(0);
    let raf = 0;
    const start = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDeflectionAmp(1 - (1 - t) ** 3);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateDeflection, deflection, xPositions, length]);

  const scaleLoad = (v: number) => Math.max(20, (Math.abs(v) / maxLoad) * 60);

  const applyDrag = (clamped: number) => {
    if (!dragging) return;

    if (dragging.kind === "support") {
      onSupportDrag?.(dragging.id, clamped);
      return;
    }

    if (!onLoadDrag) return;
    setProbeX?.(clamped);

    if (dragging.kind === "point" || dragging.kind === "moment") {
      onLoadDrag(dragging.id, { position: clamped } as Partial<Load>);
      return;
    }
    if (dragging.kind === "udl-start" || dragging.kind === "tri-start") {
      onLoadDrag(dragging.id, { start: clamped } as Partial<Load>);
      return;
    }
    if (dragging.kind === "udl-end" || dragging.kind === "tri-end") {
      onLoadDrag(dragging.id, { end: clamped } as Partial<Load>);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    applyDrag(clientXToBeamX(e.currentTarget, e.clientX));
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    applyDrag(clientXToBeamX(e.currentTarget, touch.clientX));
  };

  const handleMouseUp = () => setDragging(null);

  const handleDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    setDropHover(false);
    if (!onDropLoad) return;
    const type = e.dataTransfer.getData(BEAM_LOAD_DRAG_MIME) as BeamLoadLibraryType;
    if (!type || type === "self-weight") return;
    onDropLoad(type, clientXToBeamX(e.currentTarget, e.clientX));
  };

  const maxDeflection = deflection?.length
    ? Math.max(...deflection.map((v) => Math.abs(v)), 1)
    : 1;
  const deflectionScale = Math.min(30, 30 / maxDeflection);

  const deformationPath =
    xPositions && deflection && xPositions.length === deflection.length
      ? xPositions
          .map((x, i) => {
            const scaledY = beamY - (deflection[i] ?? 0) * deflectionScale * deflectionAmp;
            return `${i === 0 ? "M" : "L"} ${scaleX(x)} ${scaledY}`;
          })
          .join(" ")
      : null;

  const reactionById = new Map(
    (supportReactions ?? []).map((r) => [r.supportId, r])
  );
  const maxReaction = Math.max(
    ...(supportReactions ?? []).map((r) => Math.abs(r.Fy)),
    1
  );
  const reactionHeight = (force: number) => 12 + (Math.abs(force) / maxReaction) * 24;
  const reactionY = (force: number) =>
    force >= 0 ? beamY - reactionHeight(force) : beamY + reactionHeight(force);

  return (
    <div
      className={`w-full rounded-lg bg-white p-4 shadow transition ring-offset-2 ${
        dropHover ? "ring-2 ring-cyan-400" : ""
      } ${dragging ? "ring-1 ring-amber-300" : ""}`}
    >
      <p className="mb-2 text-[11px] text-slate-500">
        Drag loads and supports along the span
        {onDropLoad ? " · drop a load from the library onto the beam" : ""}.
        Click the beam to place a probe.
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setDropHover(false);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onDragOver={(e) => {
          if (!onDropLoad) return;
          e.preventDefault();
          setDropHover(true);
        }}
        onDragLeave={() => setDropHover(false)}
        onDrop={handleDrop}
        onClick={(e) => {
          if (dragging) return;
          if ((e.target as Element).closest("[data-beam-handle]")) return;
          setProbeX?.(clientXToBeamX(e.currentTarget, e.clientX));
        }}
        style={{ touchAction: "none" }}
      >
        {dropHover ? (
          <rect
            x={margin}
            y={beamY - 18}
            width={width - 2 * margin}
            height={36}
            fill="rgba(34,211,238,0.12)"
            stroke="#22d3ee"
            strokeDasharray="4 3"
            rx={4}
          />
        ) : null}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = 50 + i * 10;
          return (
            <line
              key={i}
              x1={margin}
              y1={y}
              x2={width - margin}
              y2={y}
              stroke="#f3f3f3"
              strokeWidth={1}
            />
          );
        })}

        <line
          x1={margin}
          y1={beamY}
          x2={width - margin}
          y2={beamY}
          stroke="#d1d5db"
          strokeWidth={4}
        />

        {deformationPath && (
          <path
            d={deformationPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            opacity={0.95}
          />
        )}

        <line
          x1={margin}
          y1={beamY}
          x2={width - margin}
          y2={beamY}
          stroke="black"
          strokeWidth={2}
        />

        <line
          x1={margin}
          y1={120}
          x2={width - margin}
          y2={120}
          stroke="#ccc"
          strokeWidth={1}
        />
        <text x={margin - 5} y={135} fontSize="10">
          0
        </text>
        <text x={width - margin - 10} y={135} fontSize="10">
          {length}
        </text>

        {displaySupports.map((sp) => {
          const sx = scaleX(sp.x);
          const reaction = reactionById.get(sp.id);
          return (
            <g key={sp.id}>
              {sp.kind === "fixed" ? (
                <rect
                  x={sx - 6}
                  y={50}
                  width={12}
                  height={50}
                  fill="#334155"
                  data-beam-handle=""
                  style={{ cursor: onSupportDrag ? "ew-resize" : "default" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "support", id: sp.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "support", id: sp.id });
                  }}
                />
              ) : (
                <polygon
                  points={`${sx},${beamY + 8} ${sx - 10},${beamY + 28} ${sx + 10},${beamY + 28}`}
                  fill={sp.kind === "roller" ? "#64748b" : "#0f172a"}
                  data-beam-handle=""
                  style={{ cursor: onSupportDrag ? "ew-resize" : "default" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "support", id: sp.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "support", id: sp.id });
                  }}
                />
              )}
              {sp.kind === "roller" && (
                <circle cx={sx} cy={beamY + 32} r={4} fill="#64748b" />
              )}
              <text x={sx} y={148} fontSize="9" textAnchor="middle" fill="#475569">
                {sp.kind}
              </text>
              {reaction && (
                <>
                  <line
                    x1={sx}
                    y1={beamY}
                    x2={sx}
                    y2={reactionY(reaction.Fy)}
                    stroke="#047857"
                    strokeWidth={2}
                  />
                  <text
                    x={sx + 4}
                    y={reactionY(reaction.Fy) - 4}
                    fontSize="9"
                    fill="#047857"
                  >
                    {Math.abs(reaction.Fy).toFixed(0)} N
                  </text>
                  {reaction.Mz != null && (
                    <text x={sx + 4} y={beamY - 36} fontSize="9" fill="#0f766e">
                      M {Math.abs(reaction.Mz).toFixed(0)}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}

        {typeof probeX === "number" && (
          <line
            x1={scaleX(probeX)}
            y1={20}
            x2={scaleX(probeX)}
            y2={130}
            stroke="orange"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}

        {safeLoads.map((load) => {
          const isActive =
            dragging != null &&
            "id" in dragging &&
            dragging.id === load.id;
          const activeOpacity = isActive ? 1 : dragging ? 0.55 : 1;

          if (load.type === "point") {
            const x = scaleX(load.position);
            const h = scaleLoad(load.value);
            return (
              <g key={load.id} opacity={activeOpacity}>
                <line x1={x} y1={beamY - h} x2={x} y2={beamY} stroke="red" strokeWidth={2} />
                <polygon
                  points={`${x},${beamY} ${x - 5},${beamY - 10} ${x + 5},${beamY - 10}`}
                  fill="red"
                  data-beam-handle=""
                  style={{ cursor: "grab" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "point", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "point", id: load.id });
                  }}
                />
                {isActive ? (
                  <circle cx={x} cy={beamY - h / 2} r={10} fill="none" stroke="#f59e0b" strokeWidth={2} />
                ) : null}
                <text x={x + 5} y={beamY - h - 5} fontSize="10" fill="red">
                  {load.value} N
                </text>
              </g>
            );
          }

          if (load.type === "moment") {
            const x = scaleX(load.position);
            return (
              <g key={load.id} opacity={activeOpacity}>
                <path
                  d={`M ${x - 14} ${beamY - 18} A 14 14 0 1 1 ${x + 14} ${beamY - 18}`}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  data-beam-handle=""
                  style={{ cursor: "grab" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "moment", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "moment", id: load.id });
                  }}
                />
                <polygon
                  points={`${x + 14},${beamY - 18} ${x + 8},${beamY - 24} ${x + 20},${beamY - 22}`}
                  fill="#7c3aed"
                />
                {isActive ? (
                  <circle cx={x} cy={beamY - 18} r={18} fill="none" stroke="#f59e0b" strokeWidth={2} />
                ) : null}
                <text x={x} y={beamY - 36} textAnchor="middle" fontSize="10" fill="#7c3aed">
                  {load.value} N·m
                </text>
              </g>
            );
          }

          if (load.type === "udl") {
            const x1 = scaleX(Math.min(load.start, load.end));
            const x2 = scaleX(Math.max(load.start, load.end));
            return (
              <g key={load.id} opacity={activeOpacity}>
                <rect
                  x={x1}
                  y={60}
                  width={Math.max(x2 - x1, 1)}
                  height={20}
                  fill="rgba(0,0,255,0.15)"
                  stroke={isActive ? "#f59e0b" : "none"}
                  strokeWidth={isActive ? 2 : 0}
                />
                {Array.from({ length: 7 }).map((_, j) => {
                  const x = x1 + ((x2 - x1) / 6) * j;
                  return (
                    <g key={j}>
                      <line x1={x} y1={45} x2={x} y2={beamY} stroke="blue" strokeWidth={1.5} />
                      <polygon
                        points={`${x},${beamY} ${x - 4},${beamY - 8} ${x + 4},${beamY - 8}`}
                        fill="blue"
                      />
                    </g>
                  );
                })}
                <circle
                  cx={x1}
                  cy={55}
                  r={5}
                  fill="#1d4ed8"
                  data-beam-handle=""
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "udl-start", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "udl-start", id: load.id });
                  }}
                />
                <circle
                  cx={x2}
                  cy={55}
                  r={5}
                  fill="#1d4ed8"
                  data-beam-handle=""
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "udl-end", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "udl-end", id: load.id });
                  }}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={30}
                  textAnchor="middle"
                  fontSize="10"
                  fill="blue"
                >
                  {load.value} N/m
                </text>
              </g>
            );
          }

          if (load.type === "triangular") {
            const x1 = scaleX(Math.min(load.start, load.end));
            const x2 = scaleX(Math.max(load.start, load.end));
            const h1 = 10 + (Math.abs(load.wStart) / maxLoad) * 28;
            const h2 = 10 + (Math.abs(load.wEnd) / maxLoad) * 28;
            return (
              <g key={load.id} opacity={activeOpacity}>
                <polygon
                  points={`${x1},${beamY} ${x1},${beamY - h1} ${x2},${beamY - h2} ${x2},${beamY}`}
                  fill="rgba(14,165,233,0.2)"
                  stroke={isActive ? "#f59e0b" : "#0284c7"}
                  strokeWidth={isActive ? 2 : 1}
                />
                <circle
                  cx={x1}
                  cy={beamY - h1}
                  r={5}
                  fill="#0284c7"
                  data-beam-handle=""
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "tri-start", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "tri-start", id: load.id });
                  }}
                />
                <circle
                  cx={x2}
                  cy={beamY - h2}
                  r={5}
                  fill="#0284c7"
                  data-beam-handle=""
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "tri-end", id: load.id });
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDragging({ kind: "tri-end", id: load.id });
                  }}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={28}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#0369a1"
                >
                  {load.wStart}→{load.wEnd} N/m
                </text>
              </g>
            );
          }

          return null;
        })}

        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#047857" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
