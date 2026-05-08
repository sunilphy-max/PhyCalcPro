import { BeamElement } from "./femTypes";

export function beamElementStiffness(element: BeamElement) {
  const { E, I, L } = element;
  const factor = (E * I) / (L * L * L);

  return [
    [12 * factor, 6 * L * factor, -12 * factor, 6 * L * factor],
    [6 * L * factor, 4 * L * L * factor, -6 * L * factor, 2 * L * L * factor],
    [-12 * factor, -6 * L * factor, 12 * factor, -6 * L * factor],
    [6 * L * factor, 2 * L * L * factor, -6 * L * factor, 4 * L * L * factor],
  ];
}
