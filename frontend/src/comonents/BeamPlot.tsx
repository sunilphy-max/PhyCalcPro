import Plot from "react-plotly.js";

type BeamPlotProps = {
  x: number[];
  moment: number[];
};

export default function BeamPlot({ x, moment }: BeamPlotProps) {
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
      layout={{
        title: "Bending Moment Diagram",
        xaxis: { title: "Length (m)" },
        yaxis: { title: "Moment (Nm)" },
      }}
    />
  );
}
