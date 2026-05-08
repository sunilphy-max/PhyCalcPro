"use client";

import React, { useState } from "react";
import { Load, SupportType } from "@/lib/beam/types";

type Props = {
  length: number;
  loads: Load[];
  support: SupportType;

  onLoadDrag?: (id: string, updates: any) => void;

  probeX?: number | null;
  setProbeX?: (x: number | null) => void;
};

export default function BeamDiagram({
  length,
  loads = [],
  support,
  onLoadDrag,
  probeX,
  setProbeX,
}: Props) {
  const width = 600;
  const height = 140;
  const margin = 50;

  const scaleX = (x: number) =>
    (x / length) * (width - 2 * margin) + margin;

  // simple visual scaling (prevents huge arrows)
  const safeLoads = loads ?? [];
const [draggingId, setDraggingId] = useState<string | null>(null);
const maxLoad = Math.max(
  ...safeLoads.map((l) => Math.abs(l.value)),
  1
);

  const scaleLoad = (v: number) =>
    Math.max(20, (Math.abs(v) / maxLoad) * 60);
const unitLabel = "N"; 
const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
  if (!draggingId || !onLoadDrag) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const raw = (x / rect.width) * length;
  const clamped = Math.max(0, Math.min(length, raw));

  setProbeX?.(clamped);
  onLoadDrag(draggingId, { position: clamped });
};

const handleMouseUp = () => {
  setDraggingId(null);
};// later dynamic
  return (
    <div className="w-full bg-white rounded-lg p-4 shadow">
      <svg
  width="100%"
  viewBox={`0 0 ${width} ${height}`}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
>

{/* Grid */}
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
        {/* ================= BEAM ================= */}
        <line
          x1={margin}
          y1={70}
          x2={width - margin}
          y2={70}
          stroke="black"
          strokeWidth={4}
        />
{/* ================= AXIS ================= */}
<line
  x1={margin}
  y1={110}
  x2={width - margin}
  y2={110}
  stroke="#ccc"
  strokeWidth={1}
/>

<text x={margin - 5} y={125} fontSize="10">
  0
</text>

<text x={width - margin - 10} y={125} fontSize="10">
  {length}
</text>
        {/* ================= SUPPORTS ================= */}

        {/* LEFT SUPPORT */}
        {support === "simply_supported" && (
          <polygon
            points={`${margin},90 ${margin - 12},115 ${margin + 12},115`}
            fill="gray"
          />
        )}

        {support === "cantilever" && (
          <rect
            x={margin - 6}
            y={50}
            width={12}
            height={70}
            fill="gray"
          />
        )}

        {support === "fixed_fixed" && (
          <>
            <rect x={margin - 6} y={50} width={12} height={70} fill="gray" />
            <rect
              x={width - margin - 6}
              y={50}
              width={12}
              height={70}
              fill="gray"
            />
          </>
        )}

        {/* RIGHT SUPPORT */}
        {support === "simply_supported" && (
          <polygon
            points={`${width - margin},90 ${width - margin - 12},115 ${width - margin + 12},115`}
            fill="gray"
          />
        )}

        {/* PROBE LINE */}
{typeof probeX === "number" && (
  <line
    x1={scaleX(probeX)}
    y1={20}
    x2={scaleX(probeX)}
    y2={120}
    stroke="orange"
    strokeWidth={2}
    strokeDasharray="5 5"
  />
)}

        {/* ================= LOADS ================= */}
        {(loads ?? []).map((load) => {
          if (load.type === "point") {
            const x = scaleX(load.position);
            const h = scaleLoad(load.value);

            return (
              <g key={load.id}>
                <line
                  x1={x}
                  y1={70 - h}
                  x2={x}
                  y2={70}
                  stroke="red"
                  strokeWidth={2}
                />
                <polygon
  points={`${x},70 ${x - 5},60 ${x + 5},60`}
  fill="red"
  style={{ cursor: "grab" }}
  onMouseDown={() => setDraggingId(load.id + ":point")}
/>

                <text x={x + 5} y={70 - h - 5} fontSize="10" fill="red">
                  {load.value}{unitLabel}
                </text>
              </g>
            );
          }

          if (load.type === "udl") {
            const x1 = scaleX(load.start);
            const x2 = scaleX(load.end);

            return (
              <g key={load.id}>
                {/* UDL region */}
                <rect
                  x={x1}
                  y={60}
                  width={x2 - x1}
                  height={20}
                  fill="rgba(0,0,255,0.15)"
                />

                {/* arrows */}
                {Array.from({ length: 7 }).map((_, j) => {
  const x = x1 + ((x2 - x1) / 6) * j;

  return (
    <g key={j}>
      <line
        x1={x}
        y1={45}
        x2={x}
        y2={70}
        stroke="blue"
        strokeWidth={1.5}
      />
      <polygon
        points={`${x},70 ${x - 4},62 ${x + 4},62`}
        fill="blue"
      />
    </g>
  );
})}

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

          return null;
        })}

        {/* ================= SUPPORT LABELS ================= */}
        <text x={margin - 15} y={130} fontSize="10">
  {support === "cantilever" ? "Fixed" : "Support"}
</text>

        {support !== "cantilever" && (
  <text x={width - margin - 20} y={130} fontSize="10">
    Support
  </text>
)}
      </svg>
    </div>
  );
}