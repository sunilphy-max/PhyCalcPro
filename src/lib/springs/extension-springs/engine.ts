import { solveCompressionSpringEngine } from "../compression-springs/engine";
import type { ExtensionSpringConfig, ExtensionSpringResult } from "./types";

export function solveExtensionSpringEngine(c: ExtensionSpringConfig): ExtensionSpringResult {
  const base = solveCompressionSpringEngine(c);
  const initialTension = base.springRate * 0.1 * c.freeLength;
  return { ...base, initialTension };
}
