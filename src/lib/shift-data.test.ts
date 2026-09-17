import { describe, expect, test } from "bun:test";
import {
  STAR_COLORS,
  STAR_COLOR_KEYS,
  SHIFTS,
  MOMENTS,
  SUGGESTED_STARS,
  RESPONSE_STYLES,
  QUIZ_QUESTIONS,
  buildQuiz,
  rankStyles,
  styleById,
  starColor,
  momentLabel,
  momentForHour,
  suggestionsForMoment,
  shiftOfTheDay,
  timeAgo,
  dayKeyFor,
  intentionQuality,
} from "./shift-data";
import type { ColorKey } from "./shift-data";

/**
 * The Ember Dusk repaint touched every color-bearing map in this file.
 * These tests pin the data contracts: every referenced key must exist in the
 * palette, every chip class list must be well-formed, and every record map
 * must stay collision-free (a bulk color swap once made two meters identical).
 */

/** Chip class lists are built from Tailwind color families; family names must
 *  match the hue the entry claims (the repaint keeps family → hue alignment). */
const TAILWIND_COLOR_FAMILIES = [
  "amber", "yellow", "orange", "rose", "fuchsia", "violet", "lime", "slate",
  "red", "cyan", "sky", "emerald", "teal", "blue", "purple", "pink", "green",
  "indigo", "stone", "zinc", "neutral",
] as const;

function colorFamiliesUsedIn(classes: string): string[] {
  return TAILWIND_COLOR_FAMILIES.filter((f) => classes.includes(`${f}-`));
}

describe("STAR_COLORS palette", () => {
  test("declares a well-formed entry for every ColorKey", () => {
    for (const key of STAR_COLOR_KEYS) {
      const c = STAR_COLORS[key];
      expect(c).toBeDefined();
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      // Glow must be an rgba() of the same hue family as the hex.
      expect(c.glow).toMatch(/^rgba\(\d+, ?\d+, ?\d+, ?0?\.\d+\)$/);
      const [r, g, b] = c.glow
        .replace(/^rgba\(|\)$/g, "")
        .split(",")
        .map((n) => Number(n.trim()));
      const [hr, hg, hb] = [1, 3, 5].map((i) =>
        parseInt(c.hex.slice(i, i + 2), 16),
      );
      // Allow small tolerance: glow should visually match the star color.
      expect(Math.abs(r - hr)).toBeLessThanOrEqual(6);
      expect(Math.abs(g - hg)).toBeLessThanOrEqual(6);
      expect(Math.abs(b - hb)).toBeLessThanOrEqual(6);
    }
  });

  test("STAR_COLOR_KEYS is the always-available palette (rare keys excluded)", () => {
    // comet/bloodmoon are rank-gated (lib/unlocks.ts RARE_COLORS) and must
    // NOT appear in the always-offered list, but must exist in the record.
    const alwaysAvailable: ColorKey[] = ["nova", "pulse", "wave", "surge", "ember", "orbit"];
    expect([...STAR_COLOR_KEYS].sort()).toEqual(alwaysAvailable.sort());
    for (const key of ["comet", "bloodmoon"]) {
      expect(STAR_COLORS[key as keyof typeof STAR_COLORS]).toBeDefined();
      expect(STAR_COLOR_KEYS).not.toContain(key as (typeof STAR_COLOR_KEYS)[number]);
    }
  });

  test("every chip uses one Tailwind color family consistently (border/bg/text)", () => {
    for (const key of STAR_COLOR_KEYS) {
      const chip = STAR_COLORS[key].chip;
      const families = colorFamiliesUsedIn(chip);
      expect(families.length).toBe(1);
      // border-, bg-, text- variants of that family: at least 3 each of the
      // base utilities we rely on.
      expect(chip).toContain(`border-${families[0]}-`);
      expect(chip).toContain(`bg-${families[0]}-`);
      expect(chip).toContain(`text-${families[0]}-`);
    }
  });

  test("starColor falls back to nova for unknown keys", () => {
    expect(starColor("nope-not-real")).toBe(STAR_COLORS.nova);
    expect(starColor("nova").hex).toBe("#facc15");
  });
});

describe("moment + suggestion integrity", () => {
  test("every SUGGESTED_STARS moment id and colorKey resolves", () => {
    const momentIds = new Set(MOMENTS.map((m) => m.id));
    for (const s of SUGGESTED_STARS) {
      expect(momentIds.has(s.moment)).toBe(true);
      expect(STAR_COLORS[s.colorKey]).toBeDefined();
    }
  });

  test("suggestionsForMoment surfaces the selected moment first", () => {
    const top = suggestionsForMoment("meetings", 6)[0];
    expect(top.moment).toBe("meetings");
  });

  test("suggestionsForMoment respects the limit and excludes nothing unexpectedly", () => {
    const all = suggestionsForMoment("nights", 99);
    expect(all.length).toBe(SUGGESTED_STARS.length);
    expect(suggestionsForMoment("nights", 3).length).toBe(3);
  });

  test("momentLabel falls back for unknown ids", () => {
    expect(momentLabel("not-a-moment")).toBe("Any moment");
    expect(momentLabel("nights")).toBe("Before I sleep");
  });
});

describe("quiz data integrity", () => {
  test("QUIZ_QUESTIONS reference only real archetype ids", () => {
    const styleIds = new Set(RESPONSE_STYLES.map((s) => s.id));
    expect(styleIds.size).toBe(4);
    for (const q of QUIZ_QUESTIONS) {
      expect(q.answers.length).toBeGreaterThanOrEqual(2);
      for (const a of q.answers) {
        expect(styleIds.has(a.style)).toBe(true);
      }
    }
  });

  test("buildQuiz returns unique questions with shuffled-but-complete answers", () => {
    const quiz = buildQuiz(8);
    expect(quiz.length).toBe(8);
    const questionTexts = quiz.map((q) => q.question);
    expect(new Set(questionTexts).size).toBe(8);
    for (const q of quiz) {
      const original = QUIZ_QUESTIONS.find((o) => o.question === q.question);
      expect(original).toBeDefined();
      expect(new Set(q.answers.map((a) => a.label))).toEqual(
        new Set(original!.answers.map((a) => a.label)),
      );
    }
  });

  test("rankStyles sorts descending by score and keeps all archetypes", () => {
    const ranked = rankStyles({ spark: 5, anchor: 9, current: 1, bloom: 1 });
    expect(ranked.length).toBe(4);
    expect(ranked[0].id).toBe("anchor");
    expect(ranked[1].id).toBe("spark");
  });

  test("styleById falls back to the first style", () => {
    expect(styleById("anchor").id).toBe("anchor");
    expect(styleById("???").id).toBe(RESPONSE_STYLES[0].id);
  });
});

describe("time helpers", () => {
  test("timeAgo buckets correctly", () => {
    const now = Date.now();
    expect(timeAgo(now - 10_000)).toBe("just now");
    expect(timeAgo(now - 5 * 60_000)).toBe("5m ago");
    expect(timeAgo(now - 3 * 3_600_000)).toBe("3h ago");
    expect(timeAgo(now - 2 * 86_400_000)).toBe("2d ago");
    expect(timeAgo(now - 40 * 86_400_000)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  test("timeAgo clamps future timestamps to 'just now'", () => {
    expect(timeAgo(Date.now() + 60_000)).toBe("just now");
  });

  test("dayKeyFor zero-pads month and day", () => {
    expect(dayKeyFor(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dayKeyFor(new Date(2026, 10, 23))).toBe("2026-11-23");
  });

  test("momentForHour maps hour bands to valid moment ids", () => {
    const momentIds = new Set(MOMENTS.map((m) => m.id));
    for (let h = 0; h < 24; h++) {
      const label = momentForHour(new Date(2026, 5, 15, h, 0, 0));
      expect(momentIds.has(label)).toBe(true);
    }
    expect(momentForHour(new Date(2026, 5, 15, 23, 0))).toBe("nights");
    expect(momentForHour(new Date(2026, 5, 15, 2, 0))).toBe("nights");
  });

  test("shiftOfTheDay is stable within a day and cycles across days", () => {
    const a = shiftOfTheDay(new Date(2026, 8, 17, 9, 0));
    const b = shiftOfTheDay(new Date(2026, 8, 17, 22, 0));
    expect(a).toBe(b);
    expect(SHIFTS.length).toBeGreaterThan(0);
    // Cross-check: the dayOfYear modulo used internally.
    const date = new Date(2026, 0, 1);
    const start = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
    expect(shiftOfTheDay(date)).toBe(SHIFTS[dayOfYear % SHIFTS.length]);
  });
});

describe("intentionQuality", () => {
  test("short to-do phrasing gets the nudge", () => {
    const r = intentionQuality("finish the email");
    expect(r?.tone).toBe("nudge");
  });

  test("short being-shaped phrasing gets praise", () => {
    const r = intentionQuality("stay steady under pressure");
    expect(r?.tone).toBe("good");
  });

  test("too-short input returns null", () => {
    expect(intentionQuality("go")).toBeNull();
  });
});
