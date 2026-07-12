export type BeamApplicationId =
  | "general_mechanics"
  | "machine_frame"
  | "lifting_beam"
  | "crane_hoist_support"
  | "transformer_support"
  | "wind_turbine_support"
  | "aerospace_member"
  | "vacuum_cryogenic_support"
  | "magnetic_field_support";

export type BeamApplicationPreset = {
  id: BeamApplicationId;
  label: string;
  description: string;
  standards: string[];
  loadFactor: number;
  allowableStressRatio: number;
  deflectionLimitRatio: number;
  fatigueSensitive: boolean;
  calculationNotes: string[];
  limitations: string[];
};

export const beamApplicationPresets: BeamApplicationPreset[] = [
  {
    id: "general_mechanics",
    label: "General mechanics beam",
    description:
      "Elastic beam screening factors for brackets and machine members. Does not select cross-section.",
    standards: ["Roark's Formulas", "Timoshenko beam theory", "Machinery's Handbook"],
    loadFactor: 1,
    allowableStressRatio: 0.6,
    deflectionLimitRatio: 360,
    fatigueSensitive: false,
    calculationNotes: [
      "Uses entered loads directly.",
      "Checks stress against 0.60 x material yield as a conservative mechanical screening value.",
      "Preset sets load / stress / deflection knobs only — beam section is free.",
    ],
    limitations: [
      "Not a building-code design check.",
      "Connection, local buckling, weld, and fatigue-detail checks are not included.",
    ],
  },
  {
    id: "machine_frame",
    label: "Machine frame / equipment skid",
    description: "Industrial frame and skid screening with stronger fatigue and stiffness expectations.",
    standards: ["FKM Guideline", "ISO 12100", "Machinery's Handbook"],
    loadFactor: 1.25,
    allowableStressRatio: 0.5,
    deflectionLimitRatio: 500,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.25 design load factor to represent vibration, handling, and operating uncertainty.",
      "Uses a 0.50 x yield allowable stress target for preliminary static screening.",
    ],
    limitations: [
      "Does not classify welded details or calculate fatigue life.",
      "Guarding, risk reduction, and machine safety requirements must be checked separately.",
    ],
  },
  {
    id: "lifting_beam",
    label: "Lifting beam / below-hook device",
    description: "Preliminary lifting beam screening for rated load paths and below-hook devices.",
    standards: ["ASME BTH-1", "ASME B30.20", "EN 13155"],
    loadFactor: 1.5,
    allowableStressRatio: 0.4,
    deflectionLimitRatio: 600,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.50 design load factor before solving shear, moment, stress, and deflection.",
      "Uses a 0.40 x yield allowable stress target for conservative lifting-device screening.",
    ],
    limitations: [
      "Does not replace ASME BTH-1 design category/service class checks.",
      "Lugs, pins, welds, hooks, rigging angles, and proof-test requirements are not included.",
    ],
  },
  {
    id: "crane_hoist_support",
    label: "Crane / hoist support",
    description: "Industrial crane, hoist, and runway-support beam screening.",
    standards: ["CMAA 70", "CMAA 74", "EN 13001", "ISO 8686"],
    loadFactor: 1.35,
    allowableStressRatio: 0.45,
    deflectionLimitRatio: 750,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.35 design load factor for hoist dynamics and duty uncertainty.",
      "Uses a tighter L/750 deflection target often associated with crane serviceability screening.",
    ],
    limitations: [
      "Wheel loads, skewing, impact categories, and fatigue classes are not fully generated.",
      "Runway alignment and crane tolerance requirements are not included.",
    ],
  },
  {
    id: "transformer_support",
    label: "Transformer support / electrical equipment",
    description: "Support beams for transformers, electrical skids, and heavy equipment bases.",
    standards: ["IEEE C57 series", "IEC 60076", "IEEE 693", "ASCE 113"],
    loadFactor: 1.2,
    allowableStressRatio: 0.5,
    deflectionLimitRatio: 500,
    fatigueSensitive: false,
    calculationNotes: [
      "Applies a 1.20 design load factor for equipment handling, transport, and installation uncertainty.",
      "Uses a 0.50 x yield allowable stress target for preliminary support-frame checks.",
    ],
    limitations: [
      "Seismic qualification, anchorage, oil containment, and transformer tank checks are not included.",
      "Transport shock and short-circuit electromagnetic forces must be defined by the user as loads.",
    ],
  },
  {
    id: "wind_turbine_support",
    label: "Wind turbine / energy support",
    description: "Preliminary support screening for wind and renewable-energy equipment.",
    standards: ["IEC 61400 series", "DNV-ST-0126", "DNV-ST-0376", "DNV-RP-C203"],
    loadFactor: 1.35,
    allowableStressRatio: 0.4,
    deflectionLimitRatio: 500,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.35 design load factor to represent environmental and operating load uncertainty.",
      "Highlights fatigue sensitivity because wind support loads are often spectrum-driven.",
    ],
    limitations: [
      "Does not generate IEC load cases, wind spectra, tower dynamics, or offshore environmental loads.",
      "Weld detail fatigue and corrosion allowance must be checked separately.",
    ],
  },
  {
    id: "aerospace_member",
    label: "Aircraft / aerospace member",
    description: "Lightweight member screening with aerospace-style ultimate load margin awareness.",
    standards: ["FAA 14 CFR Part 23/25", "EASA CS-23/CS-25", "MMPDS", "CMH-17"],
    loadFactor: 1.5,
    allowableStressRatio: 0.45,
    deflectionLimitRatio: 1000,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.50 ultimate-style load factor before solving.",
      "Uses a tight L/1000 stiffness target for preliminary precision/lightweight structure screening.",
    ],
    limitations: [
      "This is not an airworthiness certification calculation.",
      "Limit/ultimate load derivation, joints, buckling, damage tolerance, and material allowables are not complete.",
    ],
  },
  {
    id: "vacuum_cryogenic_support",
    label: "Vacuum / cryogenic support",
    description: "Support screening for vacuum chambers, cryostats, cold hardware, and test stands.",
    standards: ["ASME BPVC VIII support context", "CGA cryogenic guidance", "ASTM E595"],
    loadFactor: 1.25,
    allowableStressRatio: 0.35,
    deflectionLimitRatio: 650,
    fatigueSensitive: false,
    calculationNotes: [
      "Applies a 1.25 design load factor for cooldown, handling, and vacuum-system uncertainty.",
      "Uses a 0.35 x yield stress target to leave margin for thermal contraction and low-temperature effects.",
    ],
    limitations: [
      "Thermal contraction, heat leak, vacuum-window stress, pressure-boundary rules, and material embrittlement are not solved.",
      "Outgassing and cleanliness requirements are standards references only.",
    ],
  },
  {
    id: "magnetic_field_support",
    label: "Magnetic-field / coil support",
    description: "Preliminary structure screening for coils, magnets, and Lorentz-force supports.",
    standards: ["IEC magnet/electrical equipment practice", "ITER magnet structural practice", "MMPDS where aerospace applies"],
    loadFactor: 1.3,
    allowableStressRatio: 0.4,
    deflectionLimitRatio: 600,
    fatigueSensitive: true,
    calculationNotes: [
      "Applies a 1.30 design load factor for electromagnetic load uncertainty.",
      "Treat Lorentz force, magnetic pressure, and coil preload as user-entered mechanical loads.",
    ],
    limitations: [
      "Magnetic fields, Lorentz force generation, coil quench, insulation, and thermal-electromagnetic coupling are not solved.",
      "Cyclic pulsed-field fatigue should be assessed with a dedicated fatigue method.",
    ],
  },
];

export function getBeamApplicationPreset(id: BeamApplicationId): BeamApplicationPreset {
  return beamApplicationPresets.find((preset) => preset.id === id) ?? beamApplicationPresets[0]!;
}
