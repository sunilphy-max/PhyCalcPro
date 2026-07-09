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
  | "weld-filler"
  | "cast-iron"
  | "aluminum"
  | "titanium"
  | "copper-alloy"
  | "polymer"
  | "other";

export type Material = {
  /** Stable slug for storage across renames */
  id: string;
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
  /** Fillet weld throat shear allowable (Pa) — AWS D1.1 / ISO 5817 typical */
  weldAllowableShear?: number;
  /** Matching electrode tensile for weld strength checks (Pa) */
  weldElectrodeStrength?: number;
  /** Rivet/pin shear strength (Pa) */
  shearStrength?: number;
  /** Rivet bearing strength (Pa) */
  bearingStrength?: number;
  /** Coefficient of thermal expansion (1/K) */
  thermalExpansion?: number;
};

const steel = { E: 210e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6 } as const;
const weldSteel = { weldElectrodeStrength: 490e6, weldAllowableShear: 0.6 * 490e6 } as const;

function rivetFromSteel(yieldStress: number, ultimateStrength: number) {
  return {
    shearStrength: 0.6 * ultimateStrength,
    bearingStrength: 2 * yieldStress,
  };
}

export const materials: Material[] = [
  // ===================== Structural steels (EN 10025 / ASTM) =====================
  { id: "s235jr", name: "S235JR", category: "structural-steel", standard: "EN 10025-2", ...steel, ...weldSteel, ...rivetFromSteel(235e6, 360e6), yieldStress: 235e6, ultimateStrength: 360e6 },
  { id: "s275jr", name: "S275JR", category: "structural-steel", standard: "EN 10025-2", ...steel, ...weldSteel, ...rivetFromSteel(275e6, 430e6), yieldStress: 275e6, ultimateStrength: 430e6 },
  { id: "s355jr", name: "S355JR", category: "structural-steel", standard: "EN 10025-2", ...steel, ...weldSteel, ...rivetFromSteel(355e6, 510e6), yieldStress: 355e6, ultimateStrength: 510e6 },
  { id: "s355j2", name: "S355J2", category: "structural-steel", standard: "EN 10025-2", ...steel, ...weldSteel, ...rivetFromSteel(355e6, 510e6), yieldStress: 355e6, ultimateStrength: 510e6 },
  { id: "s420n", name: "S420N", category: "structural-steel", standard: "EN 10025-3", ...steel, ...weldSteel, ...rivetFromSteel(420e6, 540e6), yieldStress: 420e6, ultimateStrength: 540e6 },
  { id: "s460n", name: "S460N", category: "structural-steel", standard: "EN 10025-3", ...steel, ...weldSteel, ...rivetFromSteel(460e6, 570e6), yieldStress: 460e6, ultimateStrength: 570e6 },
  { id: "astm-a36", name: "ASTM A36", category: "structural-steel", standard: "ASTM A36", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, ...weldSteel, ...rivetFromSteel(250e6, 400e6), yieldStress: 250e6, ultimateStrength: 400e6 },
  { id: "astm-a572-gr50", name: "ASTM A572 Gr.50", category: "structural-steel", standard: "ASTM A572", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, ...weldSteel, ...rivetFromSteel(345e6, 450e6), yieldStress: 345e6, ultimateStrength: 450e6 },
  { id: "astm-a572-gr60", name: "ASTM A572 Gr.60", category: "structural-steel", standard: "ASTM A572", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, ...weldSteel, ...rivetFromSteel(415e6, 520e6), yieldStress: 415e6, ultimateStrength: 520e6 },
  { id: "astm-a514", name: "ASTM A514", category: "structural-steel", standard: "ASTM A514", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, weldElectrodeStrength: 550e6, weldAllowableShear: 0.6 * 550e6, ...rivetFromSteel(690e6, 760e6), yieldStress: 690e6, ultimateStrength: 760e6 },
  { id: "astm-a992", name: "ASTM A992 (W-shapes)", category: "structural-steel", standard: "ASTM A992", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, ...weldSteel, ...rivetFromSteel(345e6, 450e6), yieldStress: 345e6, ultimateStrength: 450e6 },
  { id: "astm-a500-grb", name: "ASTM A500 Gr.B (HSS)", category: "structural-steel", standard: "ASTM A500", E: 200e9, density: 7850, poisson: 0.3, thermalExpansion: 12e-6, ...weldSteel, ...rivetFromSteel(290e6, 400e6), yieldStress: 290e6, ultimateStrength: 400e6 },

  // ===================== Carbon / alloy machine steels =====================
  { id: "c22-1020", name: "C22 (1020) normalized", category: "alloy-steel", standard: "EN 10083-2", ...steel, ...weldSteel, ...rivetFromSteel(240e6, 430e6), yieldStress: 240e6, ultimateStrength: 430e6, hardnessHB: 125, enduranceLimit: 190e6 },
  { id: "aisi-1018", name: "AISI 1018 normalized", category: "alloy-steel", standard: "ASTM A29", ...steel, ...weldSteel, ...rivetFromSteel(220e6, 400e6), yieldStress: 220e6, ultimateStrength: 400e6, hardnessHB: 120, enduranceLimit: 180e6 },
  { id: "c45-1045-n", name: "C45 (1045) normalized", category: "alloy-steel", standard: "EN 10083-2", ...steel, ...weldSteel, ...rivetFromSteel(340e6, 620e6), yieldStress: 340e6, ultimateStrength: 620e6, hardnessHB: 180, enduranceLimit: 280e6 },
  { id: "aisi-1045-n", name: "AISI 1045 normalized", category: "alloy-steel", standard: "ASTM A29", ...steel, ...weldSteel, ...rivetFromSteel(310e6, 565e6), yieldStress: 310e6, ultimateStrength: 565e6, hardnessHB: 170, enduranceLimit: 260e6 },
  { id: "c45-1045-qt", name: "C45 (1045) Q&T", category: "alloy-steel", standard: "EN 10083-2", ...steel, ...weldSteel, ...rivetFromSteel(490e6, 700e6), yieldStress: 490e6, ultimateStrength: 700e6, hardnessHB: 210, enduranceLimit: 320e6 },
  { id: "c60-1060-qt", name: "C60 (1060) Q&T", category: "alloy-steel", standard: "EN 10083-2", ...steel, ...weldSteel, ...rivetFromSteel(580e6, 850e6), yieldStress: 580e6, ultimateStrength: 850e6, hardnessHB: 250 },
  { id: "34crmo4-4130", name: "34CrMo4 (4130) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, ...weldSteel, ...rivetFromSteel(650e6, 900e6), yieldStress: 650e6, ultimateStrength: 900e6, hardnessHB: 270 },
  { id: "42crmo4-4140", name: "42CrMo4 (4140) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, ...weldSteel, ...rivetFromSteel(750e6, 1000e6), yieldStress: 750e6, ultimateStrength: 1000e6, hardnessHB: 300, enduranceLimit: 480e6 },
  { id: "34crnimo6-4340", name: "34CrNiMo6 (4340) Q&T", category: "alloy-steel", standard: "EN 10083-3", ...steel, ...weldSteel, ...rivetFromSteel(900e6, 1100e6), yieldStress: 900e6, ultimateStrength: 1100e6, hardnessHB: 330 },
  { id: "51crv4-6150", name: "51CrV4 (6150) Q&T", category: "alloy-steel", standard: "EN 10089", ...steel, ...weldSteel, ...rivetFromSteel(900e6, 1100e6), yieldStress: 900e6, ultimateStrength: 1100e6, hardnessHB: 320 },

  // ===================== Gear steels =====================
  { id: "16mncr5-ch", name: "16MnCr5 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 635e6, ultimateStrength: 900e6, hardnessHB: 650, enduranceLimit: 430e6 },
  { id: "20mncr5-ch", name: "20MnCr5 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 700e6, ultimateStrength: 1000e6, hardnessHB: 650 },
  { id: "18crnimo7-6-ch", name: "18CrNiMo7-6 case-hardened", category: "gear-steel", standard: "EN 10084", ...steel, yieldStress: 850e6, ultimateStrength: 1100e6, hardnessHB: 660 },
  { id: "42crmo4-nitrided", name: "42CrMo4 nitrided", category: "gear-steel", standard: "EN 10083-3", ...steel, yieldStress: 750e6, ultimateStrength: 1000e6, hardnessHB: 600 },
  { id: "c45-ih", name: "C45 induction-hardened", category: "gear-steel", standard: "EN 10083-2", ...steel, yieldStress: 490e6, ultimateStrength: 700e6, hardnessHB: 550 },

  // ===================== Stainless steels =====================
  { id: "ss-304", name: "1.4301 (304)", category: "stainless-steel", standard: "EN 10088-2", E: 193e9, density: 8000, poisson: 0.29, thermalExpansion: 17e-6, weldElectrodeStrength: 520e6, weldAllowableShear: 0.6 * 520e6, ...rivetFromSteel(210e6, 520e6), yieldStress: 210e6, ultimateStrength: 520e6 },
  { id: "ss-316", name: "1.4401 (316)", category: "stainless-steel", standard: "EN 10088-2", E: 193e9, density: 8000, poisson: 0.29, thermalExpansion: 16e-6, weldElectrodeStrength: 520e6, weldAllowableShear: 0.6 * 520e6, ...rivetFromSteel(220e6, 530e6), yieldStress: 220e6, ultimateStrength: 530e6 },
  { id: "ss-316l", name: "1.4404 (316L)", category: "stainless-steel", standard: "EN 10088-2", E: 193e9, density: 8000, poisson: 0.29, thermalExpansion: 16e-6, weldElectrodeStrength: 520e6, weldAllowableShear: 0.6 * 520e6, ...rivetFromSteel(200e6, 500e6), yieldStress: 200e6, ultimateStrength: 500e6 },
  { id: "ss-duplex-2205", name: "1.4462 (duplex 2205)", category: "stainless-steel", standard: "EN 10088-2", E: 200e9, density: 7800, poisson: 0.3, thermalExpansion: 13e-6, weldElectrodeStrength: 690e6, weldAllowableShear: 0.6 * 690e6, ...rivetFromSteel(450e6, 650e6), yieldStress: 450e6, ultimateStrength: 650e6 },
  { id: "ss-410", name: "1.4006 (410)", category: "stainless-steel", standard: "EN 10088-2", E: 200e9, density: 7750, poisson: 0.3, thermalExpansion: 10e-6, weldElectrodeStrength: 550e6, weldAllowableShear: 0.6 * 550e6, ...rivetFromSteel(450e6, 650e6), yieldStress: 450e6, ultimateStrength: 650e6 },
  { id: "ss-430", name: "1.4016 (430)", category: "stainless-steel", standard: "EN 10088-2", E: 200e9, density: 7700, poisson: 0.3, thermalExpansion: 10e-6, weldElectrodeStrength: 480e6, weldAllowableShear: 0.6 * 480e6, ...rivetFromSteel(280e6, 450e6), yieldStress: 280e6, ultimateStrength: 450e6 },
  { id: "ss-17-4ph", name: "1.4542 (17-4PH H900)", category: "stainless-steel", standard: "ASTM A564", E: 196e9, density: 7800, poisson: 0.29, thermalExpansion: 10.8e-6, weldElectrodeStrength: 760e6, weldAllowableShear: 0.6 * 760e6, ...rivetFromSteel(1170e6, 1310e6), yieldStress: 1170e6, ultimateStrength: 1310e6, hardnessHB: 400 },
  { id: "ss-301-spring", name: "1.4310 (301 spring temper)", category: "stainless-steel", standard: "EN 10270-3", E: 185e9, density: 7900, poisson: 0.29, thermalExpansion: 17e-6, yieldStress: 1000e6, ultimateStrength: 1300e6 },

  // ===================== Spring wire (EN 10270 / ASTM) =====================
  { id: "spring-music-wire", name: "Music wire (A228 / EN 10270-1 SH), 2 mm", category: "spring-wire", standard: "ASTM A228", E: 207e9, G: 81.7e9, density: 7850, poisson: 0.3, yieldStress: 1590e6, ultimateStrength: 1990e6 },
  { id: "spring-hard-drawn", name: "Hard-drawn wire (A227), 2 mm", category: "spring-wire", standard: "ASTM A227", E: 198.6e9, G: 80.7e9, density: 7850, poisson: 0.3, yieldStress: 1100e6, ultimateStrength: 1560e6 },
  { id: "spring-oil-tempered", name: "Oil-tempered wire (A229), 2 mm", category: "spring-wire", standard: "ASTM A229", E: 198.6e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1300e6, ultimateStrength: 1630e6 },
  { id: "spring-crv", name: "Chrome-vanadium wire (A232), 2 mm", category: "spring-wire", standard: "ASTM A232", E: 203.4e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1450e6, ultimateStrength: 1790e6 },
  { id: "spring-crsi", name: "Chrome-silicon wire (A401), 2 mm", category: "spring-wire", standard: "ASTM A401", E: 203.4e9, G: 77.2e9, density: 7850, poisson: 0.3, yieldStress: 1650e6, ultimateStrength: 1830e6 },

  // ===================== Bolt property classes (ISO 898-1) =====================
  { id: "bolt-4-6", name: "Bolt class 4.6", category: "bolt-class", standard: "ISO 898-1", ...steel, yieldStress: 240e6, ultimateStrength: 400e6 },
  { id: "bolt-5-8", name: "Bolt class 5.8", category: "bolt-class", standard: "ISO 898-1", ...steel, yieldStress: 400e6, ultimateStrength: 500e6 },
  { id: "bolt-8-8", name: "Bolt class 8.8", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 640e6, ultimateStrength: 800e6 },
  { id: "bolt-10-9", name: "Bolt class 10.9", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 940e6, ultimateStrength: 1040e6 },
  { id: "bolt-12-9", name: "Bolt class 12.9", category: "bolt-class", standard: "ISO 898-1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 1100e6, ultimateStrength: 1220e6 },

  // ===================== Weld filler (AWS D1.1 / ISO 5817) =====================
  { id: "weld-e6013", name: "E6013 (AWS A5.1)", category: "weld-filler", standard: "AWS A5.1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 330e6, ultimateStrength: 430e6, weldElectrodeStrength: 430e6, weldAllowableShear: 0.6 * 430e6 },
  { id: "weld-e7018", name: "E7018 (AWS A5.1)", category: "weld-filler", standard: "AWS A5.1", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 400e6, ultimateStrength: 490e6, weldElectrodeStrength: 490e6, weldAllowableShear: 0.6 * 490e6 },
  { id: "weld-er70s-6", name: "ER70S-6 (AWS A5.18)", category: "weld-filler", standard: "AWS A5.18", E: 205e9, density: 7850, poisson: 0.3, yieldStress: 400e6, ultimateStrength: 490e6, weldElectrodeStrength: 490e6, weldAllowableShear: 0.6 * 490e6 },
  { id: "weld-e308", name: "E308 (AWS A5.4)", category: "weld-filler", standard: "AWS A5.4", E: 200e9, density: 7900, poisson: 0.29, yieldStress: 350e6, ultimateStrength: 520e6, weldElectrodeStrength: 520e6, weldAllowableShear: 0.6 * 520e6 },

  // ===================== Cast irons =====================
  { id: "gjl-250", name: "EN-GJL-250 (grey iron)", category: "cast-iron", standard: "EN 1561", E: 110e9, density: 7200, poisson: 0.26, thermalExpansion: 10.5e-6, yieldStress: 165e6, ultimateStrength: 250e6, hardnessHB: 210 },
  { id: "gjs-400-15", name: "EN-GJS-400-15 (ductile)", category: "cast-iron", standard: "EN 1563", E: 169e9, density: 7100, poisson: 0.275, thermalExpansion: 11e-6, yieldStress: 250e6, ultimateStrength: 400e6, hardnessHB: 160 },
  { id: "gjs-600-3", name: "EN-GJS-600-3 (ductile)", category: "cast-iron", standard: "EN 1563", E: 174e9, density: 7200, poisson: 0.275, thermalExpansion: 11e-6, yieldStress: 370e6, ultimateStrength: 600e6, hardnessHB: 230 },

  // ===================== Aluminum alloys =====================
  { id: "al-1050a", name: "AW-1050A H14", category: "aluminum", standard: "EN 573-3", E: 69e9, density: 2705, poisson: 0.33, thermalExpansion: 23.6e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(85e6, 105e6), yieldStress: 85e6, ultimateStrength: 105e6 },
  { id: "al-3003", name: "AW-3003 H14", category: "aluminum", standard: "ASTM B209", E: 69e9, density: 2730, poisson: 0.33, thermalExpansion: 23.2e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(145e6, 185e6), yieldStress: 145e6, ultimateStrength: 185e6 },
  { id: "al-5052", name: "AW-5052 H32", category: "aluminum", standard: "ASTM B209", E: 70e9, density: 2680, poisson: 0.33, thermalExpansion: 23.8e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel( 193e6, 228e6), yieldStress: 193e6, ultimateStrength: 228e6 },
  { id: "al-5083", name: "AW-5083 H111", category: "aluminum", standard: "EN 573-3", E: 71e9, density: 2660, poisson: 0.33, thermalExpansion: 23.8e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(125e6, 275e6), yieldStress: 125e6, ultimateStrength: 275e6 },
  { id: "al-6061", name: "AW-6061 T6", category: "aluminum", standard: "ASTM B209", E: 68.9e9, density: 2700, poisson: 0.33, thermalExpansion: 23.6e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(276e6, 310e6), yieldStress: 276e6, ultimateStrength: 310e6, enduranceLimit: 96e6 },
  { id: "al-6082", name: "AW-6082 T6", category: "aluminum", standard: "EN 573-3", E: 70e9, density: 2700, poisson: 0.33, thermalExpansion: 23.6e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(260e6, 310e6), yieldStress: 260e6, ultimateStrength: 310e6 },
  { id: "al-7075", name: "AW-7075 T6", category: "aluminum", standard: "ASTM B209", E: 71.7e9, density: 2810, poisson: 0.33, thermalExpansion: 23.4e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(503e6, 572e6), yieldStress: 503e6, ultimateStrength: 572e6, enduranceLimit: 159e6 },
  { id: "al-2024", name: "AW-2024 T3", category: "aluminum", standard: "ASTM B209", E: 73.1e9, density: 2780, poisson: 0.33, thermalExpansion: 23.2e-6, weldElectrodeStrength: 275e6, weldAllowableShear: 0.6 * 275e6, ...rivetFromSteel(345e6, 483e6), yieldStress: 345e6, ultimateStrength: 483e6, enduranceLimit: 138e6 },

  // ===================== Titanium =====================
  { id: "ti-grade-2", name: "Ti Grade 2 (CP)", category: "titanium", standard: "ASTM B265", E: 105e9, density: 4510, poisson: 0.34, thermalExpansion: 8.6e-6, yieldStress: 275e6, ultimateStrength: 345e6 },
  { id: "ti-6al-4v", name: "Ti-6Al-4V (Grade 5)", category: "titanium", standard: "ASTM B265", E: 113.8e9, density: 4430, poisson: 0.342, thermalExpansion: 8.6e-6, yieldStress: 880e6, ultimateStrength: 950e6, enduranceLimit: 510e6 },

  // ===================== Copper alloys =====================
  { id: "cu-etp", name: "CW004A (ETP copper)", category: "copper-alloy", standard: "EN 1652", E: 117e9, density: 8940, poisson: 0.34, thermalExpansion: 16.5e-6, ...rivetFromSteel(70e6, 220e6), yieldStress: 70e6, ultimateStrength: 220e6 },
  { id: "cu-brass", name: "CW508L (CuZn37 brass)", category: "copper-alloy", standard: "EN 1652", E: 110e9, density: 8440, poisson: 0.34, thermalExpansion: 20.3e-6, ...rivetFromSteel(200e6, 380e6), yieldStress: 200e6, ultimateStrength: 380e6 },
  { id: "cu-al-bronze", name: "CW307G (CuAl10Ni bronze)", category: "copper-alloy", standard: "EN 1652", E: 115e9, density: 7600, poisson: 0.32, thermalExpansion: 16e-6, ...rivetFromSteel(270e6, 620e6), yieldStress: 270e6, ultimateStrength: 620e6, hardnessHB: 170 },
  { id: "cu-phosphor-bronze", name: "CW452K (CuSn6 phosphor bronze)", category: "copper-alloy", standard: "EN 1652", E: 112e9, density: 8800, poisson: 0.34, thermalExpansion: 18e-6, ...rivetFromSteel(450e6, 550e6), yieldStress: 450e6, ultimateStrength: 550e6 },

  // ===================== Polymers =====================
  { id: "poly-pom", name: "POM-C (acetal / Delrin)", category: "polymer", E: 2.8e9, density: 1410, poisson: 0.35, thermalExpansion: 110e-6, yieldStress: 67e6, ultimateStrength: 67e6 },
  { id: "poly-pa66", name: "PA66 (nylon, dry)", category: "polymer", E: 3.1e9, density: 1140, poisson: 0.39, thermalExpansion: 80e-6, yieldStress: 82e6, ultimateStrength: 82e6 },
  { id: "poly-pa66-gf", name: "PA66 30% glass-filled", category: "polymer", E: 9.5e9, density: 1360, poisson: 0.35, thermalExpansion: 30e-6, yieldStress: 175e6, ultimateStrength: 175e6 },
  { id: "poly-peek", name: "PEEK", category: "polymer", E: 3.6e9, density: 1320, poisson: 0.38, thermalExpansion: 47e-6, yieldStress: 97e6, ultimateStrength: 97e6 },
  { id: "poly-pc", name: "PC (polycarbonate)", category: "polymer", E: 2.3e9, density: 1200, poisson: 0.37, thermalExpansion: 65e-6, yieldStress: 62e6, ultimateStrength: 66e6 },
  { id: "poly-abs", name: "ABS", category: "polymer", E: 2.3e9, density: 1050, poisson: 0.35, thermalExpansion: 90e-6, yieldStress: 40e6, ultimateStrength: 45e6 },
  { id: "poly-hdpe", name: "HDPE", category: "polymer", E: 1.0e9, density: 960, poisson: 0.42, thermalExpansion: 200e-6, yieldStress: 26e6, ultimateStrength: 32e6 },
  { id: "poly-ptfe", name: "PTFE (Teflon)", category: "polymer", E: 0.5e9, density: 2200, poisson: 0.46, thermalExpansion: 135e-6, yieldStress: 15e6, ultimateStrength: 25e6 },
  { id: "poly-uhmwpe", name: "UHMW-PE", category: "polymer", E: 0.7e9, density: 930, poisson: 0.45, thermalExpansion: 200e-6, yieldStress: 22e6, ultimateStrength: 48e6 },

  // ===================== Other =====================
  { id: "concrete-c30", name: "Concrete C30/37", category: "other", standard: "EN 1992", E: 33e9, density: 2400, poisson: 0.2, thermalExpansion: 10e-6, yieldStress: 30e6, ultimateStrength: 38e6 },
  { id: "glulam-gl24h", name: "Glulam GL24h", category: "other", standard: "EN 14080", E: 11.5e9, density: 420, poisson: 0.3, thermalExpansion: 5e-6, yieldStress: 24e6, ultimateStrength: 24e6 },
];

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  "structural-steel": "Structural steel",
  "alloy-steel": "Carbon & alloy steel",
  "gear-steel": "Gear steel",
  "stainless-steel": "Stainless steel",
  "spring-wire": "Spring wire",
  "bolt-class": "Bolt property class",
  "weld-filler": "Weld filler",
  "cast-iron": "Cast iron",
  aluminum: "Aluminum alloy",
  titanium: "Titanium",
  "copper-alloy": "Copper alloy",
  polymer: "Polymer",
  other: "Other",
};

export const CUSTOM_MATERIAL = "Custom" as const;

export function shearModulus(material: Material): number {
  return material.G ?? material.E / (2 * (1 + material.poisson));
}

export function materialsInCategory(category: MaterialCategory): Material[] {
  return materials.filter((m) => m.category === category);
}

export function findMaterial(name: string): Material | undefined {
  return materials.find((m) => m.name === name);
}

export function findMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id);
}
