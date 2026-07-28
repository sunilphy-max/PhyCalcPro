/**
 * Curated use-case recommendations for the Material Encyclopedia assistant.
 */

export type MaterialUseCaseRecommendation = {
  materialId: string;
  reasons: string[];
};

export type MaterialUseCase = {
  id: string;
  label: string;
  description: string;
  /** Calculator module route preference for "Use in …" */
  moduleId?: string;
  /** MaterialSelect profile hint */
  profile?: string;
  recommendations: MaterialUseCaseRecommendation[];
};

export const materialUseCases: MaterialUseCase[] = [
  {
    id: "beam",
    label: "Beam",
    description: "Building and industrial flexural members (W-shapes / rolled sections).",
    moduleId: "beams",
    profile: "structural",
    recommendations: [
      {
        materialId: "astm-a992",
        reasons: [
          "Highest strength/weight ratio among common W-shape grades",
          "Most common US wide-flange stock",
          "Excellent weldability for building frames",
        ],
      },
      {
        materialId: "s355jr",
        reasons: [
          "European workhorse for primary beams and plate girders",
          "Higher yield than S235/S275 for lighter members",
          "Widely stocked EN sections",
        ],
      },
      {
        materialId: "astm-a36",
        reasons: [
          "Familiar US mild steel for secondary members and plate",
          "Excellent fabrication and weldability",
          "Commodity pricing and availability",
        ],
      },
    ],
  },
  {
    id: "column",
    label: "Column",
    description: "Axially loaded compression members and building columns.",
    moduleId: "columns",
    profile: "structural",
    recommendations: [
      {
        materialId: "astm-a992",
        reasons: [
          "Preferred US grade for W-shape columns",
          "Controlled yield range for AISC designs",
          "Same stock family as beam framing",
        ],
      },
      {
        materialId: "s355jr",
        reasons: [
          "Common EU grade for columns and heavy frames",
          "Good strength-to-cost for steelwork",
          "Compatible with Eurocode 3 material tables",
        ],
      },
    ],
  },
  {
    id: "shaft",
    label: "Shaft",
    description: "Rotating power-transmission shafts under bending and torsion.",
    moduleId: "shafts",
    profile: "machine-shaft",
    recommendations: [
      {
        materialId: "42crmo4-4140",
        reasons: [
          "Default high-strength QT shaft steel",
          "Strong fatigue performance when heat-treated",
          "Widely available bar and forging stock",
        ],
      },
      {
        materialId: "c45-1045-n",
        reasons: [
          "Economical medium-carbon choice for moderate duty",
          "Good machinability in normalized condition",
          "Familiar EN C45 / AISI 1045 family",
        ],
      },
    ],
  },
  {
    id: "pressure-vessel",
    label: "Pressure vessel",
    description: "Pressure parts where corrosion and code materials matter.",
    moduleId: "vessels",
    profile: "pressure",
    recommendations: [
      {
        materialId: "ss-316l",
        reasons: [
          "Low-carbon austenitic for welded fabrications",
          "Avoids sensitized HAZ corrosion vs higher-carbon 316",
          "Common for process and hygienic vessels",
        ],
      },
      {
        materialId: "ss-316",
        reasons: [
          "Mo-bearing stainless with better pitting than 304",
          "Broad chemical and pharma equipment use",
          "Code-familiar stainless plate grades",
        ],
      },
    ],
  },
  {
    id: "marine",
    label: "Marine",
    description: "Seawater splash, hulls, and coastal structures.",
    profile: "structural",
    recommendations: [
      {
        materialId: "al-5083",
        reasons: [
          "Among the best aluminum alloys for seawater",
          "Excellent weldability for ship plate",
          "Proven in hulls and offshore superstructures",
        ],
      },
      {
        materialId: "ss-316",
        reasons: [
          "Improved chloride resistance vs 304",
          "Common for marine fittings and hardware",
          "Good atmospheric marine performance when detailed correctly",
        ],
      },
      {
        materialId: "ti-6al-4v",
        reasons: [
          "Outstanding seawater corrosion resistance",
          "High strength-to-weight for critical marine parts",
          "Premium option when longevity dominates cost",
        ],
      },
    ],
  },
  {
    id: "aerospace",
    label: "Aerospace",
    description: "Weight-critical airframe and high-performance structures.",
    profile: "structural",
    recommendations: [
      {
        materialId: "al-7075",
        reasons: [
          "High-strength aluminum for aerospace secondary/primary structure",
          "Excellent specific strength vs 6061",
          "Mature aerospace alloy system",
        ],
      },
      {
        materialId: "ti-6al-4v",
        reasons: [
          "Aerospace workhorse titanium alloy",
          "Outstanding strength-to-weight",
          "High-temperature and corrosion capability",
        ],
      },
      {
        materialId: "al-6061",
        reasons: [
          "Versatile, weldable, and easily machined",
          "Good choice for fixtures and secondary structure",
          "Widely stocked and economical vs 7075/titanium",
        ],
      },
    ],
  },
  {
    id: "fastener",
    label: "Fastener",
    description: "Bolted joints and property-class fasteners.",
    moduleId: "bolts",
    profile: "bolt",
    recommendations: [
      {
        materialId: "bolt-8-8",
        reasons: [
          "Most common metric property class for machinery",
          "Predictable proof load for joint design",
          "Commodity availability worldwide",
        ],
      },
      {
        materialId: "bolt-10-9",
        reasons: [
          "Higher strength for compact joints",
          "Standard ISO 898-1 class",
          "Use with care for hydrogen embrittlement when plated",
        ],
      },
    ],
  },
  {
    id: "spring",
    label: "Spring",
    description: "Coiled springs and high-cycle wire forms.",
    moduleId: "springs",
    profile: "dynamics",
    recommendations: [
      {
        materialId: "spring-music-wire",
        reasons: [
          "Highest common tensile for carbon spring wire",
          "Excellent fatigue life when surfaces are clean",
          "Standard choice for precision compression springs",
        ],
      },
    ],
  },
  {
    id: "welded-fabrication",
    label: "Welded fabrication",
    description: "General welded frames, bases, and plate assemblies.",
    moduleId: "welds",
    profile: "weld-base",
    recommendations: [
      {
        materialId: "s275jr",
        reasons: [
          "Balanced EU structural grade for welded steelwork",
          "Good fabrication characteristics",
          "Common default when S235 capacity is marginal",
        ],
      },
      {
        materialId: "astm-a36",
        reasons: [
          "US mild steel staple for welded fabrications",
          "Readily welded with common consumables",
          "Ideal for bases, gussets, and secondary framing",
        ],
      },
      {
        materialId: "al-6061",
        reasons: [
          "Lightweight welded frames and fixtures",
          "Excellent machinability for post-weld finishing",
          "Account for HAZ softening in heat-treated temper",
        ],
      },
    ],
  },
];

export function getMaterialUseCase(id: string): MaterialUseCase | undefined {
  return materialUseCases.find((u) => u.id === id);
}

export function getUseCaseForProfile(profile: string): MaterialUseCase | undefined {
  const map: Record<string, string> = {
    structural: "beam",
    "machine-shaft": "shaft",
    bolt: "fastener",
    pressure: "pressure-vessel",
    "weld-base": "welded-fabrication",
    dynamics: "spring",
  };
  const useCaseId = map[profile];
  return useCaseId ? getMaterialUseCase(useCaseId) : undefined;
}
