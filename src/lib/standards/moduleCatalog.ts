import type { DesignCodeId, ModuleStandardProfile } from "./types";
import {
  beamChecks,
  compressionSpringChecks,
  extensionSpringChecks,
  torsionSpringChecks,
  gearChecks,
  genericIndicativeCheck,
  keysSplinesChecks,
  timingBeltChecks,
  vBeltChecks,
  checkDef,
} from "./checkTemplates";

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
    standardsByCode: {
      INDICATIVE: [
        { body: "Mechanics", document: "Roark / Euler-Bernoulli beam theory" },
      ],
      US: [
        { body: "ASME", document: "BTH-1", note: "Below-hook and lifting beam context" },
        { body: "ASME", document: "B30.20", note: "Below-hook device safety context" },
      ],
      EU: [
        { body: "EN", document: "13001", note: "Crane and industrial equipment structures" },
        { body: "FKM", document: "Analytical Strength Assessment", note: "Machine component strength context" },
      ],
      ISO: [
        { body: "ISO", document: "8686", note: "Cranes - design principles for loads" },
        { body: "ISO", document: "12100", note: "Machinery safety context" },
      ],
    },
    limitations: [
      "1D beam model for mechanical and industrial structures; not a building-code design check.",
      "Application presets adjust load factor, allowable stress target, and deflection target but do not implement full standard clauses.",
      "LTB uses simplified unbraced length = span unless overridden.",
      "Shear check uses rectangular-web estimate from I and c.",
    ],
  }),
  frames: withCodeChecks("frames", "Frame Analysis", [
    genericIndicativeCheck("member_stress", "Member stress utilization", "utilization"),
    genericIndicativeCheck("joint_reaction", "Joint reaction equilibrium", "other"),
  ]),
  trusses: withCodeChecks("trusses", "Truss Analysis", [
    genericIndicativeCheck("axial_utilization", "Member axial utilization", "utilization"),
  ]),
  columns: withCodeChecks(
    "columns",
    "Column Buckling",
    [
      checkDef(
        "buckling_utilization",
        "Buckling utilization",
        "utilization",
        {
          INDICATIVE: { body: "Mechanics", document: "Euler buckling" },
          US: { body: "AISC", document: "360-22", clause: "Ch. E" },
          EU: { body: "EN", document: "1993-1-1", clause: "Buckling" },
          ISO: { body: "ISO", document: "10721", note: "Steel compression members" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
      checkDef(
        "euler_critical",
        "Euler critical load check",
        "safety_factor",
        {
          INDICATIVE: { body: "Mechanics", document: "Pcr / P" },
          US: { body: "AISC", document: "360-22", clause: "Ch. E" },
          EU: { body: "EN", document: "1993-1-1", clause: "Buckling" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
    ],
    {
      validationStatus: "beta",
      standardsByCode: {
        US: [{ body: "AISC", document: "360-22", clause: "Ch. E" }],
        EU: [{ body: "EN", document: "1993-1-1", clause: "Buckling" }],
      },
    }
  ),
  plates: withCodeChecks("plates", "Plate Bending", [
    genericIndicativeCheck("bending_stress", "Plate bending stress", "stress"),
    genericIndicativeCheck("deflection", "Plate deflection", "deflection"),
  ]),
  "combined-loading": withCodeChecks(
    "combined-loading",
    "Combined Loading",
    [
      checkDef(
        "von_mises",
        "Equivalent (von Mises) stress check",
        "utilization",
        {
          INDICATIVE: { body: "Mechanics", document: "Von Mises combined stress" },
          US: { body: "AISC", document: "360-22", clause: "Ch. H" },
          EU: { body: "EN", document: "1993-1-1", clause: "Cl. 6.2" },
          ISO: { body: "ISO", document: "10828", note: "Equivalent stress" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
    ],
    { validationStatus: "beta" }
  ),
  "load-case-manager": withCodeChecks("load-case-manager", "Load Case Manager", [
    genericIndicativeCheck("envelope_stress", "Envelope stress utilization", "utilization"),
  ]),
  shafts: withCodeChecks("shafts", "Shaft Design", [
    genericIndicativeCheck("von_mises", "Combined stress utilization", "utilization"),
    genericIndicativeCheck("deflection", "Shaft deflection", "deflection"),
    genericIndicativeCheck("critical_speed", "Critical speed margin", "safety_factor"),
    genericIndicativeCheck("fatigue", "Fatigue safety (Goodman)", "safety_factor"),
  ], {
    standardsByCode: {
      US: [{ body: "AGMA", document: "6001", note: "Interface loads" }],
      EU: [{ body: "DIN", document: "743", note: "Shaft fatigue" }],
    },
  }),
  gears: withCodeChecks("gears", "Gear Design", gearChecks, {
    validationStatus: "beta",
    indicativeMethod: "Lewis bending and simplified Hertzian contact (indicative)",
    limitations: [
      "Indicative scuffing and bending fatigue screening added; full AGMA/ISO factors not included.",
    ],
  }),
  bearings: withCodeChecks("bearings", "Bearing Selection", [
    genericIndicativeCheck("dynamic_capacity", "Dynamic load rating utilization", "utilization"),
    genericIndicativeCheck("life_l10", "Basic rating life L10", "life"),
    genericIndicativeCheck("static_capacity", "Static load rating C₀/P₀", "safety_factor"),
    genericIndicativeCheck("speed_limit", "Limiting speed margin", "safety_factor"),
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
  welds: withCodeChecks(
    "welds",
    "Weld Group Analysis",
    [
      checkDef(
        "throat_shear",
        "Throat shear utilization",
        "utilization",
        {
          INDICATIVE: { body: "Mechanics", document: "Throat shear" },
          US: { body: "AWS", document: "D1.1" },
          EU: { body: "EN", document: "1993-1-8" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
      checkDef(
        "throat_combined",
        "Combined throat stress",
        "utilization",
        {
          INDICATIVE: { body: "Mechanics", document: "Resultant throat stress" },
          US: { body: "AWS", document: "D1.1" },
          EU: { body: "EN", document: "1993-1-8" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
      checkDef(
        "throat_eccentric",
        "Eccentric weld group moment",
        "utilization",
        {
          INDICATIVE: { body: "Mechanics", document: "Polar moment weld group" },
          US: { body: "AWS", document: "D1.1", clause: "Eccentric loading" },
          EU: { body: "EN", document: "1993-1-8", clause: "Eccentric welds" },
        },
        { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
      ),
    ],
    {
      validationStatus: "beta",
      standardsByCode: {
        US: [{ body: "AWS", document: "D1.1" }],
        EU: [{ body: "EN", document: "1993-1-8" }],
      },
    }
  ),
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
    checkDef(
      "sustained_stress",
      "Sustained stress utilization",
      "utilization",
      {
        INDICATIVE: { body: "Mechanics", document: "Thin-wall pipe" },
        US: { body: "ASME", document: "B31.3", clause: "302.3 sustained" },
      },
      { INDICATIVE: "implemented", US: "implemented" }
    ),
    checkDef(
      "occasional_stress",
      "Occasional stress utilization",
      "utilization",
      {
        US: { body: "ASME", document: "B31.3", clause: "302.3.6 occasional" },
      },
      { US: "implemented", INDICATIVE: "implemented" }
    ),
    checkDef(
      "peak_stress",
      "Peak stress utilization",
      "utilization",
      {
        US: { body: "ASME", document: "B31.3", clause: "Peak / upset" },
      },
      { US: "implemented", INDICATIVE: "implemented" }
    ),
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
  "vacuum-engineering": withCodeChecks("vacuum-engineering", "Vacuum Engineering", [
    genericIndicativeCheck("pump_down", "Ideal pump-down time", "other"),
    genericIndicativeCheck("conductance", "Vacuum line conductance", "other"),
    genericIndicativeCheck("vacuum_force", "Vacuum force screening", "other"),
  ], {
    indicativeMethod: "Ideal gas pump-down and molecular-flow conductance screening",
    standardsByCode: {
      ISO: [{ body: "ISO", document: "21360", note: "Vacuum pump performance context" }],
      INDICATIVE: [
        { body: "AVS", document: "Vacuum practice", note: "Pump-down and conductance screening" },
        { body: "ASTM", document: "E595", note: "Outgassing context" },
      ],
    },
    limitations: [
      "Uses constant effective pumping speed and ideal gas behavior.",
      "Does not model viscous-to-molecular transition, outgassing history, conductance networks, or leak testing procedures.",
    ],
  }),
  "cryogenic-engineering": withCodeChecks("cryogenic-engineering", "Cryogenic Engineering", [
    genericIndicativeCheck("heat_leak", "Conductive/radiative heat leak", "other"),
    genericIndicativeCheck("boiloff", "Equivalent boil-off rate", "other"),
    genericIndicativeCheck("cooldown", "Cooldown energy and time", "other"),
  ], {
    indicativeMethod: "Lumped conduction, radiation and cooldown energy screening",
    standardsByCode: {
      INDICATIVE: [
        { body: "CGA", document: "Cryogenic guidance", note: "Cryogenic handling context" },
        { body: "NASA", document: "Cryogenic practice", note: "Thermal screening context" },
      ],
    },
    limitations: [
      "Uses effective material properties and lumped heat paths.",
      "Does not include detailed MLI layer models, transient thermal gradients, embrittlement, or pressure-relief sizing.",
    ],
  }),
  "magnetic-fields": withCodeChecks("magnetic-fields", "Magnetic Fields & Coils", [
    genericIndicativeCheck("magnetic_field", "Solenoid magnetic field", "other"),
    genericIndicativeCheck("stored_energy", "Stored magnetic energy", "other"),
    genericIndicativeCheck("coil_heating", "Coil resistive heating", "other"),
  ], {
    indicativeMethod: "Long-solenoid field, inductance and Lorentz-force screening",
    standardsByCode: {
      INDICATIVE: [
        { body: "IEC", document: "Electrical equipment practice", note: "Coil equipment context" },
        { body: "MMPDS", document: "Material allowables", note: "Support structure context" },
      ],
    },
    limitations: [
      "Long-solenoid approximation; fringe fields and magnetic saturation are not modeled.",
      "Does not solve coupled thermal-electromagnetic or structural support behavior.",
    ],
  }),
  "superconducting-systems": withCodeChecks("superconducting-systems", "Superconducting Systems", [
    genericIndicativeCheck("current_margin", "Current margin", "safety_factor"),
    genericIndicativeCheck("temperature_margin", "Temperature margin", "safety_factor"),
    genericIndicativeCheck("stored_energy", "Stored energy and discharge", "other"),
  ], {
    indicativeMethod: "Superconducting magnet operating margin and L/R dump screening",
    standardsByCode: {
      INDICATIVE: [
        { body: "IEC", document: "Superconductivity terminology", note: "Operating margin context" },
        { body: "Cryogenic magnet practice", document: "Quench protection screening" },
      ],
    },
    limitations: [
      "Does not model conductor critical surfaces, quench propagation, insulation voltage stress, or cryogenic transients.",
    ],
  }),
  "thermal-management": withCodeChecks("thermal-management", "Thermal Management", [
    genericIndicativeCheck("heat_transfer", "Heat-transfer capacity", "other"),
    genericIndicativeCheck("thermal_resistance", "Thermal resistance", "other"),
    genericIndicativeCheck("coolant_rise", "Coolant temperature rise", "other"),
  ], {
    indicativeMethod: "Parallel conduction, convection and radiation heat-transfer screening",
    standardsByCode: {
      INDICATIVE: [
        { body: "JEDEC", document: "Thermal practice", note: "Electronics thermal context" },
        { body: "ASHRAE", document: "Heat transfer data" },
      ],
    },
    limitations: [
      "Lumped steady-state model; CFD, spreading resistance, two-phase flow and contact resistance are not included.",
    ],
  }),
  "battery-ev-systems": withCodeChecks("battery-ev-systems", "Battery & EV Systems", [
    genericIndicativeCheck("pack_energy", "Nominal pack energy", "other"),
    genericIndicativeCheck("heat_generation", "Ohmic heat generation", "other"),
    genericIndicativeCheck("vent_area", "Simple vent area", "other"),
  ], {
    indicativeMethod: "Battery pack electrical, thermal and vent screening",
    standardsByCode: {
      ISO: [{ body: "ISO", document: "6469", note: "Electric road vehicle safety context" }],
      INDICATIVE: [
        { body: "UL", document: "2580", note: "Battery safety context" },
        { body: "SAE", document: "J2464", note: "Abuse testing context" },
      ],
    },
    limitations: [
      "Does not model BMS behavior, cell maps, propagation, enclosure rupture, or regulatory abuse-test compliance.",
    ],
  }),
  "hydrogen-systems": withCodeChecks("hydrogen-systems", "Hydrogen Systems", [
    genericIndicativeCheck("stored_mass", "Stored hydrogen mass", "other"),
    genericIndicativeCheck("hoop_stress", "Thin-wall hoop stress", "stress"),
    genericIndicativeCheck("leak_flow", "Leak/vent flow screening", "other"),
  ], {
    indicativeMethod: "Ideal gas storage, thin-wall stress and incompressible orifice screening",
    standardsByCode: {
      ISO: [{ body: "ISO", document: "19880", note: "Hydrogen fueling context" }],
      US: [
        { body: "ASME", document: "B31.12", note: "Hydrogen piping context" },
        { body: "NFPA", document: "2", note: "Hydrogen technologies code context" },
      ],
    },
    limitations: [
      "High-pressure hydrogen may require real-gas compressibility, material compatibility and code vessel checks.",
      "Leak flow is a first-pass screen and not a relief-device sizing calculation.",
    ],
  }),
  "precision-motion": withCodeChecks("precision-motion", "Precision Motion & Vibration", [
    genericIndicativeCheck("stiffness", "Flexure stiffness", "other"),
    genericIndicativeCheck("natural_frequency", "Natural frequency", "other"),
    genericIndicativeCheck("transmissibility", "Isolation transmissibility", "other"),
  ], {
    indicativeMethod: "Cantilever flexure and single-degree-of-freedom vibration screening",
    standardsByCode: {
      ISO: [
        { body: "ISO", document: "230", note: "Machine tool accuracy context" },
        { body: "ISO", document: "20816", note: "Vibration context" },
      ],
    },
    limitations: [
      "Uses simple beam/flexure approximations; multi-axis flexures, controls, bearings and nonlinear motion errors are not included.",
    ],
  }),
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
  "v-belts": withCodeChecks("v-belts", "V-Belt Drive", vBeltChecks),
  "timing-belts": withCodeChecks("timing-belts", "Timing Belt Drive", timingBeltChecks),
  "roller-chains": withCodeChecks("roller-chains", "Roller Chain Drive", [
    genericIndicativeCheck("power_capacity", "Power capacity utilization", "utilization"),
    genericIndicativeCheck("chain_life", "Estimated chain life", "life"),
  ]),
  "multi-pulley": withCodeChecks("multi-pulley", "Multi-Pulley Layout", [
    genericIndicativeCheck("belt_length", "Total belt length", "other"),
    genericIndicativeCheck("wrap_angle", "Minimum wrap angle", "other"),
  ]),
  "bevel-gears": withCodeChecks("bevel-gears", "Bevel Gear Screening", gearChecks),
  "worm-gears": withCodeChecks("worm-gears", "Worm Gear Drive", [
    genericIndicativeCheck("efficiency", "Drive efficiency", "other"),
    genericIndicativeCheck("contact_stress", "Contact stress utilization", "utilization"),
  ]),
  "planetary-gears": withCodeChecks("planetary-gears", "Planetary Gear Set", [
    genericIndicativeCheck("ratio", "Actual ratio vs target", "other"),
  ]),
  "gear-ratio-design": withCodeChecks("gear-ratio-design", "Gear Ratio Design", [
    genericIndicativeCheck("ratio_error", "Ratio error", "other"),
  ]),
  "compression-springs": withCodeChecks("compression-springs", "Compression Springs", compressionSpringChecks),
  "extension-springs": withCodeChecks("extension-springs", "Extension Springs", extensionSpringChecks),
  "torsion-springs": withCodeChecks("torsion-springs", "Torsion Springs", torsionSpringChecks),
  "keys-splines": withCodeChecks("keys-splines", "Keys & Splines", keysSplinesChecks, {
    standardsByCode: { ISO: [{ body: "ISO", document: "3912" }] },
  }),
  "shaft-hubs": withCodeChecks("shaft-hubs", "Shaft Hub Fits", [
    genericIndicativeCheck("contact_pressure", "Contact pressure", "stress"),
    genericIndicativeCheck("torque_capacity", "Friction torque capacity", "utilization"),
  ]),
  "pins": withCodeChecks("pins", "Pin & Clevis", [
    genericIndicativeCheck("shear", "Pin shear safety", "safety_factor"),
    genericIndicativeCheck("bearing", "Pin bearing safety", "safety_factor"),
  ]),
  "brakes-clutches": withCodeChecks("brakes-clutches", "Brakes & Clutches", [
    genericIndicativeCheck("friction_torque", "Friction torque capacity", "utilization"),
    genericIndicativeCheck("energy", "Energy per stop", "other"),
  ]),
  "plain-bearings": withCodeChecks("plain-bearings", "Plain Bearings", [
    genericIndicativeCheck("sommerfeld", "Sommerfeld number screening", "other"),
    genericIndicativeCheck("film_thickness", "Minimum film thickness", "other"),
  ]),
  "circular-plates": withCodeChecks("circular-plates", "Circular Plates", [
    genericIndicativeCheck("deflection", "Plate deflection", "deflection"),
    genericIndicativeCheck("stress", "Plate bending stress", "stress"),
  ]),
  "rolled-sections": withCodeChecks("rolled-sections", "Rolled Sections", [
    genericIndicativeCheck("area", "Section area lookup", "other"),
    genericIndicativeCheck("inertia", "Section inertia lookup", "other"),
  ]),
  "formula-reference": withCodeChecks("formula-reference", "Engineering Formulas", [
    genericIndicativeCheck("formula_eval", "Formula evaluation", "other"),
  ]),
  "unit-converter": withCodeChecks("unit-converter", "Unit Converter", [
    genericIndicativeCheck("conversion", "Unit conversion", "other"),
  ]),
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
