import React from "react";
import { Load, SupportType } from "@/lib/beam/types";

type Props = {
  length: number;
  loads: Load[];
  support: SupportType;
};

export default function BeamDiagram({ length, loads, support}: Props) {
  const width = 600;
  const height = 120;
  const margin = 40;

  const scaleX = (x: number) => (x / length) * (width - 2 * margin) + margin;

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        
        {/* Beam */}
        <line
          x1={margin}
          y1={60}
          x2={width - margin}
          y2={60}
          stroke="black"
          strokeWidth={4}
        />

        {/* Supports (simplified: pinned ends for now) */}
        <polygon
          points={`${margin},80 ${margin - 10},100 ${margin + 10},100`}
          fill="gray"
        />
        <polygon
          points={`${width - margin},80 ${width - margin - 10},100 ${width - margin + 10},100`}
          fill="gray"
        />

        {/* Loads */}
        {loads.map((load, i) => {
          if (load.type === "point") {
            const x = scaleX(load.position);

            return (
              <g key={i}>
                {/* Arrow */}
                <line
                  x1={x}
                  y1={20}
                  x2={x}
                  y2={60}
                  stroke="red"
                  strokeWidth={2}
                />
                <polygon
                  points={`${x},60 ${x - 6},50 ${x + 6},50`}
                  fill="red"
                />

                {/* Label */}
                <text x={x + 5} y={20} fontSize="10">
                  {load.value} N
                </text>
              </g>
            );
          }

          if (load.type === "udl") {
            const x1 = scaleX(load.start);
            const x2 = scaleX(load.end);

            return (
              <g key={i}>
                {/* UDL shaded region */}
                <rect
                  x={x1}
                  y={40}
                  width={x2 - x1}
                  height={20}
                  fill="rgba(0,0,255,0.2)"
                />

                {/* downward arrows */}
                <line x1={x1} y1={30} x2={x1} y2={60} stroke="blue" />
                <line x1={x2} y1={30} x2={x2} y2={60} stroke="blue" />

                <text x={(x1 + x2) / 2} y={35} fontSize="10" fill="blue">
                  {load.value} N/m
                </text>
              </g>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
}