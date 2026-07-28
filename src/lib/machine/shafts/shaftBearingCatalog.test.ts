import { describe, expect, it } from "vitest";
import { createShaftStation, inferShaftLoadKind } from "./loadKind";
import {
  buildShaftCatalogLifeRows,
  catalogL10FromEntry,
  suggestCatalogForScreen,
} from "./shaftBearingCatalog";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import type { ShaftBearingLifeScreen } from "./types";

describe("shaft load library stations", () => {
  it("creates typed gear / pulley defaults", () => {
    const gear = createShaftStation("gear", 0.4, 1);
    expect(gear.kind).toBe("gear");
    expect(gear.torque).toBeGreaterThan(0);
    expect(gear.transverseForce).toBeGreaterThan(0);
    expect(inferShaftLoadKind(gear)).toBe("gear");

    const pulley = createShaftStation("pulley", 0.2, 1);
    expect(pulley.kind).toBe("pulley");
    expect(pulley.transverseForce).toBeGreaterThan(0);
    expect(pulley.torque).toBeUndefined();
  });

  it("clamps position to span", () => {
    expect(createShaftStation("torque", 5, 1).position).toBe(1);
    expect(createShaftStation("torque", -1, 1).position).toBe(0);
  });
});

describe("shaft bearing catalog L10", () => {
  const screen: ShaftBearingLifeScreen = {
    position: 0,
    radialForce: 2000,
    slopeRad: 0.0005,
    requiredDynamicRating: 8000,
    estimatedDynamicRating: 12000,
    estimatedL10Hours: 5000,
    targetLifeHours: 20_000,
    status: "warning",
  };

  it("suggests catalog bearings near shaft bore", () => {
    const { ranked, recommended } = suggestCatalogForScreen({
      screen,
      shaftDiameterM: 0.025,
      operatingRpm: 1500,
    });
    expect(ranked.length).toBeGreaterThan(0);
    expect(recommended).not.toBeNull();
    expect(recommended!.entry.boreMm).toBeGreaterThan(20);
    expect(recommended!.entry.boreMm).toBeLessThan(30);
  });

  it("computes catalog L10 from designation pick", () => {
    const { recommended } = suggestCatalogForScreen({
      screen,
      shaftDiameterM: 0.025,
      operatingRpm: 1500,
    });
    expect(recommended).not.toBeNull();
    const entry = findBearing(recommended!.entry.designation)!;
    const L10 = catalogL10FromEntry({
      entry,
      radialForceN: screen.radialForce,
      operatingRpm: 1500,
    });
    expect(L10).toBeGreaterThan(0);

    const rows = buildShaftCatalogLifeRows({
      screens: [screen],
      picks: [{ positionM: 0, designation: entry.designation }],
      shaftDiameterM: 0.025,
      operatingRpm: 1500,
    });
    expect(rows[0]!.designation).toBe(entry.designation);
    expect(rows[0]!.catalogL10Hours).toBeCloseTo(L10, 3);
    expect(rows[0]!.catalogC).toBe(entry.dynamicRatingN);
  });
});
