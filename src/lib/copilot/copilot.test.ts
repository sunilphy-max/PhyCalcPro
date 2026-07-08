import { describe, expect, it } from "vitest";
import { allModules } from "@/data/modules";
import { analyzeBrief, buildDesignPlan, parseBrief, runCopilotSession } from "@/lib/copilot";

describe("parseBrief", () => {
  it("extracts power, speed, and service factor in base units", () => {
    const { params } = parseBrief("Design a shaft for a 5 kW motor running at 1750 rpm with a service factor of 1.5.");
    expect(params.power).toBeCloseTo(5000, 3);
    expect(params.rpm).toBeCloseTo(1750, 3);
    expect(params.serviceFactor).toBeCloseTo(1.5, 3);
  });

  it("derives torque from power and speed", () => {
    const { params } = parseBrief("5 kW at 1750 rpm");
    const expected = 5000 / ((1750 * 2 * Math.PI) / 60);
    expect(params.torque).toBeCloseTo(expected, 2);
  });

  it("converts non-SI units", () => {
    const { params } = parseBrief("10 hp drive at 300 psi carrying 2 kN over 4 m");
    expect(params.power).toBeCloseTo(7457, 0);
    expect(params.pressure).toBeCloseTo(300 * 6894.76, 0);
    expect(params.force).toBeCloseTo(2000, 3);
    expect(params.length).toBeCloseTo(4, 3);
  });
});

describe("analyzeBrief", () => {
  it("picks the stated design target over other nouns", () => {
    const brief = analyzeBrief("Design a shaft for a 5 kW motor at 1750 rpm");
    expect(brief.startModuleId).toBe("shafts");
  });
});

describe("buildDesignPlan", () => {
  it("chains a shaft design through keys, bearings, and housing", () => {
    const plan = buildDesignPlan("shafts");
    const ids = plan.steps.map((s) => s.moduleId);
    expect(ids[0]).toBe("shafts");
    expect(ids).toContain("keys-splines");
    expect(ids).toContain("bearings");
    expect(plan.steps.length).toBeGreaterThan(1);
  });

  it("produces a resolvable, non-empty plan for every module", () => {
    for (const mod of allModules.filter((m) => !m.comingSoon)) {
      const plan = buildDesignPlan(mod.id);
      expect(plan.steps.length).toBeGreaterThanOrEqual(1);
      expect(plan.steps[0]!.moduleId).toBe(mod.id);
    }
  });
});

describe("runCopilotSession", () => {
  it("runs the shaft example end-to-end without throwing", () => {
    const session = runCopilotSession(
      "Design a shaft for a 5 kW motor running at 1750 rpm with a service factor of 1.5."
    );
    expect(session.plan.steps.length).toBeGreaterThan(1);
    expect(session.results.length).toBe(session.plan.steps.length);
    expect(session.results.every((r) => ["ok", "skipped", "error"].includes(r.status))).toBe(true);
  });

  it(
    "executes a session for every module as a starting point",
    () => {
      for (const mod of allModules.filter((m) => !m.comingSoon)) {
        const session = runCopilotSession("preliminary design", { startModuleId: mod.id });
        expect(session.results.length).toBe(session.plan.steps.length);
        // No step should crash the orchestrator (errors are captured as status).
        expect(session.results.every((r) => ["ok", "skipped", "error"].includes(r.status))).toBe(true);
      }
    },
    60000
  );
});
