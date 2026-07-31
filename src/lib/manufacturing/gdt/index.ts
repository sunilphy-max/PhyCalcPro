/**
 * Client-safe GD&T exports only.
 * Do NOT re-export parseDrawing / rasterizePdf here — those pull @napi-rs/canvas
 * and must stay server-only (imported from the API route).
 */
export type {
  DrawingExtract,
  DrawingMetadata,
  FitCallout,
  GdtStackConfig,
  GdtStackResult,
} from "./types";
export { geometricBonus, materialBoundaries, sizeToleranceWidth, worstCaseBonusSize } from "./bonus";
export { gdtStackConfigFromFlat, solveGdtStackEngine } from "./engine";
export { drawingExtractToGdtStack } from "./fromExtract";
export {
  emptyDrawingExtract,
  parseIsoFitDesignation,
  validateDrawingExtract,
} from "./schema";
