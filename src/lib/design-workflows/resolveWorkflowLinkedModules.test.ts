import { describe, expect, it } from "vitest";
import {
  resolveWorkflowLinkedModule,
  resolveWorkflowLinkedModules,
} from "@/lib/design-workflows/resolveWorkflowLinkedModules";

describe("resolveWorkflowLinkedModules", () => {
  it("resolves exact module ids", () => {
    expect(resolveWorkflowLinkedModule("shafts")?.route).toBe("/products/machine/shafts");
    expect(resolveWorkflowLinkedModule("bearings")?.id).toBe("bearings");
  });

  it("resolves legacy materials/database alias", () => {
    expect(resolveWorkflowLinkedModule("materials/database")?.id).toBe("material-db");
  });

  it("does not map bearings to plain-bearings", () => {
    expect(resolveWorkflowLinkedModule("bearings")?.id).toBe("bearings");
    expect(resolveWorkflowLinkedModule("plain-bearings")?.id).toBe("plain-bearings");
  });

  it("deduplicates linked modules", () => {
    const modules = resolveWorkflowLinkedModules(["shafts", "shafts", "bearings"]);
    expect(modules.map((m) => m.id)).toEqual(["shafts", "bearings"]);
  });
});
