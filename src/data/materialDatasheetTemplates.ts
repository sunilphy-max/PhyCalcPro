import type { MaterialCategory } from "@/data/materials";
import type { CorrosionEnvironment, MaterialDatasheet } from "@/data/materialDatasheetTypes";

export type CategoryDatasheetTemplate = {
  formSupply: string;
  applications: string[];
  advantages: string[];
  limitations: string[];
  machinabilityNotes: string;
  costNotes: string;
  corrosionNotes: string;
  environments: CorrosionEnvironment[];
  physicalNotes: string;
  summaryPattern: (name: string, standard?: string) => string;
};

const carbonSteelEnvs: CorrosionEnvironment[] = [
  { name: "Indoor dry", rating: "fair" },
  { name: "Outdoor painted", rating: "fair" },
  { name: "Marine atmosphere", rating: "poor" },
];

export const materialDatasheetTemplates: Record<MaterialCategory, CategoryDatasheetTemplate> = {
  "structural-steel": {
    formSupply: "Plate, sheet, sections, hollow sections, bars",
    applications: [
      "Building frames and bracing",
      "Welded plate structures",
      "Machine bases and supports",
      "General structural fabrication",
    ],
    advantages: [
      "Widely stocked and code-recognized for structural design",
      "Good weldability for fabrication shops",
      "Predictable strength and stiffness for steelwork",
    ],
    limitations: [
      "Requires coating or paint for outdoor / wet service",
      "Lower specific strength than aluminum or titanium",
      "Not suitable as a corrosion-resistant alloy without protection",
    ],
    machinabilityNotes: "Good machinability in normalized / as-rolled condition; free-cutting grades preferred for high-volume turning.",
    costNotes: "Commodity structural steel pricing in most markets.",
    corrosionNotes: "Atmospheric corrosion like mild carbon steel — coat, galvanize, or paint for outdoor exposure.",
    environments: carbonSteelEnvs,
    physicalNotes: "Typical density ~7850 kg/m³. Supply form depends on grade (plate, shapes, HSS).",
    summaryPattern: (name, standard) =>
      `${name} is a structural steel grade${standard ? ` (${standard})` : ""} used for buildings, frames, and general steelwork where weldability and cost matter.`,
  },
  "alloy-steel": {
    formSupply: "Bars, forgings, plate, tube",
    applications: [
      "Shafts and axles",
      "Machine components under fatigue",
      "Gears and pinions (with heat treatment)",
      "High-strength fasteners and couplings",
    ],
    advantages: [
      "Higher strength and hardenability than mild structural steel",
      "Responds well to quench and temper for tailored properties",
      "Good fatigue performance when heat-treated correctly",
    ],
    limitations: [
      "Often needs heat treatment to reach published strengths",
      "Weldability may require preheat / post-weld heat treatment",
      "Corrosion resistance similar to carbon steel unless coated",
    ],
    machinabilityNotes: "Machinability depends on condition; annealed stock machines more easily than QT.",
    costNotes: "Low-to-moderate premium over mild steel depending on alloy content.",
    corrosionNotes: "Protect like carbon steel; oil, plating, or paint for service parts.",
    environments: [
      { name: "Oil-lubricated machinery", rating: "fair" },
      { name: "Outdoor uncoated", rating: "poor" },
    ],
    physicalNotes: "Density typically ~7800–7850 kg/m³. Bar and forging forms dominate machine design.",
    summaryPattern: (name, standard) =>
      `${name} is a carbon/alloy engineering steel${standard ? ` (${standard})` : ""} for shafts, gears, and heat-treated machine parts.`,
  },
  "gear-steel": {
    formSupply: "Bars, forgings, blanks",
    applications: [
      "Carburized or induction-hardened gears",
      "Pinions and sprockets",
      "Wear-critical machine elements",
    ],
    advantages: [
      "Case-hardening grades support hard surface / tough core",
      "Proven for contact and bending gear ratings",
      "Stocked by gear blank suppliers",
    ],
    limitations: [
      "Requires controlled heat treatment for design allowables",
      "Not a general structural framing steel",
      "Core toughness depends on section size and quench practice",
    ],
    machinabilityNotes: "Machine in annealed or soft condition before carburizing / hardening.",
    costNotes: "Moderate; heat treatment and grind stock drive part cost.",
    corrosionNotes: "Oil films provide in-service protection; bare steel rusts outdoors.",
    environments: [{ name: "Lubricated gearboxes", rating: "good" }, { name: "Outdoor uncoated", rating: "poor" }],
    physicalNotes: "Density ~7800–7850 kg/m³. Typically supplied as bar or forged blanks.",
    summaryPattern: (name, standard) =>
      `${name} is a gear steel${standard ? ` (${standard})` : ""} selected for case-hardened or induction-hardened tooth surfaces.`,
  },
  "stainless-steel": {
    formSupply: "Sheet, plate, bar, tube, wire",
    applications: [
      "Corrosive service equipment",
      "Food, pharma, and hygienic plant",
      "Architectural and marine fittings",
      "Pressure parts (code-dependent)",
    ],
    advantages: [
      "Inherent corrosion resistance without thick coatings",
      "Hygienic finish options for process plant",
      "Good toughness over a wide temperature range (austenitic)",
    ],
    limitations: [
      "Higher cost than carbon structural steel",
      "Chloride stress-corrosion risk for some grades/environments",
      "Lower thermal conductivity than carbon steel or aluminum",
    ],
    machinabilityNotes: "Work-hardening austenitics need sharp tools, rigid setups, and adequate coolant.",
    costNotes: "Premium vs carbon steel; Mo-bearing grades cost more than 304 family.",
    corrosionNotes: "Select grade by environment (chloride, acid, temperature); surface finish matters.",
    environments: [
      { name: "Indoor / atmospheric", rating: "excellent" },
      { name: "Fresh water", rating: "good" },
      { name: "Marine splash", rating: "fair" },
    ],
    physicalNotes: "Density typically ~7800–8000 kg/m³ depending on alloy family.",
    summaryPattern: (name, standard) =>
      `${name} is a stainless steel grade${standard ? ` (${standard})` : ""} used where corrosion resistance and cleanability matter.`,
  },
  "spring-wire": {
    formSupply: "Wire, strip",
    applications: [
      "Compression, extension, and torsion springs",
      "Wire forms and clips",
      "High-cycle fatigue springs",
    ],
    advantages: [
      "High tensile strength for elastic energy storage",
      "Designed for cyclic loading when properly stressed",
      "Standard wire grades simplify spring design tables",
    ],
    limitations: [
      "Not a structural framing material",
      "Sensitive to surface quality and corrosion pits",
      "Heat / hydrogen embrittlement risks if processed incorrectly",
    ],
    machinabilityNotes: "Usually formed rather than machined; cut-off and coiling dominate processing.",
    costNotes: "Wire grade and diameter drive cost; music wire is commodity, exotic alloys premium.",
    corrosionNotes: "Carbon spring wires need coating or oil; stainless spring wire for corrosive service.",
    environments: [
      { name: "Indoor dry (coated)", rating: "good" },
      { name: "Outdoor uncoated carbon wire", rating: "poor" },
    ],
    physicalNotes: "Density near steel (~7850 kg/m³) unless stainless / specialty alloy.",
    summaryPattern: (name, standard) =>
      `${name} is a spring wire grade${standard ? ` (${standard})` : ""} for coiled springs and wire forms.`,
  },
  "bolt-class": {
    formSupply: "Bolts, screws, studs (finished fasteners)",
    applications: [
      "Structural and machine bolted joints",
      "Flanged connections",
      "Equipment mounting",
    ],
    advantages: [
      "Property classes give predictable proof / tensile loads",
      "Widely available metric and inch hardware",
      "Compatible with standard joint design methods",
    ],
    limitations: [
      "Corrosion depends on coating / stainless upgrade",
      "Not a bulk structural plate grade",
      "Hydrogen embrittlement risk for high-strength electroplated bolts",
    ],
    machinabilityNotes: "Applies to finished fasteners; blanks are machined before heat treatment in manufacture.",
    costNotes: "Commodity pricing for common classes; stainless and exotic coatings cost more.",
    corrosionNotes: "Usually zinc plated or coated; upgrade to stainless for corrosive service.",
    environments: [
      { name: "Indoor machinery", rating: "fair" },
      { name: "Outdoor (plated)", rating: "fair" },
      { name: "Marine (uncoated carbon)", rating: "poor" },
    ],
    physicalNotes: "Density of carbon steel fasteners ~7850 kg/m³; stainless slightly higher.",
    summaryPattern: (name, standard) =>
      `${name} is a fastener property class${standard ? ` (${standard})` : ""} for bolts, screws, and studs.`,
  },
  "weld-filler": {
    formSupply: "Electrodes, solid / flux-cored wire",
    applications: [
      "Matching or overmatching welds on carbon steel",
      "Structural fillet and groove welds",
      "Repair and fabrication welding",
    ],
    advantages: [
      "Specified to deposit strength compatible with base metal",
      "Shop-familiar consumables for production welding",
      "Supports code-qualified WPS selections",
    ],
    limitations: [
      "Not a base-plate design material",
      "Hydrogen control and storage procedures matter",
      "Deposit chemistry must match service environment",
    ],
    machinabilityNotes: "Weld metal machinability depends on deposit chemistry and hardness.",
    costNotes: "Consumable cost is modest vs labor; low-hydrogen and specialty wires cost more.",
    corrosionNotes: "Deposit corrosion follows alloy system — match stainless fillers for stainless base.",
    environments: [{ name: "Shop fabrication", rating: "fair" }],
    physicalNotes: "Deposit density similar to the matching steel family.",
    summaryPattern: (name, standard) =>
      `${name} is a weld filler / electrode designation${standard ? ` (${standard})` : ""} for joining structural and alloy steels.`,
  },
  "cast-iron": {
    formSupply: "Castings",
    applications: [
      "Machine bases and housings",
      "Brake drums and wear parts",
      "Pump and valve bodies (selected grades)",
    ],
    advantages: [
      "Excellent vibration damping vs steel fabrications",
      "Good compressive strength and wear resistance (many grades)",
      "Complex shapes cast near-net",
    ],
    limitations: [
      "Brittle relative to structural steel in tension / impact",
      "Weld repair is specialized and often avoided",
      "Section sensitivity of properties in thick castings",
    ],
    machinabilityNotes: "Gray iron machines well; ductile iron is tougher on tools but still castable.",
    costNotes: "Competitive for complex housings vs fabricated steel weldments.",
    corrosionNotes: "Rusts like steel outdoors; paint or plating for appearance / life.",
    environments: [
      { name: "Indoor machinery", rating: "fair" },
      { name: "Outdoor uncoated", rating: "poor" },
    ],
    physicalNotes: "Density typically ~6800–7300 kg/m³ depending on graphite morphology.",
    summaryPattern: (name, standard) =>
      `${name} is a cast iron grade${standard ? ` (${standard})` : ""} used for housings, bases, and wear castings.`,
  },
  aluminum: {
    formSupply: "Plate, sheet, extrusions, bar, tube",
    applications: [
      "Lightweight frames and fixtures",
      "Aerospace and transport secondary structure",
      "Heat sinks and electrical bus work (selected alloys)",
      "Marine structures (marine alloys)",
    ],
    advantages: [
      "High specific stiffness and strength vs steel",
      "Good machinability in many heat-treatable alloys",
      "Natural oxide film aids atmospheric corrosion resistance",
    ],
    limitations: [
      "Lower absolute E and often lower absolute strength than steel",
      "Weld HAZ softening in heat-treatable alloys",
      "Galvanic corrosion with dissimilar metals if not isolated",
    ],
    machinabilityNotes: "Excellent machinability for many 6xxx/2xxx alloys with sharp carbide tools.",
    costNotes: "Moderate-to-high vs carbon steel on a volume basis; scrap value is significant.",
    corrosionNotes: "Generally good outdoors; marine alloys preferred for seawater; protect dissimilar joints.",
    environments: [
      { name: "Indoor / atmospheric", rating: "excellent" },
      { name: "Fresh water", rating: "good" },
      { name: "Marine splash", rating: "fair" },
    ],
    physicalNotes: "Density typically ~2700–2800 kg/m³ — primary weight advantage vs steel.",
    summaryPattern: (name, standard) =>
      `${name} is an aluminum alloy${standard ? ` (${standard})` : ""} for lightweight structures, fixtures, and general engineering.`,
  },
  titanium: {
    formSupply: "Bar, plate, sheet, forgings, billet",
    applications: [
      "Aerospace airframes and engines",
      "Medical implants",
      "Corrosion-critical process equipment",
      "High-performance lightweight structures",
    ],
    advantages: [
      "Outstanding strength-to-weight",
      "Excellent corrosion resistance in many oxidizing media",
      "Biocompatibility for implant grades",
    ],
    limitations: [
      "Premium material and machining cost",
      "Poor thermal conductivity complicates machining",
      "Special welding / contamination controls required",
    ],
    machinabilityNotes: "Difficult — low thermal conductivity and galling; rigid setups and flood coolant.",
    costNotes: "Premium metal; buy-to-fly ratio dominates part cost.",
    corrosionNotes: "Excellent in seawater and many chemicals; avoid reducing acids without inhibitors.",
    environments: [
      { name: "Seawater", rating: "excellent" },
      { name: "Body fluids", rating: "excellent" },
      { name: "Hot reducing acids", rating: "poor" },
    ],
    physicalNotes: "Density typically ~4400–4500 kg/m³ — between aluminum and steel.",
    summaryPattern: (name, standard) =>
      `${name} is a titanium alloy${standard ? ` (${standard})` : ""} for aerospace, medical, and corrosion-critical lightweight parts.`,
  },
  "copper-alloy": {
    formSupply: "Bar, sheet, plate, tube, wire",
    applications: [
      "Electrical conductors and busbars",
      "Heat exchangers",
      "Bearings and wear bushings (selected alloys)",
      "Architectural and plumbing fittings",
    ],
    advantages: [
      "High electrical and thermal conductivity (especially pure Cu)",
      "Good corrosion resistance in many waters",
      "Excellent formability and joinability for many grades",
    ],
    limitations: [
      "Lower strength than structural steel for framing",
      "Cost and theft risk for high-copper content",
      "Some alloys susceptible to dezincification / SCC",
    ],
    machinabilityNotes: "Free-cutting brasses machine excellently; pure copper is gummy.",
    costNotes: "Tied to copper commodity pricing; alloys vary widely.",
    corrosionNotes: "Generally good; alloy-specific issues (dezincification, ammonia SCC) need checks.",
    environments: [
      { name: "Atmospheric", rating: "good" },
      { name: "Fresh water", rating: "good" },
      { name: "Seawater (alloy-dependent)", rating: "fair" },
    ],
    physicalNotes: "Density typically ~8500–8900 kg/m³ for copper and common brasses/bronzes.",
    summaryPattern: (name, standard) =>
      `${name} is a copper alloy${standard ? ` (${standard})` : ""} used for conductivity, heat transfer, and selected wear applications.`,
  },
  polymer: {
    formSupply: "Stock shapes, moldings, extrusions",
    applications: [
      "Housings and covers",
      "Bushings, wear pads, and insulators",
      "Lightweight non-structural parts",
      "Chemical-resistant components (grade-dependent)",
    ],
    advantages: [
      "Low density vs metals",
      "Electrical insulation and corrosion immunity in many media",
      "Near-net molding reduces machining",
    ],
    limitations: [
      "Much lower stiffness and temperature capability than metals",
      "Creep and moisture uptake can affect dimensions",
      "UV / chemical compatibility must be verified per grade",
    ],
    machinabilityNotes: "Machine with sharp tools and light cuts; avoid melting from heat buildup.",
    costNotes: "Commodity engineering plastics are low-to-moderate; filled / high-performance grades cost more.",
    corrosionNotes: "Generally immune to rust; check solvent, acid, and UV resistance for the specific polymer.",
    environments: [
      { name: "Indoor dry", rating: "excellent" },
      { name: "Outdoor UV (unprotected)", rating: "fair" },
    ],
    physicalNotes: "Density typically ~900–1500 kg/m³ depending on polymer family and fillers.",
    summaryPattern: (name, standard) =>
      `${name} is an engineering polymer${standard ? ` (${standard})` : ""} for housings, wear parts, and lightweight non-metallic components.`,
  },
  other: {
    formSupply: "Varies by product form",
    applications: [
      "Specialty engineering applications",
      "Where catalog metals/polymers do not fit",
    ],
    advantages: [
      "Fills niche property combinations not covered by common alloys",
      "Useful for screening and comparative studies",
    ],
    limitations: [
      "Availability and standards coverage vary",
      "Verify properties against supplier data for certified work",
    ],
    machinabilityNotes: "Depends on the specific material system — confirm with supplier guidance.",
    costNotes: "Varies widely by material family.",
    corrosionNotes: "Environment rating depends on the specific material — treat as indicative.",
    environments: [{ name: "Indoor / general", rating: "fair" }],
    physicalNotes: "Density and form supply vary — see catalog values and supplier datasheets.",
    summaryPattern: (name, standard) =>
      `${name} is a specialty catalog material${standard ? ` (${standard})` : ""} for niche engineering selection.`,
  },
};

/** Build a complete datasheet from category template + optional overrides. */
export function buildDatasheetFromTemplate(
  category: MaterialCategory,
  name: string,
  standard: string | undefined,
  overrides: Partial<MaterialDatasheet> = {}
): MaterialDatasheet {
  const t = materialDatasheetTemplates[category];
  return {
    summary: overrides.summary ?? t.summaryPattern(name, standard),
    formSupply: overrides.formSupply ?? t.formSupply,
    applications: overrides.applications ?? [...t.applications],
    advantages: overrides.advantages ?? [...t.advantages],
    limitations: overrides.limitations ?? [...t.limitations],
    physicalNotes: overrides.physicalNotes ?? t.physicalNotes,
    machinabilityNotes: overrides.machinabilityNotes ?? t.machinabilityNotes,
    costNotes: overrides.costNotes ?? t.costNotes,
    corrosionNotes: overrides.corrosionNotes ?? t.corrosionNotes,
    environments: overrides.environments ?? t.environments.map((e) => ({ ...e })),
    standards: overrides.standards ?? (standard ? [{ code: standard }] : undefined),
    aliases: overrides.aliases,
    electrical: overrides.electrical,
    composition: overrides.composition,
    alternativeIds: overrides.alternativeIds,
  };
}
