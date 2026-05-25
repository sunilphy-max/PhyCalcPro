export type CorrosionConfig = {
  initialThickness: number;
  corrosionRate: number;
  designLife: number;
  safetyMargin: number;
};

export type CorrosionResult = {
  corrosionAllowance: number;
  requiredThickness: number;
  remainingThickness: number;
  designStatus: "nominal" | "review" | "critical";
};
