export type SectionShape = "rectangle" | "circle" | "i_beam";

export type SectionConfig = {
  shape: SectionShape;
  width?: number;
  height?: number;
  diameter?: number;
  flangeWidth?: number;
  flangeThickness?: number;
  webHeight?: number;
  webThickness?: number;
};

export type SectionResult = {
  shape: SectionShape;
  area: number;
  centroidY: number;
  Ixx: number;
  Iyy: number;
};
