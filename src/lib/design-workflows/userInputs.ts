import type { EndCondition } from "@/lib/structural/columns/types";
import type { Load } from "@/lib/structural/beams/types";
import type { BeamApplicationId } from "@/lib/structural/beams/applicationPresets";

/** Shared application preset id (see src/lib/applications). */
export type ApplicationPresetId = string;

/** Live module state passed from calculator pages to the design advisor and computed candidates. */
export type ModuleUserInputs = {
  // Beams / structural geometry
  length?: number;
  lengthUnit?: string;
  stressUnit?: string;
  width?: number;
  height?: number;
  loads?: Load[];
  support?: "simply_supported" | "cantilever" | "fixed_fixed";
  material?: string;
  E?: number;
  I?: number;
  c?: number;
  inertia?: number;
  applicationId?: BeamApplicationId;
  applicationPresetId?: ApplicationPresetId;
  allowableStressRatio?: number;
  deflectionLimitRatio?: number;
  allowableStressPa?: number;
  deflectionLimit?: number;
  sectionDesignation?: string;
  designMaxDeflection?: number;
  designMaxStressPa?: number;
  pressure?: number;
  thickness?: number;
  requiredI?: number;

  // Columns
  columnLength?: number;
  axialLoad?: number;
  area?: number;
  elasticModulus?: number;
  endCondition?: EndCondition;
  targetSafetyFactor?: number;

  // Springs
  wireDiameter?: number;
  meanDiameter?: number;
  activeCoils?: number;
  freeLength?: number;
  deflection?: number;
  modulus?: number;
  ultimateStrength?: number;
  targetRate?: number;
  maxForce?: number;
  maxOD?: number;
  initialTension?: number;
  legLength?: number;
  deflectionAngleDeg?: number;
  lift?: number;
  baseRadius?: number;

  // Power transmission
  power?: number;
  powerUnit?: string;
  forceUnit?: string;
  torqueUnit?: string;
  momentUnit?: string;
  pressureUnit?: string;
  frequencyUnit?: string;
  timeUnit?: string;
  temperatureUnit?: string;
  energyUnit?: string;
  massUnit?: string;
  velocityUnit?: string;
  speedDriver?: number;
  speedDriven?: number;
  rpm?: number;
  diameterDriver?: number;
  diameterDriven?: number;
  centerDistance?: number;
  serviceFactor?: number;
  ratio?: number;
  gearRatio?: number;
  beltSection?: string;

  // Machine
  torque?: number;
  bendingMoment?: number;
  /** Shaft FEM load cases (position in m; torque/bending in N·m). */
  shaftLoads?: Array<{
    position: number;
    torque?: number;
    bendingMoment?: number;
    axialForce?: number;
  }>;
  shearForce?: number;
  pinionTeeth?: number;
  module?: number;
  faceWidth?: number;
  bearingSeries?: string;
  bearingType?: import("@/data/catalogs/bearingCatalog").CatalogBearingType;
  bearingManufacturer?: "SKF" | "FAG" | "NSK" | "TIMKEN" | "NTN";
  bearingApplicationProfile?: "general_radial" | "combined_loads" | "heavy_shock" | "high_speed" | "space_limited" | "pure_thrust" | "locating_bearing" | "floating_bearing" | "all";
  bearingArrangement?: "single" | "back_to_back" | "face_to_face" | "tandem";
  bore?: number;
  diameter?: number;
  shaftDiameterMm?: number;
  energy?: number;
  requiredLife?: number;

  // Fasteners
  patternRadius?: number;
  eccentricity?: number;
  eccentricityX?: number;
  eccentricityY?: number;
  weldCount?: number;
  shaftDiameter?: number;
  count?: number;
  boltSize?: string;
  appliedStress?: number;
  loadFactor?: number;
  yieldStress?: number;

  // Materials
  stressAmplitude?: number;
  meanStress?: number;
  enduranceLimit?: number;
  targetCycles?: number;
  designLife?: number;
  minThickness?: number;
  requiredStrength?: number;
  temperature?: number;

  // Pressure / thermal
  heatDuty?: number;
  deltaT?: number;
  minGap?: number;
  nominalGap?: number;
  costTarget?: number;
  cycleTimeTarget?: number;

  // Dynamics
  mass?: number;
  dampingRatio?: number;
  excitationHz?: number;
  velocity?: number;
  impactDuration?: number;
  naturalFrequency?: number;
  dampingCoeff?: number;
  trackWidth?: number;
  wheelbase?: number;
  lateralAcceleration?: number;
  cgHeight?: number;
  efficiency?: number;
  powerFactor?: number;
  lineFrequencyHz?: number;
  serviceClass?: string;

  // Advanced
  heatLeak?: number;
  maxHeatLeak?: number;
  current?: number;
  coilLength?: number;
  targetField?: number;
  inductance?: number;
  leakRate?: number;

  /** Live calculator form snapshot (advanced-systems modules). */
  formValues?: Record<string, number>;
};
