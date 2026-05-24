import type { CamToolpathsConfig, CamToolpathsResult } from "./types";

export function solveCamToolpathsEngine(config: CamToolpathsConfig): CamToolpathsResult {
  const toolDiameter = Math.max(config.toolDiameter, 1);
  const numFlutes = Math.max(config.numFlutes, 1);
  const spindleSpeed = Math.max(config.spindleSpeed, 100);
  const feedPerTooth = Math.max(config.feedPerTooth, 0.01);
  const axialDepth = Math.max(config.axialDepth, 0.1);
  const stockLength = Math.max(config.stockLength, 1);
  const stockWidth = Math.max(config.stockWidth, toolDiameter);
  const stepOverFraction = Math.min(Math.max(config.stepOverPercent / 100, 0.1), 1);
  const radialDepth = Math.max(config.radialDepth, 0.1);

  const feedRate = feedPerTooth * numFlutes * spindleSpeed;
  const surfaceSpeed = (Math.PI * toolDiameter * spindleSpeed) / 1000;
  const stepOverWidth = Math.min(toolDiameter * stepOverFraction, stockWidth);
  const passes = Math.max(Math.ceil(stockWidth / stepOverWidth), 1);
  const materialRemovalRate = feedRate * axialDepth * stepOverWidth;
  const timePerPass = stockLength / Math.max(feedRate / 60, 1);
  const totalCutTime = timePerPass * passes;

  return {
    toolDiameter,
    numFlutes,
    spindleSpeed,
    feedPerTooth,
    feedRate,
    surfaceSpeed,
    stepOverWidth,
    passes,
    materialRemovalRate,
    timePerPass,
    totalCutTime,
    axialDepth,
    radialDepth,
    stockLength,
    stockWidth,
  };
}
