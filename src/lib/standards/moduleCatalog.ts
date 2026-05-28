import type { DesignCodeId, ModuleStandardProfile } from "./types";
import { beamChecks, gearChecks, genericIndicativeCheck } from "./checkTemplates";

function profile(
  moduleId: string,
  title: string,
  checks: ModuleStandardProfile["checks"],
  extra?: Partial<ModuleStandardProfile>
): ModuleStandardProfile {
  return {
    moduleId,
    title,
    indicativeMethod: extra?.indicativeMethod ?? "Indicative closed-form or numerical model",
    checks,
    standardsByCode: extra?.standardsByCode ?? {},
    assumptions: extra?.assumptions ?? [
      "Linear elastic material behavior unless noted otherwise.",
      "User is responsible for load combinations and load factors per the selected design code.",
    ],
    limitations: extra?.limitations ?? [
      "Does not replace a licensed professional engineer or official code compliance review.",
    ],
    validationStatus: extra?.validationStatus ?? "indicative",
  };
}

const withCodeChecks = (
  moduleId: string,
  title: string,
  checks: ModuleStandardProfile["checks"],
  extra?: Partial<ModuleStandardProfile>
) => profile(moduleId, title, checks, extra);

/** Catalog for all product modules (including profiles route). */
export const moduleStandardCatalog: Record<string, ModuleStandardProfile> = {
  beams: withCodeChecks("beams", "Beam Analysis", beamChecks, {
    validationStatus: "beta",
    limitations: ["2D beam model; no lateral-torsional buckling in indicative mode."],
  }),
  frames: withCodeChecks("frames", "Frame Analysis", [
    genericIndicativeCheck("member_stress", "Member stress utilization", "utilization"),
    genericIndicativeCheck("joint_reaction", "Joint reaction equilibrium", "other"),
  ]),
  trusses: withCodeChecks("trusses", "Truss Analysis", [
    genericIndicativeCheck("axial_utilization", "Member axial utilization", "utilization"),
  ]),
  columns: withCodeChecks("columns", "Column Buckling", [
    genericIndicativeCheck("buckling_utilization", "Buckling utilization", "utilization"),
    genericIndicativeCheck("euler_critical", "Euler critical load check", "safety_factor"),
  ], {
    standardsByCode: {
      US: [{ body: "AISC", document: "360-22", clause: "Ch. E" }],
      EU: [{ body: "EN", document: "1993-1-1", clause: "Buckling" }],
    },
  }),
  plates: withCodeChecks("plates", "Plate Bending", [
    genericIndicativeCheck("bending_stress", "Plate bending stress", "stress"),
    genericIndicativeCheck("deflection", "Plate deflection", "deflection"),
  ]),
  "combined-loading": withCodeChecks("combined-loading", "Combined Loading", [
    genericIndicativeCheck("von_mises", "Equivalent (von Mises) stress check", "utilization"),
  ]),
  "load-case-manager": withCodeChecks("load-case-manager", "Load Case Manager", [
    genericIndicativeCheck("envelope_stress", "Envelope stress utilization", "utilization"),
  ]),
  shafts: withCodeChecks("shafts", "Shaft Design", [
    genericIndicativeCheck("von_mises", "Combined stress utilization", "utilization"),
    genericIndicativeCheck("deflection", "Shaft deflection", "deflection"),
    genericIndicativeCheck("critical_speed", "Critical speed margin", "safety_factor"),
  ], {
    standardsByCode: {
      US: [{ body: "AGMA", document: "6001", note: "Interface loads" }],
      EU: [{ body: "DIN", document: "743", note: "Shaft fatigue" }],
    },
  }),
  gears: withCodeChecks("gears", "Gear Design", gearChecks, {
    validationStatus: "beta",
    indicativeMethod: "Lewis bending and simplified Hertzian contact (indicative)",
  }),
  bearings: withCodeChecks("bearings", "Bearing Selection", [
    genericIndicativeCheck("dynamic_capacity", "Dynamic load rating utilization", "utilization"),
    genericIndicativeCheck("life_l10", "Basic rating life L10", "life"),
  ], {
    standardsByCode: { ISO: [{ body: "ISO", document: "281", clause: "Rating life" }] },
  }),
  cams: withCodeChecks("cams", "Cam Design", [
    genericIndicativeCheck("pressure_angle", "Pressure angle limit", "other"),
    genericIndicativeCheck("contact_stress", "Cam contact stress", "stress"),
  ]),
  flywheels: withCodeChecks("flywheels", "Flywheel Design", [
    genericIndicativeCheck("stress", "Rim stress utilization", "utilization"),
    genericIndicativeCheck("energy_storage", "Energy storage capacity", "other"),
  ]),
  bolts: withCodeChecks("bolts", "Bolt Calculator", [
    genericIndicativeCheck("tensile", "Tensile utilization", "utilization"),
    genericIndicativeCheck("shear", "Shear utilization", "utilization"),
    genericIndicativeCheck("bearing", "Bearing on threads", "utilization"),
  ], {
    standardsByCode: {
      US: [{ body: "AISC", document: "360-22", clause: "J3" }],
      EU: [
        { body: "EN", document: "1993-1-8" },
        { body: "VDI", document: "2230", note: "High-fidelity bolted joints" },
      ],
    },
  }),
  welds: withCodeChecks("welds", "Weld Group Analysis", [
    genericIndicativeCheck("throat_shear", "Throat shear utilization", "utilization"),
    genericIndicativeCheck("throat_combined", "Combined throat stress", "utilization"),
  ], {
    standardsByCode: {
      US: [{ body: "AWS", document: "D1.1" }],
      EU: [{ body: "EN", document: "1993-1-8" }],
    },
  }),
  rivets: withCodeChecks("rivets", "Rivet Analysis", [
    genericIndicativeCheck("shear", "Shear safety factor", "safety_factor"),
    genericIndicativeCheck("bearing", "Bearing safety factor", "safety_factor"),
  ]),
  "safety-factor": withCodeChecks("safety-factor", "Safety Factor", [
    genericIndicativeCheck("von_mises_yield", "Yield safety factor", "safety_factor"),
    genericIndicativeCheck("von_mises_ultimate", "Ultimate safety factor", "safety_factor"),
  ]),
  "material-db": withCodeChecks("material-db", "Material Database", [
    genericIndicativeCheck("property_lookup", "Property reference lookup", "other"),
  ]),
  sections: withCodeChecks("sections", "Section Properties", [
    genericIndicativeCheck("area", "Cross-sectional area", "other"),
    genericIndicativeCheck("inertia", "Second moment of area", "other"),
  ]),
  composites: withCodeChecks("composites", "Composite Materials", [
    genericIndicativeCheck("modulus", "Effective modulus", "other"),
    genericIndicativeCheck("strength", "Strength utilization", "utilization"),
  ]),
  "temperature-properties": withCodeChecks("temperature-properties", "Temperature Properties", [
    genericIndicativeCheck("strength_derating", "Strength derating factor", "utilization"),
  ]),
  fatigue: withCodeChecks("fatigue", "Fatigue Assessment", [
    genericIndicativeCheck("goodman", "Modified Goodman utilization", "utilization"),
    genericIndicativeCheck("life_cycles", "Estimated fatigue life", "life"),
  ], {
    standardsByCode: {
      ISO: [{ body: "ISO", document: "12107" }],
      US: [{ body: "ASME", document: "VIII-2", note: "Fatigue screening" }],
    },
  }),
  corrosion: withCodeChecks("corrosion", "Corrosion Allowance", [
    genericIndicativeCheck("remaining_life", "Remaining life margin", "safety_factor"),
    genericIndicativeCheck("thickness", "Required thickness margin", "utilization"),
  ]),
  pipes: withCodeChecks("pipes", "Pipe Stress Analysis", [
    genericIndicativeCheck("hoop", "Hoop stress utilization", "utilization"),
    genericIndicativeCheck("longitudinal", "Longitudinal stress utilization", "utilization"),
  ], {
    standardsByCode: { US: [{ body: "ASME", document: "B31.3" }] },
  }),
  vessels: withCodeChecks("vessels", "Pressure Vessels", [
    genericIndicativeCheck("hoop", "Hoop stress utilization", "utilization"),
    genericIndicativeCheck("required_thickness", "Required thickness margin", "utilization"),
  ], {
    standardsByCode: {
      US: [{ body: "ASME", document: "VIII-1", clause: "UG-27" }],
      EU: [{ body: "EN", document: "13445" }],
    },
  }),
  hydraulics: withCodeChecks("hydraulics", "Hydraulic Cylinders", [
    genericIndicativeCheck("pressure", "Pressure utilization", "utilization"),
    genericIndicativeCheck("rod_stress", "Rod stress utilization", "utilization"),
  ]),
  "heat-exchangers": withCodeChecks("heat-exchangers", "Heat Exchangers", [
    genericIndicativeCheck("duty", "Thermal duty balance", "other"),
    genericIndicativeCheck("effectiveness", "Effectiveness", "other"),
  ]),
  vibrations: withCodeChecks("vibrations", "Vibration Analysis", [
    genericIndicativeCheck("natural_frequency", "Natural frequency", "other"),
    genericIndicativeCheck("separation_margin", "Excitation separation margin", "safety_factor"),
  ], {
    standardsByCode: { ISO: [{ body: "ISO", document: "10816", note: "Severity zones" }] },
  }),
  rotation: withCodeChecks("rotation", "Rotational Systems", [
    genericIndicativeCheck("torque", "Torque capacity", "utilization"),
  ]),
  impact: withCodeChecks("impact", "Impact & Shock", [
    genericIndicativeCheck("dynamic_factor", "Dynamic load factor", "safety_factor"),
  ]),
  suspension: withCodeChecks("suspension", "Suspension & Sway", [
    genericIndicativeCheck("natural_frequency", "Ride frequency", "other"),
    genericIndicativeCheck("damping", "Damping ratio", "other"),
  ]),
  tolerance: withCodeChecks("tolerance", "Tolerance Stackup", [
    genericIndicativeCheck("stack_worst_case", "Worst-case stack", "other"),
    genericIndicativeCheck("stack_rss", "RSS stack", "other"),
  ], {
    standardsByCode: {
      ISO: [{ body: "ISO", document: "286" }],
      US: [{ body: "ASME", document: "Y14.5" }],
    },
  }),
  fits: withCodeChecks("fits", "Fits & Clearances", [
    genericIndicativeCheck("clearance", "Clearance / interference", "other"),
  ], {
    standardsByCode: { ISO: [{ body: "ISO", document: "286-1" }] },
  }),
  "cost-estimator": withCodeChecks("cost-estimator", "Cost Estimation", [
    genericIndicativeCheck("cost_index", "Relative cost index", "other"),
  ], { validationStatus: "draft" }),
  "cam-toolpaths": withCodeChecks("cam-toolpaths", "CAM Toolpaths", [
    genericIndicativeCheck("path_length", "Toolpath length", "other"),
  ], { validationStatus: "draft" }),
  profiles: withCodeChecks("profiles", "Area Properties", [
    genericIndicativeCheck("area", "Section area", "other"),
    genericIndicativeCheck("inertia", "Principal inertia", "other"),
  ]),
};

export function getModuleStandardProfile(moduleId: string): ModuleStandardProfile | undefined {
  return moduleStandardCatalog[moduleId];
}

export function getChecksForDesignCode(
  moduleId: string,
  designCode: DesignCodeId
) {
  const mod = getModuleStandardProfile(moduleId);
  if (!mod) return [];

  return mod.checks.filter((check) => {
    if (designCode === "INDICATIVE") {
      return Boolean(check.standardRef.INDICATIVE || check.implementation.INDICATIVE);
    }
    return Boolean(check.standardRef[designCode] || check.implementation[designCode]);
  });
}

export function isCheckImplemented(
  check: ModuleStandardProfile["checks"][number],
  designCode: DesignCodeId
): boolean {
  return check.implementation[designCode] === "implemented";
}
