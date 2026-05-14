import { SupportType } from "./types";

export function constrainedDOF(
  nodeCount: number,
  support: SupportType
) {

  // DOF:
  // node*2     = vertical
  // node*2 +1 = rotation

  if (support === "cantilever") {

    return [
      0, // v0
      1, // θ0
    ];
  }

  if (support === "simply_supported") {

    return [
      0,
      (nodeCount - 1) * 2,
    ];
  }

  // fixed-fixed

  return [
    0,
    1,
    (nodeCount - 1) * 2,
    (nodeCount - 1) * 2 + 1,
  ];
}