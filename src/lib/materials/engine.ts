import type { SectionConfig, SectionResult } from "./types";

export function solveSectionEngine(config: SectionConfig): SectionResult {
  if (config.shape === "rectangle") {
    const width = config.width ?? 0;
    const height = config.height ?? 0;
    const area = width * height;
    const Ixx = (width * Math.pow(height, 3)) / 12;
    const Iyy = (height * Math.pow(width, 3)) / 12;

    return {
      shape: "rectangle",
      area,
      centroidY: height / 2,
      Ixx,
      Iyy,
    };
  }

  if (config.shape === "circle") {
    const diameter = config.diameter ?? 0;
    const radius = diameter / 2;
    const area = Math.PI * radius * radius;
    const Ixx = (Math.PI * Math.pow(diameter, 4)) / 64;
    const Iyy = Ixx;

    return {
      shape: "circle",
      area,
      centroidY: 0,
      Ixx,
      Iyy,
    };
  }

  const flangeWidth = config.flangeWidth ?? 0;
  const flangeThickness = config.flangeThickness ?? 0;
  const webHeight = config.webHeight ?? 0;
  const webThickness = config.webThickness ?? 0;
  const beamHeight = webHeight + 2 * flangeThickness;
  const area = 2 * flangeWidth * flangeThickness + webThickness * webHeight;

  const IxxFlange = (flangeWidth * Math.pow(flangeThickness, 3)) / 12;
  const IxxWeb = (webThickness * Math.pow(webHeight, 3)) / 12;
  const flangeDistance = (beamHeight / 2 - flangeThickness / 2);
  const Ixx = 2 * (IxxFlange + flangeWidth * flangeThickness * flangeDistance * flangeDistance) + IxxWeb;
  const Iyy = 2 * ((flangeThickness * Math.pow(flangeWidth, 3)) / 12) + (webHeight * Math.pow(webThickness, 3)) / 12;

  return {
    shape: "i_beam",
    area,
    centroidY: beamHeight / 2,
    Ixx,
    Iyy,
  };
}
