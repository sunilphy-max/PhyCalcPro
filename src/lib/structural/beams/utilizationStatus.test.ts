import { describe, expect, it } from "vitest";
import {
  governingUtilizationStatus,
  statusLabel,
  utilizationToMetricStatus,
} from "./utilizationStatus";

describe("utilizationToMetricStatus", () => {
  it("maps safe / near-limit / failure bands", () => {
    expect(utilizationToMetricStatus(0.5)).toBe("safe");
    expect(utilizationToMetricStatus(0.85)).toBe("safe");
    expect(utilizationToMetricStatus(0.86)).toBe("warning");
    expect(utilizationToMetricStatus(1)).toBe("warning");
    expect(utilizationToMetricStatus(1.01)).toBe("danger");
  });
});

describe("governingUtilizationStatus", () => {
  it("picks the worse check and governing limit", () => {
    const stressLed = governingUtilizationStatus(1.1, 0.4);
    expect(stressLed.status).toBe("danger");
    expect(stressLed.governing).toBe("stress");

    const deflLed = governingUtilizationStatus(0.5, 0.9);
    expect(deflLed.status).toBe("warning");
    expect(deflLed.governing).toBe("deflection");
  });
});

describe("statusLabel", () => {
  it("uses product wording", () => {
    expect(statusLabel("safe")).toBe("Safe");
    expect(statusLabel("warning")).toBe("Near limit");
    expect(statusLabel("danger")).toBe("Failure");
  });
});
