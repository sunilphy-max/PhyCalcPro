import type { BearingApplicationProfile, CatalogBearingType, BearingMountingRole } from "./types";

export type ApplicationProfileMeta = {
  label: string;
  description: string;
  suggestedTypes: CatalogBearingType[];
  suggestedMountingRoles?: BearingMountingRole[];
};

export const APPLICATION_PROFILE_META: Record<BearingApplicationProfile, ApplicationProfileMeta> = {
  general_radial: {
    label: "General radial support",
    description: "Primary radial load, minimal axial — shaft support, idlers, fans",
    suggestedTypes: ["deep_groove", "cylindrical_roller", "needle_roller"],
    suggestedMountingRoles: ["non_locating", "either"],
  },
  combined_loads: {
    label: "Combined radial + axial",
    description: "Significant Fa/Fr — gear shafts, screw supports, pulleys",
    suggestedTypes: ["angular_contact", "tapered_roller", "cylindrical_nj", "cylindrical_nup"],
    suggestedMountingRoles: ["locating"],
  },
  heavy_shock: {
    label: "Heavy load / shock / misalignment",
    description: "Mining, crushers, paper machines — misalignment tolerance needed",
    suggestedTypes: [
      "spherical_roller",
      "toroidal_roller",
      "tapered_roller",
      "self_aligning_ball",
      "cylindrical_nup",
    ],
  },
  high_speed: {
    label: "High speed",
    description: "Spindles, motors — prioritize reference speed and open/shielded types",
    suggestedTypes: ["deep_groove", "angular_contact"],
    suggestedMountingRoles: ["either"],
  },
  space_limited: {
    label: "Space limited",
    description: "Compact envelopes — drawn-cup needle, thin-section ball",
    suggestedTypes: ["needle_roller", "deep_groove"],
  },
  pure_thrust: {
    label: "Pure thrust / axial locate",
    description: "Vertical shafts, screw thrust — axial load governs",
    suggestedTypes: ["thrust_ball", "thrust_cylindrical_roller", "thrust_spherical_roller"],
    suggestedMountingRoles: ["locating"],
  },
  locating_bearing: {
    label: "Locating bearing (fixed)",
    description: "Resists axial displacement — paired angular, tapered, NJ/NUP",
    suggestedTypes: ["angular_contact", "tapered_roller", "cylindrical_nup", "cylindrical_nj"],
    suggestedMountingRoles: ["locating"],
  },
  floating_bearing: {
    label: "Floating bearing (free axial)",
    description: "Allows thermal expansion — deep groove, NU cylindrical, or CARB toroidal",
    suggestedTypes: ["deep_groove", "cylindrical_roller", "toroidal_roller", "needle_roller"],
    suggestedMountingRoles: ["non_locating"],
  },
};
