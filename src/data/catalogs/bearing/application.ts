/**
 * Application profile definitions and catalog filtering for bearing selection.
 */

import type {
  BearingApplicationProfile,
  BearingCatalogEntry,
  BearingMountingRole,
  BearingSealType,
  CatalogBearingType,
} from "./types";
import { APPLICATION_PROFILE_META } from "./applicationMeta";

export type CatalogFilterOptions = {
  manufacturer?: import("./types").BearingManufacturer;
  type?: CatalogBearingType;
  applicationProfile?: BearingApplicationProfile | "all";
  series?: string | "all";
  sealType?: BearingSealType | "all";
  mountingRole?: BearingMountingRole | "all";
};

export function filterCatalog(
  catalog: BearingCatalogEntry[],
  options: CatalogFilterOptions
): BearingCatalogEntry[] {
  let pool = catalog;

  if (options.manufacturer) {
    pool = pool.filter((b) => b.manufacturer === options.manufacturer);
  }
  if (options.type) {
    pool = pool.filter((b) => b.type === options.type);
  }
  if (options.applicationProfile && options.applicationProfile !== "all") {
    const applicationProfile = options.applicationProfile;
    const profile = APPLICATION_PROFILE_META[applicationProfile];
    pool = pool.filter(
      (b) =>
        b.applicationTags.includes(applicationProfile) ||
        profile.suggestedTypes.includes(b.type)
    );
  }
  if (options.series && options.series !== "all") {
    pool = pool.filter((b) => b.series === options.series);
  }
  if (options.sealType && options.sealType !== "all") {
    pool = pool.filter((b) => b.sealType === options.sealType);
  }
  if (options.mountingRole && options.mountingRole !== "all") {
    pool = pool.filter(
      (b) => b.mountingRole === options.mountingRole || b.mountingRole === "either"
    );
  }

  return pool;
}

export function uniqueSeries(entries: BearingCatalogEntry[]): string[] {
  return [...new Set(entries.map((e) => e.series))].sort();
}

export function uniqueTypes(entries: BearingCatalogEntry[]): CatalogBearingType[] {
  return [...new Set(entries.map((e) => e.type))];
}

export function suggestedTypeForApplication(
  profile: BearingApplicationProfile,
  available: CatalogBearingType[]
): CatalogBearingType | undefined {
  const meta = APPLICATION_PROFILE_META[profile];
  return meta.suggestedTypes.find((t) => available.includes(t)) ?? available[0];
}

export function applicationProfileOptions(): {
  value: BearingApplicationProfile | "all";
  label: string;
  description: string;
}[] {
  return [
    { value: "all", label: "All applications", description: "Show full manufacturer catalog" },
    ...(
      Object.entries(APPLICATION_PROFILE_META) as [
        BearingApplicationProfile,
        (typeof APPLICATION_PROFILE_META)[BearingApplicationProfile],
      ][]
    ).map(([value, meta]) => ({
      value,
      label: meta.label,
      description: meta.description,
    })),
  ];
}

export { APPLICATION_PROFILE_META };
