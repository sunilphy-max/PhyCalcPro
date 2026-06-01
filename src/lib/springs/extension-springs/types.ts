import type { CompressionSpringConfig, CompressionSpringResult } from "../compression-springs/types";

export type ExtensionSpringConfig = CompressionSpringConfig;
export type ExtensionSpringResult = CompressionSpringResult & { initialTension: number };
