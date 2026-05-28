"use client";

import { useMemo } from "react";

export type CalculationPipeline<TInput, TNormalized, TRaw, TOutput> = {
  normalize: (input: TInput) => TNormalized;
  solve: (normalized: TNormalized) => TRaw;
  convertOutput: (raw: TRaw, normalized: TNormalized) => TOutput;
};

export function useCalculationPipeline<TInput, TNormalized, TRaw, TOutput>(
  pipeline: CalculationPipeline<TInput, TNormalized, TRaw, TOutput>
) {
  return useMemo(() => {
    return {
      run(input: TInput) {
        const normalized = pipeline.normalize(input);
        const raw = pipeline.solve(normalized);
        const output = pipeline.convertOutput(raw, normalized);
        return { normalized, raw, output };
      },
    };
  }, [pipeline]);
}
