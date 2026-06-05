import { allModules } from "@/data/modules";

export type ComputedDesignCandidate = {
  option: string;
  size: string;
  utilization: number;
  margin: number;
  status: "pass" | "review" | "fail";
  governing: string;
  detail: string;
};

export type ComputedDesignSet = {
  moduleId: string;
  title: string;
  method: string;
  assumptions: string[];
  equations: string[];
  candidates: ComputedDesignCandidate[];
  recommendation: string;
};

function statusFromUtilization(utilization: number): ComputedDesignCandidate["status"] {
  if (utilization <= 0.9) return "pass";
  if (utilization <= 1.05) return "review";
  return "fail";
}

function candidate(
  option: string,
  size: string,
  utilization: number,
  governing: string,
  detail: string
): ComputedDesignCandidate {
  return {
    option,
    size,
    utilization,
    margin: utilization > 0 ? 1 / utilization : Number.POSITIVE_INFINITY,
    status: statusFromUtilization(utilization),
    governing,
    detail,
  };
}

function selectRecommendation(candidates: ComputedDesignCandidate[]): string {
  const preferred = candidates.find((item) => item.status === "pass") ?? candidates[0];
  if (!preferred) return "No candidate generated.";
  return `${preferred.option} is the first passing candidate (${preferred.size}) with ${preferred.governing} governing.`;
}

function set(
  moduleId: string,
  title: string,
  method: string,
  assumptions: string[],
  equations: string[],
  candidates: ComputedDesignCandidate[]
): ComputedDesignSet {
  return {
    moduleId,
    title,
    method,
    assumptions,
    equations,
    candidates,
    recommendation: selectRecommendation(candidates),
  };
}

function beamCandidates(moduleId: string, title: string): ComputedDesignSet {
  const span = 3.5;
  const load = 12000;
  const moment = (load * span) / 4;
  const deflectionLimit = span / 500;
  const E = 210e9;
  const allowable = 150e6;
  const sections = [
    { name: "RHS 60x40x3", S: 7.2e-6, I: 2.3e-7, mass: 4.3 },
    { name: "RHS 80x40x4", S: 1.38e-5, I: 5.5e-7, mass: 6.8 },
    { name: "RHS 100x50x5", S: 2.55e-5, I: 1.28e-6, mass: 10.2 },
  ];
  return set(
    moduleId,
    title,
    "Section selection from bending stress and service deflection for a simply supported point-load reference case.",
    [
      `Reference span ${span} m with ${load / 1000} kN center load.`,
      "Allowable bending stress is 150 MPa and service deflection target is L/500.",
    ],
    ["M = P L / 4", "sigma = M / S", "delta = P L^3 / (48 E I)", "utilization = max(sigma/allowable, delta/(L/500))"],
    sections.map((section) => {
      const stressUtil = moment / section.S / allowable;
      const deflection = (load * Math.pow(span, 3)) / (48 * E * section.I);
      const deflectionUtil = deflection / deflectionLimit;
      const utilization = Math.max(stressUtil, deflectionUtil);
      return candidate(
        section.name,
        `${section.mass.toFixed(1)} kg/m`,
        utilization,
        stressUtil > deflectionUtil ? "bending stress" : "deflection",
        `stress ${(stressUtil * 100).toFixed(0)}%, deflection ${(deflection * 1000).toFixed(2)} mm`
      );
    })
  );
}

function shaftCandidates(moduleId: string, title: string): ComputedDesignSet {
  const torque = 420;
  const moment = 650;
  const allowable = 95e6;
  const diameters = [25, 30, 35, 40, 45];
  return set(
    moduleId,
    title,
    "Solid round shaft sizing from combined bending and torsion using maximum-distortion-energy stress.",
    [
      "Reference shaft transmits 420 N·m torque with 650 N·m peak bending moment.",
      "Allowable equivalent stress includes a conservative fatigue/service reduction.",
    ],
    ["sigma_b = 32 M / (pi d^3)", "tau_t = 16 T / (pi d^3)", "sigma_vm = sqrt(sigma_b^2 + 3 tau_t^2)"],
    diameters.map((diameterMm) => {
      const d = diameterMm / 1000;
      const sigmaB = (32 * moment) / (Math.PI * Math.pow(d, 3));
      const tau = (16 * torque) / (Math.PI * Math.pow(d, 3));
      const vm = Math.sqrt(sigmaB * sigmaB + 3 * tau * tau);
      return candidate(
        `Ø${diameterMm} shaft`,
        `${diameterMm} mm`,
        vm / allowable,
        "combined bending/torsion",
        `von Mises ${(vm / 1e6).toFixed(1)} MPa`
      );
    })
  );
}

function gearCandidates(moduleId: string, title: string): ComputedDesignSet {
  const tangentialLoad = 1800;
  const allowable = 180e6;
  const faceWidthFactor = 10;
  const modules = [2, 2.5, 3, 4];
  const toothForm = 0.32;
  return set(
    moduleId,
    title,
    "Gear module selection using Lewis bending stress screening.",
    [
      "Reference gear tooth load is 1.8 kN.",
      "Face width is assumed as 10 times module and Lewis form factor is 0.32.",
    ],
    ["b = 10m", "sigma = F_t / (b m Y)", "utilization = sigma / allowable"],
    modules.map((m) => {
      const b = faceWidthFactor * m / 1000;
      const moduleM = m / 1000;
      const stress = tangentialLoad / (b * moduleM * toothForm);
      return candidate(
        `Module ${m}`,
        `m=${m}, b=${faceWidthFactor * m} mm`,
        stress / allowable,
        "tooth bending",
        `Lewis stress ${(stress / 1e6).toFixed(0)} MPa`
      );
    })
  );
}

function bearingCandidates(moduleId: string, title: string): ComputedDesignSet {
  const equivalentLoad = 6200;
  const lifeMillionRev = 50;
  const requiredC = equivalentLoad * Math.pow(lifeMillionRev, 1 / 3);
  const bearings = [
    { name: "6206", bore: 30, C: 19500 },
    { name: "6207", bore: 35, C: 25500 },
    { name: "6307", bore: 35, C: 33500 },
  ];
  return set(
    moduleId,
    title,
    "Rolling bearing selection from ISO 281 basic rating life relation.",
    ["Reference equivalent dynamic load is 6.2 kN.", "Required life is 50 million revolutions."],
    ["L10 = (C/P)^3", "C_required = P L10^(1/3)"],
    bearings.map((bearing) =>
      candidate(
        bearing.name,
        `${bearing.bore} mm bore`,
        requiredC / bearing.C,
        "dynamic capacity",
        `C ${(bearing.C / 1000).toFixed(1)} kN vs required ${(requiredC / 1000).toFixed(1)} kN`
      )
    )
  );
}

function springCandidates(moduleId: string, title: string): ComputedDesignSet {
  const force = 450;
  const meanDiameter = 0.035;
  const coils = 8;
  const G = 79e9;
  const allowable = 520e6;
  const wires = [3.5, 4, 4.5, 5];
  return set(
    moduleId,
    title,
    "Helical spring wire selection from spring rate and shear stress.",
    ["Reference compression force is 450 N, mean coil diameter 35 mm, active coils 8.", "Allowable corrected shear stress is 520 MPa."],
    ["k = G d^4 / (8 D^3 n)", "tau = 8 F D K / (pi d^3)"],
    wires.map((wireMm) => {
      const d = wireMm / 1000;
      const C = meanDiameter / d;
      const wahl = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
      const stress = (8 * force * meanDiameter * wahl) / (Math.PI * Math.pow(d, 3));
      const rate = (G * Math.pow(d, 4)) / (8 * Math.pow(meanDiameter, 3) * coils);
      return candidate(
        `${wireMm} mm wire`,
        `k ${(rate / 1000).toFixed(1)} N/mm`,
        stress / allowable,
        "spring shear",
        `tau ${(stress / 1e6).toFixed(0)} MPa, C=${C.toFixed(1)}`
      );
    })
  );
}

function boltCandidates(moduleId: string, title: string): ComputedDesignSet {
  const shear = 18000;
  const allowable = 260e6;
  const bolts = [
    { name: "M8 class 8.8", area: 36.6 },
    { name: "M10 class 8.8", area: 58 },
    { name: "M12 class 8.8", area: 84.3 },
  ];
  return set(
    moduleId,
    title,
    "Bolt size selection from shear area and allowable shear stress.",
    ["Reference joint shear is 18 kN per bolt line.", "Allowable shear is 260 MPa."],
    ["tau = V / A_s", "utilization = tau / tau_allow"],
    bolts.map((bolt) => {
      const stress = shear / (bolt.area * 1e-6);
      return candidate(bolt.name, `${bolt.area} mm² stress area`, stress / allowable, "bolt shear", `tau ${(stress / 1e6).toFixed(0)} MPa`);
    })
  );
}

function pressureCandidates(moduleId: string, title: string): ComputedDesignSet {
  const pressure = 2.5e6;
  const radius = 0.45;
  const allowable = 138e6;
  const thicknesses = [6, 8, 10, 12];
  return set(
    moduleId,
    title,
    "Pressure wall thickness screening from thin-wall hoop stress.",
    ["Reference internal pressure is 2.5 MPa and radius is 450 mm.", "Allowable membrane stress is 138 MPa before joint/code factors."],
    ["sigma_h = P r / t", "utilization = sigma_h / allowable"],
    thicknesses.map((tMm) => {
      const stress = (pressure * radius) / (tMm / 1000);
      return candidate(`${tMm} mm wall`, `${tMm} mm`, stress / allowable, "hoop stress", `sigma_h ${(stress / 1e6).toFixed(0)} MPa`);
    })
  );
}

function thermalCandidates(moduleId: string, title: string): ComputedDesignSet {
  const heat = 850;
  const deltaT = 18;
  const options = [
    { name: "Natural finned sink", conductance: 22 },
    { name: "Forced-air heat sink", conductance: 58 },
    { name: "Liquid cold plate", conductance: 115 },
  ];
  return set(
    moduleId,
    title,
    "Thermal option selection from required conductance.",
    ["Reference heat load is 850 W with 18 K allowable temperature rise."],
    ["G_required = Q / DeltaT", "utilization = G_required / G_candidate"],
    options.map((option) => {
      const required = heat / deltaT;
      return candidate(option.name, `${option.conductance} W/K`, required / option.conductance, "thermal conductance", `required ${required.toFixed(1)} W/K`);
    })
  );
}

function advancedCandidates(moduleId: string, title: string): ComputedDesignSet {
  if (moduleId === "thermal-management" || moduleId === "cryogenic-engineering") {
    return thermalCandidates(moduleId, title);
  }
  if (moduleId === "vacuum-engineering") {
    const volume = 0.25;
    const ratio = 101325 / 0.1;
    const targetTime = 900;
    const pumps = [
      { name: "Dry scroll 20 m³/h", speed: 20 / 3600 },
      { name: "Turbopump 80 L/s", speed: 0.08 },
      { name: "Turbopump 250 L/s", speed: 0.25 },
    ];
    return set(
      moduleId,
      title,
      "Vacuum pump selection from ideal pump-down time.",
      ["Reference chamber volume is 0.25 m³, pump-down from atmosphere to 0.1 Pa.", "Target ideal pump-down time is 15 minutes."],
      ["t = (V/S) ln(P0/Pt)", "utilization = t / t_target"],
      pumps.map((pump) => {
        const time = (volume / pump.speed) * Math.log(ratio);
        return candidate(pump.name, `${(pump.speed * 1000).toFixed(0)} L/s`, time / targetTime, "pump-down time", `ideal ${(time / 60).toFixed(1)} min`);
      })
    );
  }
  if (moduleId === "magnetic-fields" || moduleId === "superconducting-systems") {
    const targetB = 0.18;
    const length = 0.25;
    const current = 20;
    const mu0 = 4 * Math.PI * 1e-7;
    const coils = [1000, 1800, 2600];
    return set(
      moduleId,
      title,
      "Coil turn selection from long-solenoid magnetic field.",
      ["Reference current is 20 A, coil length 0.25 m, target field 0.18 T."],
      ["B = mu0 N I / L", "utilization = B_target / B_candidate"],
      coils.map((turns) => {
        const B = (mu0 * turns * current) / length;
        return candidate(`${turns} turns`, `${B.toFixed(3)} T`, targetB / B, "magnetic field", `stored-energy check follows after inductance selection`);
      })
    );
  }
  if (moduleId === "battery-ev-systems") {
    const heat = 1400;
    const cp = 3600;
    const deltaT = 8;
    const flows = [0.03, 0.05, 0.08];
    return set(
      moduleId,
      title,
      "Coolant flow selection from battery pack heat generation.",
      ["Reference pack heat is 1.4 kW and allowable coolant rise is 8 K."],
      ["m_dot_required = Q / (cp DeltaT)", "utilization = m_required / m_candidate"],
      flows.map((flow) => {
        const required = heat / (cp * deltaT);
        return candidate(`${(flow * 60).toFixed(1)} kg/min loop`, `${flow.toFixed(3)} kg/s`, required / flow, "coolant flow", `required ${required.toFixed(3)} kg/s`);
      })
    );
  }
  return thermalCandidates(moduleId, title);
}

function fallbackCandidates(moduleId: string, title: string, category: string): ComputedDesignSet {
  if (category === "structural") return beamCandidates(moduleId, title);
  if (category === "machine") {
    if (moduleId.includes("gear")) return gearCandidates(moduleId, title);
    if (moduleId.includes("bearing")) return bearingCandidates(moduleId, title);
    return shaftCandidates(moduleId, title);
  }
  if (category === "springs") return springCandidates(moduleId, title);
  if (category === "fasteners") return boltCandidates(moduleId, title);
  if (category === "pressure") return pressureCandidates(moduleId, title);
  if (category === "advanced-systems") return advancedCandidates(moduleId, title);
  if (category === "power-transmission") return gearCandidates(moduleId, title);
  if (category === "materials") return pressureCandidates(moduleId, title);
  if (category === "dynamics") return thermalCandidates(moduleId, title);
  if (category === "manufacturing") return boltCandidates(moduleId, title);
  return beamCandidates(moduleId, title);
}

export function getComputedDesignSet(moduleId: string): ComputedDesignSet | undefined {
  const catalogModule = allModules.find((item) => item.id === moduleId);
  if (!catalogModule) return undefined;
  if (moduleId === "beams" || moduleId === "frames" || moduleId === "trusses" || moduleId === "plates" || moduleId === "circular-plates") {
    return beamCandidates(catalogModule.id, catalogModule.title);
  }
  if (moduleId === "shafts") return shaftCandidates(catalogModule.id, catalogModule.title);
  if (moduleId === "gears" || moduleId.includes("gear") || moduleId === "gear-ratio-design") return gearCandidates(catalogModule.id, catalogModule.title);
  if (moduleId === "bearings" || moduleId === "plain-bearings") return bearingCandidates(catalogModule.id, catalogModule.title);
  if (catalogModule.category === "springs") return springCandidates(catalogModule.id, catalogModule.title);
  if (catalogModule.category === "fasteners") return boltCandidates(catalogModule.id, catalogModule.title);
  if (catalogModule.category === "pressure") return pressureCandidates(catalogModule.id, catalogModule.title);
  if (catalogModule.category === "advanced-systems") return advancedCandidates(catalogModule.id, catalogModule.title);
  return fallbackCandidates(catalogModule.id, catalogModule.title, catalogModule.category);
}
