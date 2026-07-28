/**
 * AGMA 6001-E08 style interface load templates for US shaft worksheets.
 * Provides application / overload factors for gearing and belt drives — not a full AGMA rating.
 */

export type Agma6001DutyClass =
  | "uniform"
  | "light_shock"
  | "moderate_shock"
  | "heavy_shock";

export type Agma6001InterfaceKind =
  | "spur_gear"
  | "helical_gear"
  | "bevel_gear"
  | "worm_gear"
  | "v_belt"
  | "chain"
  | "coupling";

export type Agma6001LoadTemplate = {
  kind: Agma6001InterfaceKind;
  duty: Agma6001DutyClass;
  /** Application / service factor applied to nominal torque */
  Ka: number;
  /** Occasional overload factor on peak torque */
  Kol: number;
  /** Typical face-load / misalignment allowance on bending */
  Km: number;
  notes: string;
};

const DUTY_KA: Record<Agma6001DutyClass, number> = {
  uniform: 1.0,
  light_shock: 1.25,
  moderate_shock: 1.5,
  heavy_shock: 1.75,
};

const DUTY_KOL: Record<Agma6001DutyClass, number> = {
  uniform: 1.5,
  light_shock: 1.75,
  moderate_shock: 2.0,
  heavy_shock: 2.5,
};

const KIND_KM: Record<Agma6001InterfaceKind, number> = {
  spur_gear: 1.3,
  helical_gear: 1.2,
  bevel_gear: 1.35,
  worm_gear: 1.4,
  v_belt: 1.1,
  chain: 1.15,
  coupling: 1.05,
};

export function agma6001LoadTemplate(
  kind: Agma6001InterfaceKind,
  duty: Agma6001DutyClass = "light_shock"
): Agma6001LoadTemplate {
  return {
    kind,
    duty,
    Ka: DUTY_KA[duty],
    Kol: DUTY_KOL[duty],
    Km: KIND_KM[kind],
    notes:
      "AGMA 6001-E08 oriented interface load template for shaft screening — verify with AGMA gear rating modules for tooth strength.",
  };
}

export function applyAgma6001ToLoads(params: {
  torque_Nm: number;
  bendingMoment_Nm: number;
  template: Agma6001LoadTemplate;
}): { designTorque_Nm: number; designBending_Nm: number; peakTorque_Nm: number } {
  const { template: t } = params;
  return {
    designTorque_Nm: params.torque_Nm * t.Ka,
    designBending_Nm: params.bendingMoment_Nm * t.Ka * t.Km,
    peakTorque_Nm: params.torque_Nm * t.Kol,
  };
}
