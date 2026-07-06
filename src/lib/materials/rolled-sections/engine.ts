import { ROLLED_SECTIONS, resolveRolledSectionDesignation } from "./data";
import type { RolledSectionsConfig, RolledSectionsResult } from "./types";
export function solveRolledSectionsEngine(c: RolledSectionsConfig): RolledSectionsResult {
  const canonical = resolveRolledSectionDesignation(c.designation);
  const section = ROLLED_SECTIONS[canonical] ?? ROLLED_SECTIONS["W310x97"];
  return { ...section, designation: canonical };
}
