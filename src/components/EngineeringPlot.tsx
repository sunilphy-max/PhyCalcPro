"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  yLabel: string;

  probeX?: number | null;
  peakValue?: number;
};

export default function EngineeringPlot({
  title,
  x,
  y,
  yLabel,
  probeX,
  peakValue,
}: Props) {
  const cleanY = y.map((v) => (Number.isFinite(v) ? v : 0));

  const peakIndex =
    cleanY.length > 0
      ? cleanY.findIndex(
          (v) => Math.abs(v) === Math.max(...cleanY.map(Math.abs))
        )
      : -1;

  return (
    <div className="bg-white rounded-xl shadow p-3">

      <div className="font-semibold text-sm mb-2">
        {title}
      </div>

      <Plot
        data={[
          {
            x,
            y: cleanY,
            type: "scatter",
            mode: "lines",
            name: yLabel,
          },

          // PEAK MARKER
          ...(peakIndex >= 0
            ? [
                {
                  x: [x[peakIndex]],
                  y: [cleanY[peakIndex]],
                  type: "scatter",
                  mode: "markers",
                  marker: {
                    size: 10,
                    symbol: "diamond",
                  },
                  name: "Peak",
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          height: 260,

          margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 40,
          },

          xaxis: {
            title: "Beam Position",
            zeroline: true,

            // PROBE LINE
            shapes:
              typeof probeX === "number"
                ? [
                    {
                      type: "line",
                      x0: probeX,
                      x1: probeX,
                      y0: Math.min(...cleanY),
                      y1: Math.max(...cleanY),

                      line: {
                        dash: "dot",
                        width: 2,
                      },
                    },
                  ]
                : [],
          },

          yaxis: {
            title: yLabel,
            zeroline: true,
          },

          showlegend: false,
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}