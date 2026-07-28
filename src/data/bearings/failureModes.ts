/**
 * Bearing failure modes — maintenance / reliability guide content.
 */

export type BearingFailureMode = {
  id: string;
  name: string;
  summary: string;
  probableCauses: string[];
  correctiveActions: string[];
  references: string[];
};

export const bearingFailureModes: BearingFailureMode[] = [
  {
    id: "spalling",
    name: "Spalling / flaking",
    summary:
      "Material fragments break away from raceway or rolling-element surfaces after subsurface fatigue cracks reach the surface.",
    probableCauses: [
      "Normal end of L10 fatigue life under the applied load",
      "Overload or shock beyond design duty",
      "Inadequate lubrication film (low κ)",
      "Contamination indentations acting as stress raisers",
    ],
    correctiveActions: [
      "Verify equivalent load P and required C against ISO 281 life target",
      "Improve filtration / sealing; raise viscosity or change grease",
      "Check for misalignment and shaft deflection",
      "Replace bearing; inspect shaft and housing seats",
    ],
    references: ["ISO 15243", "ISO 281", "OEM failure analysis guides"],
  },
  {
    id: "pitting",
    name: "Pitting",
    summary: "Localized surface cavities from contact fatigue or corrosive attack.",
    probableCauses: [
      "Thin lubricant film / boundary lubrication",
      "Water or corrosive media in the lubricant",
      "Electrical discharge (EDM) in electric machines",
    ],
    correctiveActions: [
      "Restore adequate κ and cleanliness (eC)",
      "Address moisture ingress and lubricant chemistry",
      "For motors: check grounding / shaft currents",
    ],
    references: ["ISO 15243", "ISO 281 contamination factors"],
  },
  {
    id: "smearing",
    name: "Smearing",
    summary: "Surface material transfer from adhesive wear under sliding or skidding.",
    probableCauses: [
      "Insufficient load (skidding of rollers)",
      "Sudden acceleration with poor oil film",
      "Incorrect preload or clearance",
    ],
    correctiveActions: [
      "Ensure minimum load requirements are met",
      "Review start-up lubrication and viscosity",
      "Adjust preload / clearance class",
    ],
    references: ["ISO 15243", "OEM mounting guides"],
  },
  {
    id: "false-brinelling",
    name: "False brinelling",
    summary: "Fretting wear marks at rolling-element spacing from vibration without rotation.",
    probableCauses: [
      "Standstill vibration during transport or storage",
      "Machine vibration while bearing is not rotating",
    ],
    correctiveActions: [
      "Secure rotors during shipment; rotate periodically in storage",
      "Isolate vibration sources at standstill",
      "Replace damaged bearings; improve packing",
    ],
    references: ["ISO 15243"],
  },
  {
    id: "corrosion",
    name: "Corrosion",
    summary: "Rust or etching on rings and rolling elements from moisture or chemicals.",
    probableCauses: [
      "Condensation or water washdown",
      "Incompatible or degraded lubricant",
      "Damaged seals",
    ],
    correctiveActions: [
      "Upgrade sealing and grease washout resistance",
      "Control humidity and washdown exposure",
      "Select corrosion-resistant materials where needed",
    ],
    references: ["ISO 15243", "Seal OEM guides"],
  },
  {
    id: "wear",
    name: "Abrasive wear",
    summary: "Progressive removal of material from raceways and elements by hard particles.",
    probableCauses: [
      "Contaminated lubricant",
      "Inadequate seals",
      "Wear debris recirculation",
    ],
    correctiveActions: [
      "Improve filtration and sealing",
      "Shorten relubrication interval",
      "Flush and refill lubricant system",
    ],
    references: ["ISO 15243", "ISO 281 eC guidance"],
  },
  {
    id: "cage-failure",
    name: "Cage failure",
    summary: "Cage fracture, wear, or deformation leading to element clustering or lock-up.",
    probableCauses: [
      "Excessive speed or misalignment",
      "Moment loads / skewing",
      "Lubrication starvation",
      "Incorrect mounting (hammer blows)",
    ],
    correctiveActions: [
      "Stay within limiting / reference speed",
      "Correct alignment and mounting practice",
      "Ensure lubricant reaches the cage pocket",
    ],
    references: ["ISO 15243", "OEM mounting instructions"],
  },
];

export function getBearingFailureMode(id: string): BearingFailureMode | undefined {
  return bearingFailureModes.find((m) => m.id === id);
}
