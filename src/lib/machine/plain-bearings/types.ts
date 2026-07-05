export type PlainBearingType = "journal" | "thrust_pad" | "tilting_pad";

export type PlainBearingConfig = {
  bearingType: PlainBearingType;
  load: number;
  speed: number;
  diameter: number;
  length: number;
  clearance: number;
  viscosity: number;
  /** Thrust pad outer/inner diameter ratio (thrust types). */
  padDiameterRatio?: number;
  /** Number of pads for tilting-pad thrust (typical 4–12). */
  padCount?: number;
};

export type PlainBearingResult = {
  bearingType: PlainBearingType;
  sommerfeldNumber: number;
  eccentricityRatio: number;
  minFilmThickness: number;
  powerLoss: number;
  unitLoad?: number;
  status: string;
};
