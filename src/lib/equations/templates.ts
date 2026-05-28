import type { EquationTemplate } from "./types";

export const equationTemplates: EquationTemplate[] = [
  {
    id: "hydraulic-force",
    title: "Hydraulic Force (F = p*A)",
    expression: "p*A",
    outputDimension: "force",
    variables: [
      { key: "p", label: "Pressure", dimension: "pressure", min: 0 },
      { key: "A", label: "Area", dimension: "area", min: 0 },
    ],
  },
  {
    id: "beam-stress",
    title: "Bending Stress (sigma = M*c/I)",
    expression: "(M*c)/I",
    outputDimension: "stress",
    variables: [
      { key: "M", label: "Bending moment", dimension: "moment", min: 0 },
      { key: "c", label: "Outer fiber distance", dimension: "length", min: 0 },
      { key: "I", label: "Second moment of area", dimension: "inertia", min: 0 },
    ],
  },
];
