import { describe, expect, it } from "vitest";
import { definition } from "./vacuum-engineering";

describe("vacuum-engineering", () => {
  it("solve with defaults returns metrics", () => {
    const defaults = Object.fromEntries(definition.fields.map((field) => [field.key, field.defaultValue]));
    const result = definition.solve(defaults);
    expect(result.metrics.length).toBeGreaterThan(0);
  });
});
