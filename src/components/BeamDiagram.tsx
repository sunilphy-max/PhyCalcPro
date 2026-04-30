"use client";

import React from "react";
import { Load, SupportType } from "@/lib/beam/types";

type Props = {
  length: number;
  loads: Load[];
  support: SupportType;
};

export default function BeamDiagram({
  length,
  loads,
  support,
}: Props) {
  const width = 600;
  const height = 140;
  const margin = 50;

  const scaleX = (x: number) =>
    (x / length) * (width - 2 * margin) + margin;

  // simple visual scaling (prevents huge arrows)
  const maxLoad = Math.max(
    ...loads.map((l) => Math.abs(l.value)),
    1
  );

  const scaleLoad = (v: number) =>
    Math.max(20, (Math.abs(v) / maxLoad) * 60);

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>

        {/* ================= BEAM ================= */}
        <line
          x1={margin}
          y1={70}
          x2={width - margin}
          y2={70}
          stroke="black"
          strokeWidth={4}
        />

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

        {/* ================= LOADS ================= */}
        {loads.map((load, i) => {
          if (load.type === "point") {
            const x = scaleX(load.position);
            const h = scaleLoad(load.value);

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={70 - h}
                  x2={x}
                  y2={70}
                  stroke="red"
                  strokeWidth={2}
                />
                <polygon
                  points={`${x},70 ${x - 6},60 ${x + 6},60`}
                  fill="red"
                />

                <text x={x + 5} y={40} fontSize="10" fill="red">
                  {load.value}
                </text>
              </g>
            );
          }

          if (load.type === "udl") {
            const x1 = scaleX(load.start);
            const x2 = scaleX(load.end);

            return (
              <g key={i}>
                {/* UDL region */}
                <rect
                  x={x1}
                  y={60}
                  width={x2 - x1}
                  height={20}
                  fill="rgba(0,0,255,0.15)"
                />

                {/* arrows */}
                {Array.from({ length: 5 }).map((_, j) => {
                  const x =
                    x1 + ((x2 - x1) / 4) * j;

                  return (
                    <line
                      key={j}
                      x1={x}
                      y1={40}
                      x2={x}
                      y2={70}
                      stroke="blue"
                    />
                  );
                })}

                <text
                  x={(x1 + x2) / 2}
                  y={35}
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
        <text x={margin - 10} y={130} fontSize="10">
          Support
        </text>

        <text x={width - margin - 20} y={130} fontSize="10">
          Support
        </text>
      </svg>
    </div>
  );
}