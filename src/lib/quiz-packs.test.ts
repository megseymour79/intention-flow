import { describe, expect, test } from "bun:test";
import {
  QUIZ_PACKS,
  packByKind,
  resultById,
} from "./quiz-packs";
import { STAR_COLORS, type ColorKey } from "./shift-data";

/**
 * quiz-packs.ts was bulk-repainted (28 `hue` class values swapped). These
 * tests pin the structural contracts the UI relies on, and the color
 * well-formedness of the repainted values.
 */

/** Hue families the palette allows for result accents: the six currently
 *  shipped families. Cold old-theme families (cyan/teal/emerald/sky/blue)
 *  are deliberately absent — their return would be a repaint regression. */
const ALLOWED_HUE_FAMILIES = [
  "text-amber-", "text-rose-", "text-violet-", "text-orange-",
  "text-lime-", "text-slate-",
];

function hueFamily(hue: string): string | undefined {
  return ALLOWED_HUE_FAMILIES.find((f) => hue.startsWith(f));
}

describe("QUIZ_PACKS structure", () => {
  test("three packs, unique kinds, each with questions and results", () => {
    expect(QUIZ_PACKS.length).toBe(3);
    const kinds = QUIZ_PACKS.map((p) => p.kind);
    expect(new Set(kinds).size).toBe(3);
    for (const pack of QUIZ_PACKS) {
      expect(pack.title.length).toBeGreaterThan(0);
      expect(pack.questions.length).toBeGreaterThanOrEqual(8);
      expect(pack.results.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("packByKind resolves every pack and rejects unknown kinds", () => {
    for (const p of QUIZ_PACKS) {
      expect(packByKind(p.kind)).toBe(p);
    }
    expect(packByKind("nope")).toBeUndefined();
  });

  test("resultById falls back to the first result", () => {
    const pack = QUIZ_PACKS[0];
    expect(resultById(pack, pack.results[0].id)).toBe(pack.results[0]);
    expect(resultById(pack, "???")).toBe(pack.results[0]);
  });

  test("question ids are unique within each pack", () => {
    for (const pack of QUIZ_PACKS) {
      const ids = pack.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test("every answer scores at least one category", () => {
    for (const pack of QUIZ_PACKS) {
      for (const q of pack.questions) {
        for (const a of q.answers) {
          expect(a.scores.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  test("pack resolve() maps sensible scores to a valid result id", () => {
    for (const pack of QUIZ_PACKS) {
      const scores: Record<string, number> = {};
      for (const a of pack.questions[0].answers[0].scores) scores[a] = 1;
      const id = pack.resolve(scores);
      expect(pack.results.some((r) => r.id === id)).toBe(true);
      // Resolve must be deterministic.
      expect(pack.resolve(scores)).toBe(id);
    }
  });
});

describe("repainted hue + intention color integrity", () => {
  test("every result hue is a known Tailwind text-color class from the new palette", () => {
    for (const pack of QUIZ_PACKS) {
      for (const result of pack.results) {
        expect(result.hue).toMatch(/^text-[a-z]+-[0-9]{3}$/);
        const family = hueFamily(result.hue);
        expect(family).toBeDefined();
      }
    }
  });

  test("every pack intention references a real star color", () => {
    for (const pack of QUIZ_PACKS) {
      for (const result of pack.results) {
        for (const intention of result.intentions) {
          expect(STAR_COLORS[intention.colorKey as ColorKey]).toBeDefined();
          expect(intention.text.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("each pack uses at least two distinct hue families across its results", () => {
    // Guards against a bulk swap flattening a pack's results into one hue.
    for (const pack of QUIZ_PACKS) {
      const families = new Set(
        pack.results.map((r) => hueFamily(r.hue)).filter(Boolean),
      );
      expect(families.size).toBeGreaterThanOrEqual(2);
    }
  });
});
