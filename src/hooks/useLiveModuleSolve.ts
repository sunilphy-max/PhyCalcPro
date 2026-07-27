"use client";

import { useDeferredValue, useEffect, useRef } from "react";

type Options<TInput, TResult> = {
  /** When false, live solve is disabled (user must Calculate). */
  enabled?: boolean;
  input: TInput;
  /** Serialize input for change detection */
  serialize?: (input: TInput) => string;
  solve: (input: TInput) => TResult;
  onResult: (result: TResult) => void;
  /** Debounce after deferred value settles (ms) */
  settleMs?: number;
};

/**
 * Deferred live solve for lightweight modules (beams, bearings preview).
 * Heavy FEM modules should pass enabled=false or gate behind a Live preview toggle.
 */
export function useLiveModuleSolve<TInput, TResult>({
  enabled = true,
  input,
  serialize = (v) => JSON.stringify(v),
  solve,
  onResult,
  settleMs = 80,
}: Options<TInput, TResult>) {
  const deferred = useDeferredValue(input);
  const key = serialize(deferred);
  const onResultRef = useRef(onResult);
  const solveRef = useRef(solve);
  onResultRef.current = onResult;
  solveRef.current = solve;

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      try {
        const result = solveRef.current(deferred);
        onResultRef.current(result);
      } catch {
        // Leave last good result; UI may show validation separately.
      }
    }, settleMs);
    return () => window.clearTimeout(timer);
  }, [enabled, key, deferred, settleMs]);
}
