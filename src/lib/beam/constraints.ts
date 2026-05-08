import { SupportType } from "./types";

export function constrainedDOF(
  nodeCount: number,
  support: SupportType
) {
  const dof: number[] = [];

  if (support === "cantilever") {
    dof.push(0, 1);
  }

  if (support === "simply_supported") {
    dof.push(0, (nodeCount - 1) * 2);
  }

  if (support === "fixed_fixed") {
    dof.push(0, 1, (nodeCount - 1) * 2, (nodeCount - 1) * 2 + 1);
  }

  return dof;
}
