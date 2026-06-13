/**
 * Graded engineering material catalog.
 *
 * Values are typical room-temperature minimums drawn from the governing
 * standards (EN 10025, EN 10083, EN 10270, ISO 898-1, ASTM B209/B265) and
 * Shigley/MatWeb reference data. All values SI: Pa for moduli/strengths,
 * kg/m³ for density.
 */

export type MaterialCategory =
  | "structural-steel"
  | "alloy-steel"
  | "gear-steel"
  | "stainless-steel"
  | "spring-wire"
  | "bolt-class"
  | "cast-iron"
  | "aluminum"
  | "titanium"
  | "copper-alloy"
  | "polymer"
  | "other";

export type Material = {
  name: string;
  category: MaterialCategory;
  /** Standard or designation, e.g. "EN 10025-2" */
  standard?: string;
  /** Young's modulus (Pa) */
  E: number;
  /** Yield (or 0.2% proof) strength (Pa) */
  yieldStress: number;
  /** Ultimate tensile strength (Pa) */
  ultimateStrength: number;
  /** Density (kg/m³) */
  density: number;
  poisson: number;
  /** Shear modulus (Pa); defaults to E/(2(1+ν)) where omitted */
  G?: number;
  /** Rotating-bending endurance limit (Pa) where published */
  enduranceLimit?: number;
  /** Brinell hardness where relevant (gear/contact ratings) */
  hardnessHB?: number;
};

const steel = { E: 210e9, density: 7850, poisson: 0.3 } as const;

export const materials: Material[] = [
  // ===================== Structural steels (EN 10025 / ASTM) =====================
  { name: "S235JR", category: "structural-steel", standard: "EN 10025-2", ...steel, yieldStress: 235e6, ultimateStrength: 360e6 },
  { name: "S275JR", category: "structural-steel", standard: "EN 10025-2", ...steel, yieldStress: 275e6, ultimateStrength: 430e6 },
  { name: "S355JR", category: "structural-steel", standard: "EN 10025-2", ...steel, yieldStress: 355e6, ultimateStrength: 510e6 },
  { name: "S420N", category: "structural-steel", standard: "EN 10025-3", ...steel, yieldStress: 420e6, ultimateStrength: 540e6 },
  { name: "S460N", category: "structural-steel", standard: "EN 10025-3", ...steel, yieldStress: 460e6, ultimateStrength: 570e6 },
  { name: "ASTM A36", category: "structural-steel", standard: "ASTM A36", E: 200e9, density: 7850, poisson: 0.3, yieldStress: 250e6, ultimateStrength: 400e6 },
  { name: "ASTM A572 Gr.50", category: "structural-steel", standard: "ASTM A572", E: 200e9, density: 7850, poisson: 0.3, yieldStress: 345e6, ultimateStrength: 450e6 },
  { name: "ASTM A992 (W-shapes)", category: "structural-steel", standard: "ASTM A992", E: 200e9, density: 7850, poisson: 0.3, yieldStress: 345e6, ultimateStrength: 450e6 },
  { name: "ASTM A500 Gr.B (HSS)", category: "structural-steel", standard: "ASTM A500", E: 200e9, density: 7850, poisson: 0.3, yieldStress: 290e6, ultimateStrength: 400e6 },

  // ===================== Carbon / alloy machine steels =====================
  { name: "C22 (1020) normalized", category: "alloy-steel", standard: "EN 10083-2", ...steel, yieldStress: 240e6, ultimateStrength: 430e6, hardnessHB: 125, enduranceLimit: 190e6 },
  { name: "C45 (1045) normalized", category: "alloy-steel", standard: "EN 10083-2", ...steel, yieldStress: 340e6, ultimateStrength: 620e6, hardnessHB: 180, enduranceLimit: 280e6 },
  { name: "C45 (1045) Q&T", category: "alloy-steel", standard: "EN 10083-2", ...steel, yieldStress: 490e6, ultimateStrength: 700e6, hardnessHB: 210, enduranceLimit: 320e6 },
  { name: "C60 (1060) Q&T", category: "alloy-steel", standard: "EN 10083-2", ...steel, yieldStress: 580e6, ultimateStrength: 850e6, hardnessHB: 250 },
  { name: "34CrMo4 (4130) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, yieldStress: 650e6, ultimateStrength: 900e6, hardnessHB: 270 },
  { name: "42CrMo4 (4140) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, yieldStress: 750e6, ultimateStrength: 1000e6, hardnessHB: 300, enduranceLimit: 480e6 },
  { name: "34CrNiMo6 (4340) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, yieldStress: 900e6, ultimateStrength: 1100e6, hardnessHB: 330 },
  { name: "51CrV4 (6150) Q&T", category: "alloy-steel", standard: "EN 10089", ...steel, yieldStress: 900e6, ultimateStrength: 1100e6, hardnessHB: 320 },

  // ===================== Gear steels =====================
  { name: "16MnCr5 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 635e6, ultimateStrength: 900e6, hardnessHB: 650, enduranceLimit: 430e6 },
  { name: "20MnCr5 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 700e6, ultimateStrength: 1000e6, hardnessHB: 650 },
  { name: "18CrNiMo7-6 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 850e6, ultimateStrength: 1100e6, hardnessHB: 660 },
  { name: "42CrMo4 nitrided", category: "gear-steel", standard: "EN 10083-3", ...steel, yieldStress: 750e6, ultimateStrength: 1000e6, hardnessHB: 600 },
  { name: "C45 induction-hardened", category: "gear-steel", standard: "EN 10083-2", ...steel, yieldStress: 490e6, ultimateStrength: 700e6, hardnessHB: 550 },

  // ===================== Stainless steels =====================
  { name: "1.4301 (304)", category: "stainless-steel", standard: "EN 10088-2", E: 193e9, density: 8000, poisson: 0.29, yieldStress: 210e6, ultimateStrength: 520e6 },
  { name: "1.4401 (316)", category: "stainless-steel", standard: "EN 10088-2", E: 193e9, density: 8000, poisson: 0.29, yieldStress: 220e6, ultimateStrength: 530e6 },
  { name: "1.4462 (duplex 2205)", category: "stainless-steel", standard: "EN 10088-2", E: 200e9, density: 7800, poisson: 0.3, yieldStress: 450e6, ultimateStrength: 650e6 },
  { name: "1.4542 (17-4PH H900)", category: "stainless-steel", standard: "ASTM A564", E: 196e9, density: 7800, poisson: 0.29, yieldStress: 1170e6, ultimateStrength: 1310e6, hardnessHB: 400 },
  { name: "1.4310 (301 spring temper)", category: "stainless-steel", standard: "EN 10270-3", E: 185e9, density: 7900, poisson: 0.29, yieldStress: 1000e6, ultimateStrength: 1300e6 },

  // ===================== Spring wire (EN 10270 / ASTM) =====================
  { name: "Music wire (A228 / EN 10270-1 SH), 2 mm", category: "spring-wire", standard: "ASTM A228", E: 207e9, G: 81.7e9, density: 7850, poisson: 0.3, yieldStress: 1590e6, ultimateStrength: 1990e6 },
  { name: "Hard-drawn wire (A227), 2 mm", category: "spring-wire", standard: "ASTM A227", E: 198.6e9, G: 80.7e9, density: 7850, poisson: 0.3, yieldStress: 1100e6, ultimateStrength: 1560e6 },
  { name: "Oil-tempered wire (A229), 2 mm", category: "spring-wire", standard: "ASTM A229", E: 198.6e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1300e6, ultimateStrength: 1630e6 },
  { name: "Chrome-vanadium wire (A232), 2 mm", category: "spring-wire", standard: "ASTM A232", E: 203.4e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1450e6, ultimateStrength: 1790e6 },
  { name: "Chrome-silicon wire (A401), 2 mm", category: "spring-wire", standard: "ASTM A401", E: 203.4e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1650e6, ultimateStrength: 1830e6 },

  // ===================== Bolt property classes (ISO 898-1) =====================
  { name: "Bolt class 4.6", category: "bolt-class", standard: "ISO 898-1", ...steel, yieldStress: 240e6, ultimateStrength: 400e6 },
  { name: "Bolt class 5.8", category: "bolt-class", standard: "ISO 898-1", ...steel, yieldStress: 400e6, ultimateStrength: 500e6 },
  { name: "Bolt class 8.8", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 640e6, ultimateStrength: 800e6 },
  { name: "Bolt class 10.9", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 940e6, ultimateStrength: 1040e6 },
  { name: "Bolt class 12.9", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 1100e6, ultimateStrength: 1220e6 },

  // ===================== Cast irons =====================
  { name: "EN-GJL-250 (grey iron)", category: "cast-iron", standard: "EN 1561", E: 110e9, density: 7200, poisson: 0.26, yieldStress: 165e6, ultimateStrength: 250e6, hardnessHB: 210 },
  { name: "EN-GJS-400-15 (ductile)", category: "cast-iron", standard: "EN 1563", E: 169e9, density: 7100, poisson: 0.275, yieldStress: 250e6, ultimateStrength: 400e6, hardnessHB: 160 },
  { name: "EN-GJS-600-3 (ductile)", category: "cast-iron", standard: "EN 1563", E: 174e9, density: 7200, poisson: 0.275, yieldStress: 370e6, ultimateStrength: 600e6, hardnessHB: 230 },

  // ===================== Aluminum alloys =====================
  { name: "AW-1050A H14", category: "aluminum", standard: "EN 573-3", E: 69e9, density: 2705, poisson: 0.33, yieldStress: 85e6, ultimateStrength: 105e6 },
  { name: "AW-5083 H111", category: "aluminum", standard: "EN 573-3", E: 71e9, density: 2660, poisson: 0.33, yieldStress: 125e6, ultimateStrength: 275e6 },
  { name: "AW-6061 T6", category: "aluminum", standard: "ASTM B209", E: 68.9e9, density: 2700, poisson: 0.33, yieldStress: 276e6, ultimateStrength: 310e6, enduranceLimit: 96e6 },
  { name: "AW-6082 T6", category: "aluminum", standard: "EN 573-3", E: 70e9, density: 2700, poisson: 0.33, yieldStress: 260e6, ultimateStrength: 310e6 },
  { name: "AW-7075 T6", category: "aluminum", standard: "ASTM B209", E: 71.7e9, density: 2810, poisson: 0.33, yieldStress: 503e6, ultimateStrength: 572e6, enduranceLimit: 159e6 },
  { name: "AW-2024 T3", category: "aluminum", standard: "ASTM B209", E: 73.1e9, density: 2780, poisson: 0.33, yieldStress: 345e6, ultimateStrength: 483e6, enduranceLimit: 138e6 },

  // ===================== Titanium =====================
  { name: "Ti Grade 2 (CP)", category: "titanium", standard: "ASTM B265", E: 105e9, density: 4510, poisson: 0.34, yieldStress: 275e6, ultimateStrength: 345e6 },
  { name: "Ti-6Al-4V (Grade 5)", category: "titanium", standard: "ASTM B265", E: 113.8e9, density: 4430, poisson: 0.342, yieldStress: 880e6, ultimateStrength: 950e6, enduranceLimit: 510e6 },

  // ===================== Copper alloys =====================
  { name: "CW004A (ETP copper)", category: "copper-alloy", standard: "EN 1652", E: 117e9, density: 8940, poisson: 0.34, yieldStress: 70e6, ultimateStrength: 220e6 },
  { name: "CW508L (CuZn37 brass)", category: "copper-alloy", standard: "EN 1652", E: 110e9, density: 8440, poisson: 0.34, yieldStress: 200e6, ultimateStrength: 380e6 },
  { name: "CW307G (CuAl10Ni bronze)", category: "copper-alloy", standard: "EN 1652", E: 115e9, density: 7600, poisson: 0.32, yieldStress: 270e6, ultimateStrength: 620e6, hardnessHB: 170 },
  { name: "CW452K (CuSn6 phosphor bronze)", category: "copper-alloy", standard: "EN 1652", E: 112e9, density: 8800, poisson: 0.34, yieldStress: 450e6, ultimateStrength: 550e6 },

  // ===================== Polymers =====================
  { name: "POM-C (acetal)", category: "polymer", E: 2.8e9, density: 1410, poisson: 0.35, yieldStress: 67e6, ultimateStrength: 67e6 },
  { name: "PA66 (nylon, dry)", category: "polymer", E: 3.1e9, density: 1140, poisson: 0.39, yieldStress: 82e6, ultimateStrength: 82e6 },
  { name: "PEEK", category: "polymer", E: 3.6e9, density: 1320, poisson: 0.38, yieldStress: 97e6, ultimateStrength: 97e6 },
  { name: "PC (polycarbonate)", category: "polymer", E: 2.3e9, density: 1200, poisson: 0.37, yieldStress: 62e6, ultimateStrength: 66e6 },

  // ===================== Other =====================
  { name: "Concrete C30/37", category: "other", standard: "EN 1992", E: 33e9, density: 2400, poisson: 0.2, yieldStress: 30e6, ultimateStrength: 38e6 },
  { name: "Glulam GL24h", category: "other", standard: "EN 14080", E: 11.5e9, density: 420, poisson: 0.3, yieldStress: 24e6, ultimateStrength: 24e6 },
];

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  "structural-steel": "Structural steel",
  "alloy-steel": "Carbon & alloy steel",
  "gear-steel": "Gear steel",
  "stainless-steel": "Stainless steel",
  "spring-wire": "Spring wire",
  "bolt-class": "Bolt property class",
  "cast-iron": "Cast iron",
  aluminum: "Aluminum alloy",
  titanium: "Titanium",
  "copper-alloy": "Copper alloy",
  polymer: "Polymer",
  other: "Other",
};

export function shearModulus(material: Material): number {
  return material.G ?? material.E / (2 * (1 + material.poisson));
}

export function materialsInCategory(category: MaterialCategory): Material[] {
  return materials.filter((m) => m.category === category);
}

export function findMaterial(name: string): Material | undefined {
  return materials.find((m) => m.name === name);
}
