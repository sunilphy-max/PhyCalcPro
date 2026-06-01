import { ROLLED_SECTIONS } from "./data";
import type { RolledSectionsConfig, RolledSectionsResult } from "./types";
export function solveRolledSectionsEngine(c: RolledSectionsConfig): RolledSectionsResult {
  const section = ROLLED_SECTIONS[c.designation] ?? ROLLED_SECTIONS["W310x97"];
  return { ...section };
}
