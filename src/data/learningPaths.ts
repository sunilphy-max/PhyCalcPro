/**
 * EDP learning paths (EDP-7).
 */

export type LearningStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  starterHint?: string;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "beam-basics",
    title: "Beam Design Basics",
    description: "From bending moment to serviceability limits and section selection.",
    steps: [
      {
        id: "theory",
        title: "Read the beam guide",
        description: "Theory, standards, worked example, and common mistakes.",
        href: "/documentation/modules/beams",
      },
      {
        id: "workspace",
        title: "Open Beam Design Workspace",
        description: "Run a simply supported beam with point load; inspect SFD/BMD.",
        href: "/products/structural/beams",
        starterHint: "Try span 3 m, 5 kN midspan, deflection limit L/360.",
      },
      {
        id: "materials",
        title: "Pick a structural steel",
        description: "Compare S355JR vs ASTM A992 and apply to the calculator.",
        href: "/products/materials/database",
      },
    ],
  },
  {
    id: "power-train",
    title: "Shaft + Bearing Power Train",
    description: "Thread shaft sizing into bearing selection with design modes.",
    steps: [
      {
        id: "shaft",
        title: "Shaft workspace",
        description: "Size a stepped shaft for torque and bending.",
        href: "/products/machine/shafts",
      },
      {
        id: "bearing",
        title: "Rolling bearing selection",
        description: "ISO 281 life and static safety with catalog sweep.",
        href: "/products/bearings",
      },
      {
        id: "copilot",
        title: "Try Design Copilot",
        description: "Describe a power train brief and apply deterministic / AI-parsed inputs.",
        href: "/copilot",
      },
    ],
  },
  {
    id: "fastener-joints",
    title: "Fastener Joints",
    description: "Bolted joints, preload thinking, and pattern load sharing.",
    steps: [
      {
        id: "bolts",
        title: "Bolt calculator",
        description: "Single-bolt and pattern sharing modes.",
        href: "/products/fasteners/bolts",
      },
      {
        id: "guide",
        title: "Bolts knowledge guide",
        description: "Procedure, standards, and mistakes.",
        href: "/documentation/modules/bolts",
      },
    ],
  },
];

export function getLearningPath(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}
