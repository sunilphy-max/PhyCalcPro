import { describe, expect, it } from "vitest";
import { technologicalSizeFactorK1, geometricalSizeFactorK2 } from "./sizeFactors";
import { overallInfluenceFactor, runDin743Worksheet } from "./worksheet";
import { resolveDin743NotchFactors } from "./notchFactors";
import { alphaShoulderFillet } from "@/data/catalogs/din743/notchAlpha";
import { findDin743Material } from "@/data/catalogs/din743/materials";
import { solveShaftEngine } from "../engine";

describe("DIN 743 size factors", () => {
  it("K1 is 1 for small QT diameters and decreases for large shafts", () => {
    expect(technologicalSizeFactorK1(10, "quenched_tempered")).toBe(1);
    expect(technologicalSizeFactorK1(100, "quenched_tempered")).toBeLessThan(1);
    expect(technologicalSizeFactorK1(100, "quenched_tempered")).toBeGreaterThan(0.67);
  });

  it("K2 bending decreases with diameter", () => {
    expect(geometricalSizeFactorK2(10, "bending")).toBeGreaterThan(geometricalSizeFactorK2(100, "bending"));
    expect(geometricalSizeFactorK2(50, "axial")).toBe(1);
  });
});

describe("DIN 743-2 notch catalogs", () => {
  it("shoulder fillet α increases for sharper fillets", () => {
    const sharp = alphaShoulderFillet(0.06, 0.05, 0.001);
    const mild = alphaShoulderFillet(0.06, 0.05, 0.005);
    expect(sharp.alphaBending).toBeGreaterThan(mild.alphaBending);
  });

  it("converts α to β < α via support number", () => {
    const notch = resolveDin743NotchFactors({
      kind: "shoulder_fillet",
      d_m: 0.05,
      D_m: 0.06,
      r_m: 0.002,
      sigmaB_MPa: 700,
    });
    expect(notch.betaBending).toBeGreaterThan(1);
    expect(notch.betaBending).toBeLessThanOrEqual(notch.alphaBending + 1e-9);
  });
});

describe("DIN 743-1 worksheet", () => {
  it("evaluates multi-station safety for C45E shaft", () => {
    const mat = findDin743Material("C45E");
    expect(mat).toBeTruthy();

    const result = runDin743Worksheet({
      ultimateStrength_Pa: 700e6,
      options: { materialId: "C45E", Rz_um: 6.3, meanStressCase: 1 },
      stations: [
        {
          id: "fillet",
          label: "Shoulder",
          position_m: 0.2,
          diameter_m: 0.045,
          notchKind: "shoulder_fillet",
          largerDiameter_m: 0.055,
          filletRadius_m: 0.002,
          sigmaBendingA_Pa: 40e6,
          sigmaBendingM_Pa: 0,
          tauA_Pa: 0,
          tauM_Pa: 20e6,
          sigmaBendingMax_Pa: 40e6,
          tauMax_Pa: 20e6,
        },
        {
          id: "key",
          label: "Keyway",
          position_m: 0.35,
          diameter_m: 0.045,
          notchKind: "keyway_sled",
          sigmaBendingA_Pa: 35e6,
          sigmaBendingM_Pa: 0,
          tauA_Pa: 0,
          tauM_Pa: 25e6,
          sigmaBendingMax_Pa: 35e6,
          tauMax_Pa: 25e6,
        },
      ],
    });

    expect(result.stations).toHaveLength(2);
    expect(result.autoK_sigma).toBeGreaterThan(1);
    expect(result.governingFatigueSF).toBeGreaterThan(1);
    expect(result.parts).toContain("DIN 743-3");
  });

  it("overall influence factor Kσ ≥ 1 for typical inputs", () => {
    const K = overallInfluenceFactor({ beta: 1.6, K2: 0.95, KF: 0.9, KV: 1 });
    expect(K).toBeGreaterThan(1);
  });
});

describe("DIN 743 via shaft FEM", () => {
  it("attaches DIN worksheet on solve", () => {
    const res = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: {
        name: "Steel",
        E: 210e9,
        G: 80e9,
        density: 7850,
        yieldStress: 490e6,
        ultimateStrength: 700e6,
      },
      loads: [{ position: 0.5, torque: 100, bendingMoment: 200 }],
      operatingRpm: 1500,
      stressFeatures: [
        {
          position: 0.4,
          type: "shoulder_fillet",
          largerDiameter: 0.06,
          smallerDiameter: 0.05,
          filletRadius: 0.002,
        },
      ],
      din743Worksheet: { materialId: "C45E", Rz_um: 6.3 },
      meshSegments: 30,
    });

    expect(res.din743Worksheet).not.toBeNull();
    expect(res.din743Worksheet!.stations.length).toBeGreaterThan(0);
    expect(res.din743Worksheet!.autoK_sigma).toBeGreaterThan(1);
    expect(res.agma6001Template).toBeNull();
  });

  it("enables AGMA 6001 template when requested", () => {
    const res = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: {
        name: "Steel",
        E: 210e9,
        G: 80e9,
        density: 7850,
        yieldStress: 250e6,
        ultimateStrength: 690e6,
      },
      loads: [{ position: 0.5, torque: 100 }],
      agma6001: { enabled: true, interfaceKind: "spur_gear", duty: "moderate_shock" },
      meshSegments: 20,
    });
    expect(res.agma6001Template?.Ka).toBe(1.5);
    expect(res.agma6001Template?.kind).toBe("spur_gear");
  });
});
