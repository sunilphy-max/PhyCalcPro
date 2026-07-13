"use client";

import type { BearingType } from "@/lib/machine/bearings/types";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import BearingCrossSectionSvg from "@/components/machine/bearings/BearingCrossSectionSvg";

export type BearingFamilyId =
  | "deep_groove"
  | "angular_contact"
  | "cylindrical"
  | "tapered_roller"
  | "spherical_roller"
  | "toroidal_roller"
  | "needle_roller"
  | "self_aligning_ball"
  | "thrust";

type FamilyCard = {
  id: BearingFamilyId;
  label: string;
  description: string;
  types: BearingType[];
  defaultType: BearingType;
};

export const BEARING_FAMILY_CARDS: FamilyCard[] = [
  {
    id: "deep_groove",
    label: "Deep groove ball",
    description: "General radial & light axial loads",
    types: ["deep_groove"],
    defaultType: "deep_groove",
  },
  {
    id: "angular_contact",
    label: "Angular contact ball",
    description: "Combined radial + axial, duplex pairs",
    types: ["angular_contact"],
    defaultType: "angular_contact",
  },
  {
    id: "cylindrical",
    label: "Cylindrical roller",
    description: "High radial capacity — NU / NJ / NUP",
    types: ["cylindrical_roller", "cylindrical_nj", "cylindrical_nup"],
    defaultType: "cylindrical_roller",
  },
  {
    id: "tapered_roller",
    label: "Tapered roller",
    description: "Combined loads, paired O / X / T",
    types: ["tapered_roller"],
    defaultType: "tapered_roller",
  },
  {
    id: "spherical_roller",
    label: "Spherical roller",
    description: "Heavy shock, misalignment tolerant",
    types: ["spherical_roller"],
    defaultType: "spherical_roller",
  },
  {
    id: "toroidal_roller",
    label: "Toroidal roller (CARB)",
    description: "Misalignment + axial float in one bearing",
    types: ["toroidal_roller"],
    defaultType: "toroidal_roller",
  },
  {
    id: "needle_roller",
    label: "Needle roller",
    description: "Compact envelope — NA / NK / HK / RNA",
    types: ["needle_roller"],
    defaultType: "needle_roller",
  },
  {
    id: "self_aligning_ball",
    label: "Self-aligning ball",
    description: "Shaft misalignment, moderate loads",
    types: ["self_aligning_ball"],
    defaultType: "self_aligning_ball",
  },
  {
    id: "thrust",
    label: "Thrust bearings",
    description: "Ball, cylindrical roller, or spherical roller thrust",
    types: ["thrust_ball", "thrust_cylindrical_roller", "thrust_spherical_roller"],
    defaultType: "thrust_ball",
  },
];

function familyForType(type: BearingType): BearingFamilyId {
  const card = BEARING_FAMILY_CARDS.find((c) => c.types.includes(type));
  return card?.id ?? "deep_groove";
}

type Props = {
  value: BearingType;
  availableTypes: BearingType[];
  onChange: (type: BearingType) => void;
  compact?: boolean;
};

export default function BearingTypePicker({ value, availableTypes, onChange, compact = false }: Props) {
  const activeFamily = familyForType(value);
  const showCylindricalVariants = activeFamily === "cylindrical";
  const showThrustVariants = activeFamily === "thrust";

  const pickFamily = (card: FamilyCard) => {
    const next = card.types.find((t) => availableTypes.includes(t)) ?? card.defaultType;
    onChange(next);
  };

  return (
    <div className="bearing-type-picker space-y-3">
      <div
        className={`grid gap-2 ${
          compact
            ? "grid-cols-1"
            : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {BEARING_FAMILY_CARDS.map((card) => {
          const enabled = card.types.some((t) => availableTypes.includes(t));
          const active = card.id === activeFamily;
          const previewType = card.types.find((t) => availableTypes.includes(t)) ?? card.defaultType;
          return (
            <button
              key={card.id}
              type="button"
              disabled={!enabled}
              onClick={() => pickFamily(card)}
              className={`flex flex-col overflow-hidden rounded-xl border text-left transition ${
                active
                  ? "border-cyan-500/80 bg-cyan-50/90 shadow-sm ring-2 ring-cyan-500/20 dark:border-cyan-600/60 dark:bg-cyan-950/30"
                  : enabled
                    ? "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-slate-600"
                    : "cursor-not-allowed border-slate-200/50 bg-slate-50 opacity-50 dark:border-slate-800 dark:bg-slate-900/30"
              }`}
            >
              <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-2 dark:from-slate-900 dark:to-slate-950">
                <BearingCrossSectionSvg type={previewType} width={compact ? 120 : 130} height={compact ? 86 : 92} />
              </div>
              <div className="border-t border-slate-200/70 px-2.5 py-2 dark:border-slate-700/60">
                <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">{card.label}</p>
                {!compact ? (
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                    {card.description}
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {showCylindricalVariants ? (
        <div className="flex flex-wrap gap-1.5">
          {(["cylindrical_roller", "cylindrical_nj", "cylindrical_nup"] as BearingType[]).map((variant) => {
            if (!availableTypes.includes(variant)) return null;
            const active = value === variant;
            return (
              <button
                key={variant}
                type="button"
                onClick={() => onChange(variant)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {BEARING_TYPE_LABELS[variant]}
              </button>
            );
          })}
        </div>
      ) : null}

      {showThrustVariants ? (
        <div className="flex flex-wrap gap-1.5">
          {(
            ["thrust_ball", "thrust_cylindrical_roller", "thrust_spherical_roller"] as BearingType[]
          ).map((variant) => {
            if (!availableTypes.includes(variant)) return null;
            const active = value === variant;
            return (
              <button
                key={variant}
                type="button"
                onClick={() => onChange(variant)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {BEARING_TYPE_LABELS[variant]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
