import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { ColorKey } from "@/lib/shift-data";
import { dayKeyFor } from "@/lib/shift-data";

/* ------------------------------------------------------------------ */
/* Visit tracking — distinct days the user came back                   */
/* ------------------------------------------------------------------ */

const VISITS_KEY = "sm-visit-days";

/** Count today as a visit day. Called once when the Dashboard loads. */
export function recordVisit(): void {
  const today = dayKeyFor(new Date());
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    const days: string[] = raw ? JSON.parse(raw) : [];
    if (!days.includes(today)) {
      days.push(today);
      localStorage.setItem(VISITS_KEY, JSON.stringify(days.slice(-120)));
    }
  } catch {
    /* storage unavailable — visits just won't count */
  }
}

export function visitDays(): number {
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    return raw ? (JSON.parse(raw) as string[]).length : 0;
  } catch {
    return 0;
  }
}

/* ------------------------------------------------------------------ */
/* Ranks — earned through engagement, not purchased                    */
/* ------------------------------------------------------------------ */

export interface RankTier {
  level: number;
  name: string;
  /** Engagement score needed to reach this tier. */
  score: number;
  blurb: string;
}

export const RANK_TIERS: RankTier[] = [
  { level: 1, name: "Stardust", score: 0, blurb: "Every sky starts as dust." },
  { level: 2, name: "Spark", score: 6, blurb: "Your sky is starting to catch." },
  { level: 3, name: "Ember", score: 16, blurb: "This is becoming a habit." },
  { level: 4, name: "Nova", score: 30, blurb: "You show up for yourself, reliably." },
  { level: 5, name: "Supernova", score: 50, blurb: "The sky bends around you now." },
];

export const RANK_EMOJI: Record<number, string> = {
  1: "🌫️",
  2: "✨",
  3: "🔥",
  4: "💫",
  5: "🌟",
};

export function rankFor(score: number): RankTier {
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (score >= t.score) tier = t;
  }
  return tier;
}

export function nextRankFor(score: number): RankTier | null {
  return RANK_TIERS.find((t) => t.score > score) ?? null;
}

export function rankNameForLevel(level: number): string {
  return RANK_TIERS.find((t) => t.level === level)?.name ?? "Stardust";
}

/* ------------------------------------------------------------------ */
/* Upgrades — what each rank unlocks                                   */
/* ------------------------------------------------------------------ */

export interface Upgrade {
  id: string;
  emoji: string;
  title: string;
  body: string;
  level: number;
}

export const UPGRADES: Upgrade[] = [
  {
    id: "rare-colors",
    emoji: "☄️",
    title: "Comet silver & blood moon",
    body: "Two rare star glows appear in the editor.",
    level: 2,
  },
  {
    id: "rare-shapes",
    emoji: "☀️",
    title: "Rare star shapes",
    body: "Comet, sun and crescent glyphs for your stars.",
    level: 2,
  },
  {
    id: "vigil-slot",
    emoji: "🌌",
    title: "The late vigil nudge",
    body: "A fourth reminder slot at 22:30, for night owls.",
    level: 3,
  },
  {
    id: "deep-sky",
    emoji: "🌠",
    title: "Deep-sky backdrop",
    body: "Your sky gains a living nebula wash behind the stars.",
    level: 4,
  },
  {
    id: "golden-lines",
    emoji: "✨",
    title: "Golden constellations",
    body: "Your focus star draws brighter, golden constellation lines.",
    level: 5,
  },
];

export function upgradesForLevel(level: number): Upgrade[] {
  return UPGRADES.filter((u) => u.level <= level);
}

/** Cosmetics gated behind ranks, consulted by the star editor. */
export const RARE_COLORS: { key: ColorKey; level: number }[] = [
  { key: "comet", level: 2 },
  { key: "bloodmoon", level: 3 },
];

export const RARE_SHAPES: { emoji: string; level: number }[] = [
  { emoji: "☄️", level: 2 },
  { emoji: "☀️", level: 3 },
  { emoji: "🌙", level: 4 },
];

/* ------------------------------------------------------------------ */
/* The rank hook — engagement score from live data + visit history     */
/* ------------------------------------------------------------------ */

export function useSkyRank() {
  const streakData = useQuery(api.stars.getStreak);
  const stats = useQuery(api.reflections.getStats);
  const quizResult = useQuery(api.quiz.getMyResult);
  const deepResults = useQuery(api.personality.myResults) ?? [];
  const [visits] = useState(visitDays);

  const loading = streakData === undefined || stats === undefined;

  // Score: stars 1pt (cap 15) · kept nights 2pt (cap 12) · visit days 2pt
  // (cap 15) · quizzes 4pt (cap 3).
  const stars = Math.min(streakData?.total ?? 0, 15);
  const keptNights = Math.min(stats?.honoredCount ?? 0, 12);
  const quizCount = Math.min((quizResult ? 1 : 0) + deepResults.length, 3);
  const visitCount = Math.min(visits, 15);
  const score = stars + keptNights * 2 + visitCount * 2 + quizCount * 4;

  const tier = rankFor(score);
  const next = nextRankFor(score);
  const unlockedIds = new Set(upgradesForLevel(tier.level).map((u) => u.id));

  // Announce a rank-up once per browser, based on the last level seen here.
  useEffect(() => {
    if (loading) return;
    const KEY = "sm-rank-level";
    let seen = 0;
    try {
      seen = Number(localStorage.getItem(KEY)) || 0;
    } catch {
      /* ignore */
    }
    if (tier.level > seen) {
      if (seen > 0) {
        const fresh = UPGRADES.filter(
          (u) => u.level <= tier.level && u.level > seen,
        );
        toast(`🔓 Rank up — ${tier.name}`, {
          description:
            fresh.map((u) => `${u.emoji} ${u.title}`).join(" · ") ||
            "New privileges in your sky.",
        });
      }
      try {
        localStorage.setItem(KEY, String(tier.level));
      } catch {
        /* ignore */
      }
    }
  }, [loading, tier.level, tier.name]);

  return {
    level: tier.level,
    name: tier.name,
    blurb: tier.blurb,
    emoji: RANK_EMOJI[tier.level] ?? "✦",
    score,
    next,
    breakdown: {
      stars: streakData?.total ?? 0,
      keptNights: stats?.honoredCount ?? 0,
      visits,
      quizCount,
    },
    unlockedIds,
    loading,
  };
}

export type SkyRankInfo = ReturnType<typeof useSkyRank>;
