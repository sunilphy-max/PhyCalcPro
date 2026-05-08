import { SupportType } from "./types";

type Input = {
  x: number[];
  slope: number[];
  deflection: number[];
  support: SupportType;
};

export function applyBoundaryConditions({
  x,
  slope,
  deflection,
  support,
}: Input) {

  const L = x[x.length - 1];

  // ------------------------------------
  // CANTILEVER
  // fixed at x=0
  // ------------------------------------

  if (support === "cantilever") {

    // already naturally satisfied
    return {
      slope,
      deflection,
    };
  }

  // ------------------------------------
  // SIMPLY SUPPORTED / FIXED-FIXED
  // enforce y(0)=0 and y(L)=0
  // ------------------------------------

  const endDeflection =
    deflection[deflection.length - 1];

  const corrected = deflection.map((y, i) => {

    const xi = x[i];

    // subtract linear drift
    const correction =
      (endDeflection * xi) / L;

    return y - correction;
  });

  return {
    slope,
    deflection: corrected,
  };
}