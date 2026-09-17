import { describe, expect, test } from "bun:test";
import {
  RANK_TIERS,
  RANK_EMOJI,
  rankFor,
  nextRankFor,
  rankNameForLevel,
  upgradesForLevel,
  RARE_COLORS,
  RARE_SHAPES,
} from "./unlocks";
import { STAR_COLORS, type ColorKey } from "./shift-data";

describe("rank tiers", () => {
  test("tiers ascend with strictly increasing score thresholds", () => {
    expect(RANK_TIERS.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].score).toBeGreaterThan(RANK_TIERS[i - 1].score);
      expect(RANK_TIERS[i].level).toBe(RANK_TIERS[i - 1].level + 1);
    }
  });

  test("every tier has an emoji and non-empty name/blurb", () => {
    for (const tier of RANK_TIERS) {
      expect(RANK_EMOJI[tier.level]).toBeDefined();
      expect(tier.name.length).toBeGreaterThan(0);
      expect(tier.blurb.length).toBeGreaterThan(0);
    }
  });

  test("rankFor picks the highest reachable tier at exact boundaries", () => {
    for (const tier of RANK_TIERS) {
      expect(rankFor(tier.score).level).toBe(tier.level);
    }
  });

  test("rankFor stays monotonic across the score range", () => {
    let lastLevel = rankFor(0).level;
    for (let score = 0; score <= 100; score++) {
      const level = rankFor(score).level;
      expect(level).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = level;
    }
    expect(rankFor(9999).level).toBe(RANK_TIERS[RANK_TIERS.length - 1].level);
  });

  test("nextRankFor is one step up, or null at the top", () => {
    expect(nextRankFor(0)?.level).toBe(2);
    expect(nextRankFor(7)?.level).toBe(3);
    expect(nextRankFor(RANK_TIERS[RANK_TIERS.length - 1].score)).toBeNull();
  });

  test("rankNameForLevel resolves known levels and falls back to Stardust", () => {
    for (const tier of RANK_TIERS) {
      expect(rankNameForLevel(tier.level)).toBe(tier.name);
    }
    expect(rankNameForLevel(999)).toBe("Stardust");
  });

  test("upgradesForLevel is cumulative and gated by level", () => {
    expect(upgradesForLevel(1).length).toBe(0);
    const l2 = upgradesForLevel(2).map((u) => u.id);
    expect(l2).toContain("rare-colors");
    expect(l2).toContain("rare-shapes");
    expect(l2).not.toContain("deep-sky");
    const l5 = upgradesForLevel(5).map((u) => u.id);
    expect(l5).toContain("golden-lines");
    expect(l5.length).toBe(5);
    // Cumulative: never shrinks as level rises.
    for (let level = 1; level <= 5; level++) {
      expect(upgradesForLevel(level + 1).length).toBeGreaterThanOrEqual(
        upgradesForLevel(level).length,
      );
    }
  });

  test("rare cosmetics reference real palette keys and boundary levels", () => {
    for (const rare of RARE_COLORS) {
      expect(STAR_COLORS[rare.key as ColorKey]).toBeDefined();
      expect(rare.level).toBeGreaterThanOrEqual(2);
    }
    expect(RARE_COLORS.length).toBe(2);
    for (const shape of RARE_SHAPES) {
      expect(shape.emoji.length).toBeGreaterThan(0);
    }
  });
});
