import Plot from "react-plotly.js";
import { Layout } from "plotly.js";

type BeamPlotProps = {
  x: number[];
  moment: number[];
};

export default function BeamPlot({ x, moment }: BeamPlotProps) {
  const layout: Partial<Layout> = {
    title: { text: "Bending Moment Diagram" },
    xaxis: { title: { text: "Length (m)" } },
    yaxis: { title: { text: "Moment (Nm)" } },
  };

  return (
    <Plot
      data={[
        {
          x: x,
          y: moment,
          type: "scatter",
          mode: "lines",
        },
      ]}
      layout={layout}
    />
  );
}
