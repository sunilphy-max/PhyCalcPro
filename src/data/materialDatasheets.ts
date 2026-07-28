/**
 * Encyclopedia enrichment for graded materials.
 * Narrative / structured datasheet fields only — SI mechanical properties stay in materials.ts.
 */

export type CompositionEntry = {
  element: string;
  min?: number;
  max?: number;
  typical?: number;
};

export type MaterialStandardRef = {
  code: string;
  title?: string;
};

export type CorrosionEnvironment = {
  name: string;
  rating: "poor" | "fair" | "good" | "excellent";
  notes?: string;
};

export type MaterialDatasheetElectrical = {
  /** Resistivity (Ω·m) — may mirror Material.electricalResistivity */
  resistivity?: number;
  /** % IACS conductivity when published */
  conductivityIacsPct?: number;
  notes?: string;
};

export type MaterialDatasheet = {
  summary: string;
  aliases?: string[];
  formSupply?: string;
  electrical?: MaterialDatasheetElectrical;
  composition?: CompositionEntry[];
  applications?: string[];
  standards?: MaterialStandardRef[];
  machinabilityNotes?: string;
  costNotes?: string;
  corrosionNotes?: string;
  environments?: CorrosionEnvironment[];
  /** Catalog material ids */
  alternativeIds?: string[];
};

function pct(
  entries: Array<[string, number?, number?, number?]>
): CompositionEntry[] {
  return entries.map(([element, min, max, typical]) => ({
    element,
    ...(min != null ? { min } : {}),
    ...(max != null ? { max } : {}),
    ...(typical != null ? { typical } : {}),
  }));
}

export const materialDatasheets: Record<string, MaterialDatasheet> = {
  // ===================== Structural steels =====================
  s235jr: {
    summary:
      "Common European mild structural steel for buildings, frames, and general fabrication where weldability and cost matter more than high yield.",
    aliases: ["1.0038", "S235"],
    formSupply: "Plate, sheet, sections, hollow sections",
    composition: pct([
      ["C", undefined, 0.17, 0.12],
      ["Mn", undefined, 1.4, 0.8],
      ["P", undefined, 0.035],
      ["S", undefined, 0.035],
      ["N", undefined, 0.012],
      ["Cu", undefined, 0.55],
    ]),
    applications: [
      "Building frames and bracing",
      "Light machine bases",
      "General welded fabrications",
      "Non-critical pressure parts (check code)",
    ],
    standards: [
      { code: "EN 10025-2", title: "Hot rolled products of structural steels" },
      { code: "EN 10027-1", title: "Designation systems" },
    ],
    machinabilityNotes: "Good machinability in normalized condition; free-cutting grades preferred for high-volume turning.",
    costNotes: "Lowest-cost structural steel band in most European markets.",
    corrosionNotes: "Requires coating or paint outdoors; similar atmospheric corrosion to other carbon steels.",
    environments: [
      { name: "Indoor dry", rating: "fair" },
      { name: "Outdoor unpainted", rating: "poor" },
      { name: "Marine atmosphere", rating: "poor" },
    ],
    alternativeIds: ["s275jr", "s355jr", "astm-a36"],
    electrical: { resistivity: 1.6e-7, conductivityIacsPct: 10, notes: "Typical carbon-steel resistivity." },
  },

  s275jr: {
    summary:
      "European structural steel between S235 and S355 — common default for general steelwork when S235 capacity is marginal.",
    aliases: ["1.0044", "S275"],
    formSupply: "Plate, sections, hollow sections, bars",
    composition: pct([
      ["C", undefined, 0.21, 0.15],
      ["Mn", undefined, 1.5, 1.0],
      ["P", undefined, 0.035],
      ["S", undefined, 0.035],
      ["N", undefined, 0.012],
      ["Cu", undefined, 0.55],
    ]),
    applications: [
      "Building and industrial frames",
      "Welded plate structures",
      "Machine bases and supports",
      "Secondary bridge members (check project specs)",
    ],
    standards: [
      { code: "EN 10025-2", title: "Hot rolled products of structural steels" },
      { code: "Eurocode 3", title: "Design of steel structures (material properties)" },
    ],
    machinabilityNotes: "Similar to S235; good fabrication and welding characteristics.",
    costNotes: "Slight premium over S235; often the catalog default structural grade.",
    corrosionNotes: "Requires coating outdoors; JR impact grade for ambient service.",
    environments: [
      { name: "Indoor dry", rating: "fair" },
      { name: "Outdoor painted", rating: "fair" },
      { name: "Marine atmosphere", rating: "poor" },
    ],
    alternativeIds: ["s235jr", "s355jr", "astm-a36"],
    electrical: { resistivity: 1.6e-7, conductivityIacsPct: 10 },
  },

  s355jr: {
    summary:
      "Workhorse European structural grade with higher yield than S235/S275; widely specified for beams, columns, and welded platework.",
    aliases: ["1.0045", "S355"],
    formSupply: "Plate, sections, hollow sections, bars",
    composition: pct([
      ["C", undefined, 0.24, 0.16],
      ["Mn", undefined, 1.6, 1.3],
      ["P", undefined, 0.035],
      ["S", undefined, 0.035],
      ["N", undefined, 0.012],
      ["Cu", undefined, 0.55],
    ]),
    applications: [
      "Primary structural members",
      "Crane runways and heavy frames",
      "Welded plate girders",
      "Mobile equipment chassis",
    ],
    standards: [
      { code: "EN 10025-2", title: "Hot rolled products of structural steels" },
      { code: "Eurocode 3", title: "Design of steel structures (material properties)" },
    ],
    machinabilityNotes: "Machinability moderate; hardness rises with thickness and cooling rate after rolling.",
    costNotes: "Moderate premium over S235; often best strength-to-cost for European structural work.",
    corrosionNotes: "Same coating practice as mild steel; JR impact class suited to ambient service.",
    environments: [
      { name: "Indoor dry", rating: "fair" },
      { name: "Outdoor painted", rating: "fair" },
      { name: "Marine atmosphere", rating: "poor" },
    ],
    alternativeIds: ["s275jr", "s420n", "astm-a572-gr50", "astm-a992"],
    electrical: { resistivity: 1.7e-7, conductivityIacsPct: 10 },
  },

  "astm-a36": {
    summary:
      "US mild structural steel standard for plates, bars, and shapes; default reference grade in many US design codes and PhyCalcPro structural modules.",
    aliases: ["A36"],
    formSupply: "Plate, bars, shapes",
    composition: pct([
      ["C", undefined, 0.26, 0.2],
      ["Mn", undefined, 1.03],
      ["P", undefined, 0.04],
      ["S", undefined, 0.05],
      ["Si", undefined, 0.4],
      ["Cu", 0.2],
    ]),
    applications: [
      "Building and bridge secondary members",
      "Base plates and gussets",
      "General fabrication",
      "Welded frames",
    ],
    standards: [
      { code: "ASTM A36/A36M", title: "Carbon structural steel" },
      { code: "AISC 360", title: "Specification for Structural Steel Buildings" },
    ],
    machinabilityNotes: "Readily machined and welded; preheat rarely needed for thin sections.",
    costNotes: "Commodity US structural steel pricing.",
    corrosionNotes: "Must be painted or galvanized for outdoor exposure.",
    environments: [
      { name: "Indoor dry", rating: "fair" },
      { name: "Galvanized outdoor", rating: "good" },
      { name: "Marine atmosphere", rating: "poor" },
    ],
    alternativeIds: ["s275jr", "astm-a572-gr50", "astm-a992"],
    electrical: { resistivity: 1.6e-7, conductivityIacsPct: 10 },
  },

  "astm-a992": {
    summary:
      "Preferred US wide-flange (W-shape) structural steel with controlled yield and tensile ranges for building frames.",
    aliases: ["A992", "W-shape steel"],
    formSupply: "Wide-flange beams and columns",
    composition: pct([
      ["C", undefined, 0.23],
      ["Mn", 0.5, 1.6],
      ["P", undefined, 0.035],
      ["S", undefined, 0.045],
      ["Si", 0.15, 0.4],
      ["V", undefined, 0.15],
      ["Nb", undefined, 0.05],
      ["Cu", undefined, 0.6],
    ]),
    applications: [
      "Building frames (W-shapes)",
      "Moment-resisting frames",
      "Column and beam stock in AISC designs",
    ],
    standards: [
      { code: "ASTM A992/A992M", title: "Structural steel shapes" },
      { code: "AISC 360", title: "Specification for Structural Steel Buildings" },
    ],
    machinabilityNotes: "Similar to A572; drilling and coping common in fab shops.",
    costNotes: "Standard pricing for US W-shapes; little premium vs A572 Gr.50.",
    corrosionNotes: "Requires coating system for exposed architecture.",
    environments: [
      { name: "Indoor dry", rating: "fair" },
      { name: "Painted outdoor", rating: "fair" },
    ],
    alternativeIds: ["astm-a572-gr50", "s355jr", "astm-a36"],
    electrical: { resistivity: 1.7e-7 },
  },

  // ===================== Alloy / machine steels =====================
  "c45-1045-n": {
    summary:
      "Medium-carbon steel (EN C45 / AISI 1045 family) in normalized condition — balanced strength and toughness for shafts and general machine parts.",
    aliases: ["C45", "1.0503", "1045 normalized"],
    formSupply: "Bars, forgings, plates",
    composition: pct([
      ["C", 0.42, 0.5, 0.45],
      ["Si", undefined, 0.4],
      ["Mn", 0.5, 0.8, 0.65],
      ["P", undefined, 0.045],
      ["S", undefined, 0.045],
      ["Cr", undefined, 0.4],
      ["Ni", undefined, 0.4],
      ["Mo", undefined, 0.1],
    ]),
    applications: [
      "Shafts and axles (moderate duty)",
      "Gears (induction hardened)",
      "Pins, keys, and couplings",
      "General machine components",
    ],
    standards: [
      { code: "EN 10083-2", title: "Quenched and tempered steels — non-alloy" },
      { code: "ASTM A29", title: "General requirements for steel bars" },
    ],
    machinabilityNotes: "Good machinability when normalized; chip control better than QT condition.",
    costNotes: "Low-to-moderate alloy cost; widely stocked.",
    corrosionNotes: "Corrodes like carbon steel; oil or plating for service parts.",
    environments: [
      { name: "Oil-lubricated machinery", rating: "fair" },
      { name: "Outdoor uncoated", rating: "poor" },
    ],
    alternativeIds: ["aisi-1045-n", "c45-1045-qt", "42crmo4-4140"],
    electrical: { resistivity: 1.6e-7 },
  },

  "c45-1045-qt": {
    summary:
      "C45 / 1045 quenched and tempered for higher yield and hardness — preferred when normalized strength is insufficient.",
    aliases: ["C45 Q&T", "1045 QT"],
    formSupply: "Bars and forgings, heat-treated",
    composition: pct([
      ["C", 0.42, 0.5, 0.45],
      ["Si", undefined, 0.4],
      ["Mn", 0.5, 0.8, 0.65],
      ["P", undefined, 0.045],
      ["S", undefined, 0.045],
    ]),
    applications: [
      "Higher-duty shafts",
      "Bolted machine elements",
      "Wear-resistant pins",
      "Hydraulic cylinder rods (selected)",
    ],
    standards: [
      { code: "EN 10083-2", title: "Quenched and tempered steels — non-alloy" },
    ],
    machinabilityNotes: "Harder to machine after QT; rough machine before heat treatment when possible.",
    costNotes: "Similar base metal cost to normalized plus heat-treat premium.",
    corrosionNotes: "Same as carbon steel; temper colors do not provide corrosion protection.",
    alternativeIds: ["c45-1045-n", "42crmo4-4140", "aisi-1045-n"],
    electrical: { resistivity: 1.7e-7 },
  },

  "42crmo4-4140": {
    summary:
      "Chromium-molybdenum alloy steel (42CrMo4 / AISI 4140) Q&T — default high-strength shaft and machine-steel grade in PhyCalcPro.",
    aliases: ["1.7225", "4140", "42CrMo4"],
    formSupply: "Bars, forgings, tubes",
    composition: pct([
      ["C", 0.38, 0.45, 0.41],
      ["Si", undefined, 0.4],
      ["Mn", 0.6, 0.9, 0.75],
      ["P", undefined, 0.025],
      ["S", undefined, 0.035],
      ["Cr", 0.9, 1.2, 1.0],
      ["Mo", 0.15, 0.3, 0.22],
    ]),
    applications: [
      "Power-transmission shafts",
      "Crankshafts and connecting rods",
      "High-strength fasteners (selected)",
      "Gears and spindles",
    ],
    standards: [
      { code: "EN 10083-3", title: "Quenched and tempered steels — alloy" },
      { code: "ASTM A29", title: "4140 / 4142 bar" },
    ],
    machinabilityNotes: "Machinability ~55% of free-cutting steel in annealed state; QT reduces tool life.",
    costNotes: "Moderate alloy premium; widely available globally.",
    corrosionNotes: "Not stainless — protect with oil, plating, or paint.",
    environments: [
      { name: "Oil-lubricated machinery", rating: "fair" },
      { name: "Outdoor uncoated", rating: "poor" },
    ],
    alternativeIds: ["34crmo4-4130", "34crnimo6-4340", "c45-1045-qt"],
    electrical: { resistivity: 2.2e-7 },
  },

  "aisi-1045-n": {
    summary:
      "US designation for medium-carbon 1045 steel in normalized condition — interchangeable with EN C45 for many shaft designs.",
    aliases: ["1045", "AISI 1045"],
    formSupply: "Cold- and hot-finished bars",
    composition: pct([
      ["C", 0.43, 0.5, 0.45],
      ["Mn", 0.6, 0.9, 0.75],
      ["P", undefined, 0.04],
      ["S", undefined, 0.05],
    ]),
    applications: [
      "Shafts and spindles",
      "Bolts and studs (selected)",
      "Gears and sprockets",
      "Hydraulic components",
    ],
    standards: [
      { code: "ASTM A29", title: "General requirements for steel bars" },
      { code: "SAE J403", title: "Chemical compositions of SAE carbon steels" },
    ],
    machinabilityNotes: "Approximately 55–60% of AISI 1212 machinability index.",
    costNotes: "Commodity carbon bar pricing in North America.",
    corrosionNotes: "Requires coating or oil for corrosion protection.",
    alternativeIds: ["c45-1045-n", "c45-1045-qt", "42crmo4-4140"],
    electrical: { resistivity: 1.6e-7 },
  },

  // ===================== Gear steels =====================
  "16mncr5-ch": {
    summary:
      "Case-hardening manganese-chromium steel for gears and pinions with tough core and hard wear surface after carburizing.",
    aliases: ["1.7131", "16MnCr5"],
    formSupply: "Bars and forgings for carburizing",
    composition: pct([
      ["C", 0.14, 0.19, 0.16],
      ["Si", undefined, 0.4],
      ["Mn", 1.0, 1.3, 1.15],
      ["P", undefined, 0.025],
      ["S", undefined, 0.035],
      ["Cr", 0.8, 1.1, 0.95],
    ]),
    applications: [
      "Automotive and industrial gears",
      "Pinions and shafts",
      "Camshafts (selected)",
      "Wear parts after case hardening",
    ],
    standards: [
      { code: "EN 10084", title: "Case hardening steels" },
    ],
    machinabilityNotes: "Machine in soft annealed condition before carburize/harden cycle.",
    costNotes: "Moderate; standard European gear steel.",
    corrosionNotes: "Core and case are not corrosion-resistant; oil or coating required.",
    alternativeIds: ["20mncr5-ch", "18crnimo7-6-ch", "c45-ih"],
  },

  "20mncr5-ch": {
    summary:
      "Higher-carbon case-hardening grade than 16MnCr5 for larger gears needing deeper hardenability and higher core strength.",
    aliases: ["1.7147", "20MnCr5"],
    formSupply: "Bars and forgings for carburizing",
    composition: pct([
      ["C", 0.17, 0.22, 0.2],
      ["Si", undefined, 0.4],
      ["Mn", 1.1, 1.4, 1.25],
      ["P", undefined, 0.025],
      ["S", undefined, 0.035],
      ["Cr", 1.0, 1.3, 1.15],
    ]),
    applications: [
      "Heavy-duty gears",
      "Transmission pinions",
      "Industrial gearboxes",
    ],
    standards: [
      { code: "EN 10084", title: "Case hardening steels" },
    ],
    machinabilityNotes: "Soft-state machining preferred; hard finishing after heat treat.",
    costNotes: "Similar to 16MnCr5 with slight hardenability premium.",
    corrosionNotes: "Protect finished gears with oil or phosphate systems.",
    alternativeIds: ["16mncr5-ch", "18crnimo7-6-ch", "42crmo4-nitrided"],
  },

  // ===================== Stainless =====================
  "ss-304": {
    summary:
      "Austenitic stainless 1.4301 / 304 — general-purpose corrosion-resistant grade for food, architecture, and light chemical service.",
    aliases: ["1.4301", "304", "X5CrNi18-10"],
    formSupply: "Sheet, plate, tube, bar, fasteners",
    composition: pct([
      ["C", undefined, 0.07],
      ["Si", undefined, 1.0],
      ["Mn", undefined, 2.0],
      ["P", undefined, 0.045],
      ["S", undefined, 0.015],
      ["Cr", 17.5, 19.5, 18.1],
      ["Ni", 8.0, 10.5, 8.1],
      ["N", undefined, 0.1],
    ]),
    applications: [
      "Food and beverage equipment",
      "Architectural cladding",
      "Chemical plant light duty",
      "Heat exchangers (selected)",
    ],
    standards: [
      { code: "EN 10088-2", title: "Stainless steels — sheet/plate/strip" },
      { code: "ASTM A240", title: "Chromium and chromium-nickel stainless plate" },
    ],
    machinabilityNotes: "Gummy chips; use sharp tools, positive rake, and sulfurized oils. Machinability ~45 vs free-cutting steel.",
    costNotes: "Moderate stainless premium over carbon steel; nickel price sensitive.",
    corrosionNotes: "Excellent in atmospheric and many oxidizing chemicals; susceptible to chloride pitting and SCC.",
    environments: [
      { name: "Indoor / food washdown", rating: "excellent" },
      { name: "Fresh water", rating: "good" },
      { name: "Chloride / marine splash", rating: "fair" },
      { name: "Seawater immersed", rating: "poor" },
    ],
    alternativeIds: ["ss-316", "ss-316l", "ss-duplex-2205"],
    electrical: { resistivity: 7.2e-7, conductivityIacsPct: 2.4, notes: "Much higher resistivity than carbon steel or copper." },
  },

  "ss-316": {
    summary:
      "Molybdenum-bearing austenitic stainless 1.4401 / 316 with improved pitting resistance versus 304 in chloride environments.",
    aliases: ["1.4401", "316", "X5CrNiMo17-12-2"],
    formSupply: "Sheet, plate, tube, bar, fasteners",
    composition: pct([
      ["C", undefined, 0.07],
      ["Si", undefined, 1.0],
      ["Mn", undefined, 2.0],
      ["P", undefined, 0.045],
      ["S", undefined, 0.015],
      ["Cr", 16.5, 18.5, 17],
      ["Ni", 10.0, 13.0, 11],
      ["Mo", 2.0, 2.5, 2.1],
      ["N", undefined, 0.1],
    ]),
    applications: [
      "Marine fittings (splash zone)",
      "Pharmaceutical and chemical equipment",
      "Pulp and paper",
      "Outdoor architectural hardware",
    ],
    standards: [
      { code: "EN 10088-2", title: "Stainless steels — sheet/plate/strip" },
      { code: "ASTM A240", title: "Stainless plate, sheet, and strip" },
    ],
    machinabilityNotes: "Similar to 304; work-hardens rapidly — rigid setups required.",
    costNotes: "Higher than 304 due to Mo and Ni content.",
    corrosionNotes: "Better pitting resistance (PREN) than 304; still limited for continuous seawater immersion.",
    environments: [
      { name: "Indoor / food", rating: "excellent" },
      { name: "Marine atmosphere", rating: "good" },
      { name: "Chloride process fluids", rating: "good" },
      { name: "Seawater immersed", rating: "fair" },
    ],
    alternativeIds: ["ss-316l", "ss-304", "ss-2205-pipe"],
    electrical: { resistivity: 7.4e-7, conductivityIacsPct: 2.3 },
  },

  "ss-316l": {
    summary:
      "Low-carbon 316L (1.4404) for welded fabrications where carbide precipitation and intergranular corrosion must be avoided.",
    aliases: ["1.4404", "316L", "X2CrNiMo17-12-2"],
    formSupply: "Sheet, plate, tube, bar — weldable",
    composition: pct([
      ["C", undefined, 0.03],
      ["Si", undefined, 1.0],
      ["Mn", undefined, 2.0],
      ["P", undefined, 0.045],
      ["S", undefined, 0.015],
      ["Cr", 16.5, 18.5, 17],
      ["Ni", 10.0, 13.0, 11],
      ["Mo", 2.0, 2.5, 2.1],
      ["N", undefined, 0.1],
    ]),
    applications: [
      "Welded tanks and vessels",
      "Piping systems",
      "Pharmaceutical tubing",
      "Marine fabrications",
    ],
    standards: [
      { code: "EN 10088-2", title: "Stainless steels — sheet/plate/strip" },
      { code: "ASTM A240", title: "316L plate/sheet" },
      { code: "ASME II", title: "Boiler and pressure vessel materials (selected)" },
    ],
    machinabilityNotes: "Slightly softer than 316; still gummy — same tooling approach as 304/316.",
    costNotes: "Similar to 316; preferred default for welded stainless fabrications.",
    corrosionNotes: "Matches 316 pitting resistance with improved weld HAZ corrosion behavior.",
    environments: [
      { name: "Welded chemical equipment", rating: "excellent" },
      { name: "Marine atmosphere", rating: "good" },
      { name: "Seawater immersed", rating: "fair" },
    ],
    alternativeIds: ["ss-316", "ss-304", "ss-2205-pipe"],
    electrical: { resistivity: 7.4e-7, conductivityIacsPct: 2.3 },
  },

  // ===================== Aluminum =====================
  "al-6061": {
    summary:
      "Heat-treatable Al-Mg-Si alloy 6061-T6 — versatile structural aluminum for frames, fixtures, and general engineering.",
    aliases: ["AW-6061", "AlMg1SiCu", "AA6061"],
    formSupply: "Plate, sheet, extrusions, bar, tube",
    composition: pct([
      ["Si", 0.4, 0.8, 0.6],
      ["Fe", undefined, 0.7],
      ["Cu", 0.15, 0.4, 0.28],
      ["Mn", undefined, 0.15],
      ["Mg", 0.8, 1.2, 1.0],
      ["Cr", 0.04, 0.35, 0.2],
      ["Zn", undefined, 0.25],
      ["Ti", undefined, 0.15],
      ["Al", undefined, undefined, 97],
    ]),
    applications: [
      "Machine frames and fixtures",
      "Aerospace secondary structure",
      "Marine fittings (with care)",
      "Bicycle and automotive parts",
    ],
    standards: [
      { code: "ASTM B209", title: "Aluminum and aluminum-alloy sheet and plate" },
      { code: "EN 573-3", title: "Chemical composition and form of products" },
    ],
    machinabilityNotes: "Excellent machinability in T6; free-cutting chips with sharp carbide tools.",
    costNotes: "Moderate aluminum pricing; widely stocked worldwide.",
    corrosionNotes: "Good atmospheric corrosion resistance; protect in marine with anodize or coating.",
    environments: [
      { name: "Indoor / atmospheric", rating: "excellent" },
      { name: "Fresh water", rating: "good" },
      { name: "Marine splash", rating: "fair" },
    ],
    alternativeIds: ["al-6082", "al-7075", "al-5083"],
    electrical: { resistivity: 4.0e-8, conductivityIacsPct: 43, notes: "Useful electrical conductivity for busbars and heat sinks." },
  },

  "al-7075": {
    summary:
      "High-strength Al-Zn-Mg-Cu alloy 7075-T6 for aerospace and weight-critical structures where 6061 strength is insufficient.",
    aliases: ["AW-7075", "AA7075"],
    formSupply: "Plate, bar, extrusions, forgings",
    composition: pct([
      ["Si", undefined, 0.4],
      ["Fe", undefined, 0.5],
      ["Cu", 1.2, 2.0, 1.6],
      ["Mn", undefined, 0.3],
      ["Mg", 2.1, 2.9, 2.5],
      ["Cr", 0.18, 0.28, 0.23],
      ["Zn", 5.1, 6.1, 5.6],
      ["Ti", undefined, 0.2],
      ["Al", undefined, undefined, 90],
    ]),
    applications: [
      "Aerospace primary structure",
      "High-performance bike frames",
      "Molds and tooling (selected)",
      "Defense and racing components",
    ],
    standards: [
      { code: "ASTM B209", title: "Aluminum sheet and plate" },
      { code: "AMS 4045", title: "7075 sheet/plate (aerospace)" },
    ],
    machinabilityNotes: "Good machinability but notch-sensitive; avoid sharp corners in fatigue parts.",
    costNotes: "Premium vs 6061; aerospace certification adds cost.",
    corrosionNotes: "Fair corrosion resistance; often clad or coated. SCC risk in certain tempers.",
    environments: [
      { name: "Indoor / coated", rating: "good" },
      { name: "Marine uncoated", rating: "poor" },
    ],
    alternativeIds: ["al-6061", "al-7075-t7351", "ti-6al-4v"],
    electrical: { resistivity: 5.7e-8, conductivityIacsPct: 33 },
  },

  "al-5083": {
    summary:
      "Al-Mg marine alloy 5083 — excellent corrosion resistance and weldability for shipbuilding and cryogenic tanks.",
    aliases: ["AW-5083", "AlMg4.5Mn0.7"],
    formSupply: "Plate and sheet",
    composition: pct([
      ["Si", undefined, 0.4],
      ["Fe", undefined, 0.4],
      ["Cu", undefined, 0.1],
      ["Mn", 0.4, 1.0, 0.7],
      ["Mg", 4.0, 4.9, 4.4],
      ["Cr", 0.05, 0.25, 0.15],
      ["Zn", undefined, 0.25],
      ["Ti", undefined, 0.15],
      ["Al", undefined, undefined, 94],
    ]),
    applications: [
      "Ship hulls and superstructures",
      "Offshore platforms",
      "LNG / cryogenic tanks",
      "Pressure vessels (selected codes)",
    ],
    standards: [
      { code: "EN 573-3", title: "Chemical composition" },
      { code: "ASTM B209", title: "Aluminum sheet and plate" },
    ],
    machinabilityNotes: "Softer than 6xxx/7xxx; good machinability with sharp tools; gummy if feeds too light.",
    costNotes: "Moderate; marine plate often stocked in coastal markets.",
    corrosionNotes: "Among the best aluminum alloys for seawater and marine atmospheres.",
    environments: [
      { name: "Marine atmosphere", rating: "excellent" },
      { name: "Seawater", rating: "excellent" },
      { name: "Industrial atmosphere", rating: "excellent" },
    ],
    alternativeIds: ["al-6061", "al-5086-h116", "al-5052"],
    electrical: { resistivity: 5.9e-8, conductivityIacsPct: 29 },
  },

  // ===================== Titanium =====================
  "ti-6al-4v": {
    summary:
      "Alpha-beta titanium Ti-6Al-4V (Grade 5) — aerospace and medical workhorse with outstanding strength-to-weight.",
    aliases: ["Grade 5", "Ti64", "6Al-4V"],
    formSupply: "Bar, plate, sheet, forgings, billet",
    composition: pct([
      ["Al", 5.5, 6.75, 6.0],
      ["V", 3.5, 4.5, 4.0],
      ["Fe", undefined, 0.4],
      ["O", undefined, 0.2],
      ["C", undefined, 0.08],
      ["N", undefined, 0.05],
      ["H", undefined, 0.015],
      ["Ti", undefined, undefined, 90],
    ]),
    applications: [
      "Aerospace airframes and engines",
      "Medical implants",
      "Racing and motorsport",
      "High-performance fasteners",
    ],
    standards: [
      { code: "ASTM B265", title: "Titanium and titanium alloy strip/sheet/plate" },
      { code: "AMS 4911", title: "Ti-6Al-4V sheet/plate" },
    ],
    machinabilityNotes: "Poor machinability — low thermal conductivity, galling; use rigid setups and flood coolant.",
    costNotes: "Premium metal; scrap and buy-to-fly ratios drive part cost.",
    corrosionNotes: "Excellent resistance in many oxidizing and chloride media; avoid reducing acids without inhibitors.",
    environments: [
      { name: "Seawater", rating: "excellent" },
      { name: "Body fluids", rating: "excellent" },
      { name: "Hot reducing acids", rating: "poor" },
    ],
    alternativeIds: ["ti-grade-2", "al-7075", "ss-316"],
    electrical: { resistivity: 1.7e-6, conductivityIacsPct: 1.0, notes: "Relatively poor electrical conductor." },
  },

  // ===================== Copper =====================
  "cu-c11000": {
    summary:
      "Electrolytic tough pitch (ETP) copper C11000 — high electrical and thermal conductivity for busbars and conductors.",
    aliases: ["C110", "ETP copper", "CW004A"],
    formSupply: "Bar, rod, sheet, strip, busbar",
    composition: pct([
      ["Cu", 99.9],
      ["O", undefined, 0.04, 0.03],
    ]),
    applications: [
      "Electrical busbars and cables",
      "Heat sinks and exchangers",
      "Transformer windings",
      "Architectural copper",
    ],
    standards: [
      { code: "ASTM B152", title: "Copper sheet, strip, plate, and rolled bar" },
      { code: "EN 1652", title: "Copper and copper alloys — plate, sheet, strip" },
    ],
    machinabilityNotes: "Soft and gummy; free-cutting brass preferred when conductivity is not critical.",
    costNotes: "High and copper-price volatile; often recycled content.",
    corrosionNotes: "Forms protective patina outdoors; sensitive to ammonia and some acids.",
    environments: [
      { name: "Atmospheric", rating: "good" },
      { name: "Fresh water", rating: "good" },
      { name: "Ammonia atmospheres", rating: "poor" },
    ],
    alternativeIds: ["cu-etp", "cu-c36000", "cu-brass"],
    electrical: {
      resistivity: 1.72e-8,
      conductivityIacsPct: 100,
      notes: "Reference grade for % IACS conductivity.",
    },
  },

  "cu-brass": {
    summary:
      "CuZn37 cartridge-style brass (CW508L) — formable, decorative, and moderately strong copper-zinc alloy.",
    aliases: ["CuZn37", "CW508L", "70/30 brass family"],
    formSupply: "Sheet, strip, tube, rod",
    composition: pct([
      ["Cu", 62, 65, 63],
      ["Zn", undefined, undefined, 37],
      ["Pb", undefined, 0.1],
      ["Fe", undefined, 0.1],
    ]),
    applications: [
      "Deep-drawn components",
      "Decorative hardware",
      "Plumbing fittings (check lead rules)",
      "Musical instruments",
    ],
    standards: [
      { code: "EN 1652", title: "Copper and copper alloys — plate/sheet/strip" },
      { code: "ASTM B36", title: "Brass plate, sheet, strip, and rolled bar" },
    ],
    machinabilityNotes: "Better than pure copper; free-cutting C360 preferred for screw-machine work.",
    costNotes: "Moderate; tracks copper and zinc prices.",
    corrosionNotes: "Good atmospheric resistance; dezincification risk in some waters — use inhibited grades when needed.",
    environments: [
      { name: "Indoor atmospheric", rating: "good" },
      { name: "Fresh water", rating: "fair" },
      { name: "Seawater", rating: "fair" },
    ],
    alternativeIds: ["cu-c26000", "cu-c36000", "cu-c11000"],
    electrical: { resistivity: 6.6e-8, conductivityIacsPct: 27 },
  },

  // ===================== Polymers =====================
  "poly-pom": {
    summary:
      "Acetal copolymer (POM-C) — stiff, low-friction engineering plastic for precision gears, bearings, and snap-fits.",
    aliases: ["Acetal", "Delrin (homopolymer family)", "POM-C"],
    formSupply: "Rod, plate, sheet, injection molding resin",
    composition: pct([["POM copolymer", undefined, undefined, 100]]),
    applications: [
      "Precision gears and cams",
      "Bushings and wear pads",
      "Snap-fit housings",
      "Food-contact parts (selected grades)",
    ],
    standards: [
      { code: "ISO 9988", title: "Plastics — Polyoxymethylene (POM) moulding materials" },
      { code: "ASTM D6778", title: "POM materials classification" },
    ],
    machinabilityNotes: "Excellent machinability from stock shapes; sharp tools, moderate speeds, good chip control.",
    costNotes: "Low-to-moderate engineering plastic cost.",
    corrosionNotes: "Excellent resistance to many solvents and fuels; attacked by strong acids and bases.",
    environments: [
      { name: "Oils and fuels", rating: "excellent" },
      { name: "Water immersion (long-term)", rating: "good" },
      { name: "Strong acids/bases", rating: "poor" },
    ],
    alternativeIds: ["poly-pa66", "poly-pa66-gf", "poly-peek"],
    electrical: {
      notes: "Excellent electrical insulator; volume resistivity typically >1e12 Ω·m (grade dependent).",
    },
  },

  "poly-pa66": {
    summary:
      "Polyamide 66 (nylon) dry — tough engineering plastic with good wear properties; properties shift with moisture absorption.",
    aliases: ["Nylon 66", "PA66", "Polyamide 6.6"],
    formSupply: "Rod, plate, molding resin",
    composition: pct([["PA66", undefined, undefined, 100]]),
    applications: [
      "Gears and sprockets",
      "Cable ties and fasteners",
      "Automotive under-hood parts",
      "Bearing cages",
    ],
    standards: [
      { code: "ISO 16396", title: "Plastics — Polyamide (PA) moulding and extrusion materials" },
      { code: "ASTM D4066", title: "Nylon injection and extrusion materials" },
    ],
    machinabilityNotes: "Good machinability; allow for moisture-related dimensional change after machining.",
    costNotes: "Low commodity engineering plastic.",
    corrosionNotes: "Resistant to many hydrocarbons; absorbs water and is attacked by strong acids.",
    environments: [
      { name: "Oils / greases", rating: "excellent" },
      { name: "Humid air (property drift)", rating: "fair" },
      { name: "Strong acids", rating: "poor" },
    ],
    alternativeIds: ["poly-nylon-6", "poly-pa66-gf", "poly-pom"],
    electrical: {
      notes: "Good insulator when dry; dielectric properties degrade with moisture uptake.",
    },
  },

  // ===================== Cast iron =====================
  "cast-gjl-300": {
    summary:
      "Grey cast iron EN-GJL-300 — high damping and compressive strength for machine bases, housings, and brake components.",
    aliases: ["GG-30", "EN-GJL-300", "Grey iron 300"],
    formSupply: "Sand castings",
    composition: pct([
      ["C", 2.8, 3.5, 3.2],
      ["Si", 1.2, 2.5, 1.8],
      ["Mn", 0.5, 1.0, 0.7],
      ["P", undefined, 0.3],
      ["S", undefined, 0.15],
      ["Fe", undefined, undefined, 93],
    ]),
    applications: [
      "Machine tool beds and bases",
      "Pump and valve housings",
      "Brake discs and drums",
      "Engine blocks (selected)",
    ],
    standards: [
      { code: "EN 1561", title: "Founding — Grey cast irons" },
    ],
    machinabilityNotes: "Excellent machinability; graphite acts as a chip breaker and lubricant.",
    costNotes: "Low casting cost for complex shapes vs weldments.",
    corrosionNotes: "Rusts readily outdoors; paint or oil for protection. Graphite network can aid corrosion cells.",
    environments: [
      { name: "Indoor machinery", rating: "fair" },
      { name: "Outdoor uncoated", rating: "poor" },
    ],
    alternativeIds: ["cast-gjs-700", "s235jr"],
    electrical: { resistivity: 8e-7, notes: "Higher resistivity than carbon steel due to graphite morphology." },
  },

  // ===================== Spring / fastener =====================
  "spring-music-wire": {
    summary:
      "High-carbon music wire (ASTM A228 / EN 10270-1 SH) — highest tensile spring wire for small precision springs.",
    aliases: ["A228", "Music wire", "EN 10270-1 SH"],
    formSupply: "Cold-drawn wire (diameter-dependent strength)",
    composition: pct([
      ["C", 0.7, 1.0, 0.85],
      ["Mn", 0.2, 0.6, 0.4],
      ["P", undefined, 0.025],
      ["S", undefined, 0.03],
      ["Si", 0.1, 0.3],
    ]),
    applications: [
      "Compression and extension springs",
      "Precision instruments",
      "High-cycle small springs",
    ],
    standards: [
      { code: "ASTM A228/A228M", title: "Steel wire, music spring quality" },
      { code: "EN 10270-1", title: "Patenting quality cold drawn wire" },
    ],
    machinabilityNotes: "Not intended for machining; form by coiling. Extremely hard as-drawn.",
    costNotes: "Low-to-moderate wire cost; strength is diameter-sensitive.",
    corrosionNotes: "Plain carbon — plate, oil, or use stainless spring wire in corrosive service.",
    environments: [
      { name: "Dry indoor", rating: "fair" },
      { name: "Humid / outdoor", rating: "poor" },
    ],
    alternativeIds: ["spring-oil-tempered", "spring-hard-drawn", "spring-17-7ph"],
    electrical: { resistivity: 1.8e-7 },
  },

  "bolt-8-8": {
    summary:
      "ISO 898-1 property class 8.8 carbon/alloy steel fastener material — default metric bolt class for general machinery.",
    aliases: ["Class 8.8", "Grade 8.8"],
    formSupply: "Bolts, screws, studs (finished fasteners)",
    composition: pct([
      ["C", 0.25, 0.55],
      ["P", undefined, 0.025],
      ["S", undefined, 0.025],
      ["B", undefined, 0.003],
    ]),
    applications: [
      "General machine assembly",
      "Structural connections (non-preloaded, check code)",
      "Flanged joints",
      "Equipment mounting",
    ],
    standards: [
      { code: "ISO 898-1", title: "Mechanical properties of fasteners — bolts, screws and studs" },
      { code: "EN 15048", title: "Non-preloaded structural bolting (selected)" },
    ],
    machinabilityNotes: "Applies to finished fasteners; blank machining before heat treatment in manufacture.",
    costNotes: "Commodity fastener pricing; widely available.",
    corrosionNotes: "Usually zinc plated or otherwise coated; not stainless.",
    environments: [
      { name: "Indoor machinery", rating: "fair" },
      { name: "Outdoor (plated)", rating: "fair" },
      { name: "Marine (uncoated)", rating: "poor" },
    ],
    alternativeIds: ["bolt-10-9", "bolt-12-9", "ss-316"],
    electrical: { resistivity: 2e-7 },
  },
};

export function getMaterialDatasheet(id: string): MaterialDatasheet | undefined {
  return materialDatasheets[id];
}

export function hasMaterialDatasheet(id: string): boolean {
  return id in materialDatasheets;
}

export function listDatasheetIds(): string[] {
  return Object.keys(materialDatasheets);
}
