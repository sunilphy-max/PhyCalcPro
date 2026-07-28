/**
 * DIN 743 catalog shared types (Parts 2 & 3 screening data).
 */

export type Din743HeatTreatment =
  | "normalized"
  | "quenched_tempered"
  | "case_hardened"
  | "nitrided"
  | "induction_hardened";

export type Din743MaterialClass =
  | "structural"
  | "heat_treatable"
  | "case_hardening"
  | "nitriding"
  | "stainless";

export type Din743NotchKind =
  | "plain"
  | "shoulder_fillet"
  | "u_groove"
  | "retaining_ring_groove"
  | "keyway_sled"
  | "keyway_end_milled"
  | "spline"
  | "press_fit"
  | "custom";

export type Din743SurfaceProcess =
  | "none"
  | "rolled"
  | "shot_peened"
  | "nitrided_surface"
  | "induction_surface";
