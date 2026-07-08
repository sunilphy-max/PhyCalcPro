import { allModules } from "@/data/modules";

/**
 * Deterministic keyword → module matcher.
 *
 * Scores every non-coming-soon module against the brief using its id, title,
 * description, tags, and category. A light "design a <noun>" heuristic boosts
 * the stated design target so "design a shaft for a 5 kW motor" starts at
 * `shafts`, not `motor`.
 */

export type ModuleMatch = {
  moduleId: string;
  title: string;
  score: number;
};

/** Extra intent synonyms mapped to module ids. */
const SYNONYMS: Record<string, string[]> = {
  shafts: ["shaft", "axle", "spindle"],
  bearings: ["bearing", "rolling bearing", "ball bearing", "roller bearing"],
  "keys-splines": ["key", "keyway", "spline"],
  gears: ["gear", "gearing", "pinion", "spur gear"],
  "v-belts": ["v-belt", "vbelt", "belt drive", "belt"],
  "roller-chains": ["chain", "roller chain", "sprocket"],
  beams: ["beam", "girder", "joist", "cantilever"],
  columns: ["column", "strut", "buckling"],
  bolts: ["bolt", "bolted joint", "screw", "fastener"],
  welds: ["weld", "welded joint", "fillet weld"],
  "compression-springs": ["compression spring", "coil spring", "spring"],
  motor: ["motor", "electric motor", "induction motor"],
  flywheels: ["flywheel"],
  "brakes-clutches": ["brake", "clutch"],
  pipes: ["pipe", "piping"],
  vessels: ["pressure vessel", "vessel", "tank"],
  "heat-exchangers": ["heat exchanger", "exchanger"],
  fatigue: ["fatigue", "s-n", "endurance"],
  trusses: ["truss"],
  frames: ["frame", "portal frame"],
  plates: ["plate", "plate bending"],
  flanges: ["flange"],
  cams: ["cam", "follower"],
  "worm-gears": ["worm gear", "worm"],
  "bevel-gears": ["bevel gear", "bevel"],
  "planetary-gears": ["planetary", "epicyclic"],
  vibrations: ["vibration", "resonance", "natural frequency"],
  hydraulics: ["hydraulic", "orifice", "flow"],
};

function normalise(text: string): string {
  return text.toLowerCase();
}

function countHits(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = haystack.match(new RegExp(`\\b${escaped}\\b`, "g"));
  return matches ? matches.length : 0;
}

/** The noun immediately after "design (a|an|the)", if present. */
function designTargetNoun(text: string): string | null {
  const match = /\bdesign(?:ing)?\s+(?:a|an|the)?\s*([a-z][a-z-]+)/i.exec(text);
  return match ? match[1]!.toLowerCase() : null;
}

export function matchStartModule(text: string): {
  best: ModuleMatch | null;
  candidates: ModuleMatch[];
  reason: string;
} {
  const hay = normalise(text);
  const target = designTargetNoun(hay);
  const modules = allModules.filter((m) => !m.comingSoon);

  const scored: ModuleMatch[] = modules.map((m) => {
    let score = 0;
    const title = normalise(m.title);
    const idWords = m.id.replace(/-/g, " ");

    score += countHits(hay, idWords) * 4;
    score += countHits(hay, title) * 3;
    for (const word of title.split(/\s+/)) {
      if (word.length > 3) score += countHits(hay, word) * 1.5;
    }
    score += countHits(hay, normalise(m.description)) * 0.5;
    for (const tag of m.tags ?? []) {
      score += countHits(hay, normalise(tag)) * 1.5;
    }
    for (const syn of SYNONYMS[m.id] ?? []) {
      score += countHits(hay, syn) * 3;
    }
    // Boost the explicit design target noun.
    if (target) {
      if (m.id.includes(target) || title.includes(target)) score += 6;
      if ((SYNONYMS[m.id] ?? []).some((s) => s === target || s.includes(target))) score += 6;
    }
    return { moduleId: m.id, title: m.title, score };
  });

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const best = ranked[0] ?? null;
  let reason = "No specific module matched; defaulting to a general workflow.";
  if (best) {
    reason = target && (best.moduleId.includes(target) || best.title.toLowerCase().includes(target))
      ? `Matched the stated design target “${target}”.`
      : `Best keyword match in the brief.`;
  }

  return { best, candidates: ranked, reason };
}
