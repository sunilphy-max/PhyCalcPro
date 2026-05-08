import { FEMModel } from "./femTypes";
import { beamElementStiffness } from "./stiffness";

export function assembleGlobalStiffness(
  model: FEMModel
) {

  const dof =
    model.nodes.length * 2;

  const K =
    Array.from({ length: dof }, () =>
      Array(dof).fill(0)
    );

  for (const element of model.elements) {

    const ke =
      beamElementStiffness(element);

    const map = [
      element.startNode * 2,
      element.startNode * 2 + 1,
      element.endNode * 2,
      element.endNode * 2 + 1,
    ];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[map[i]][map[j]] += ke[i][j];
      }
    }
  }

  return K;
}
