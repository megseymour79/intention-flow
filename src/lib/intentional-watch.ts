/* ==================================================================
   The video wormhole — hand-picked, verified talks on intention,
   growth, and choosing who you are. Pure data + pure picker logic:
   no DOM, no imports — testable fast, runnable anywhere.
   ================================================================== */

export type IntentionalWatch = {
  id: string;
  title: string;
  by: string;
  url: string;
  length: string;
  blurb: string;
  emoji: string;
};

export const INTENTIONAL_WATCHES: IntentionalWatch[] = [
  {
    id: "dweck-not-yet",
    title: "The power of believing that you can improve",
    by: "Carol Dweck",
    url: "https://www.youtube.com/watch?v=_X0mgOOSpLU",
    length: "10 min",
    blurb: "The “not yet” mindset: ability is a starting point, not a ceiling.",
    emoji: "🌱",
  },
  {
    id: "cutts-30-days",
    title: "Try something new for 30 days",
    by: "Matt Cutts",
    url: "https://www.youtube.com/watch?v=UNP03fDSj1U",
    length: "3 min",
    blurb: "Thirty days is exactly enough time to add — or subtract — a habit.",
    emoji: "🗓️",
  },
  {
    id: "puddicombe-10-minutes",
    title: "All it takes is 10 mindful minutes",
    by: "Andy Puddicombe",
    url: "https://www.youtube.com/watch?v=qzR62JJCMBQ",
    length: "9 min",
    blurb: "Doing nothing for ten minutes can change everything about your day.",
    emoji: "🫧",
  },
  {
    id: "duckworth-grit",
    title: "Grit: the power of passion and perseverance",
    by: "Angela Lee Duckworth",
    url: "https://www.youtube.com/watch?v=H14bBuluwB8",
    length: "6 min",
    blurb: "Talent isn't the story. Staying the course is.",
    emoji: "🔥",
  },
  {
    id: "mcgonigal-stress",
    title: "How to make stress your friend",
    by: "Kelly McGonigal",
    url: "https://www.youtube.com/watch?v=RcGyVTAoXEU",
    length: "14 min",
    blurb: "The same rush that tightens you can also tune you.",
    emoji: "🌊",
  },
  {
    id: "david-emotional-courage",
    title: "The gift and power of emotional courage",
    by: "Susan David",
    url: "https://www.youtube.com/watch?v=NDQ1Mi5I4rg",
    length: "16 min",
    blurb: "Discomfort is the price of admission to a meaningful life.",
    emoji: "🕯️",
  },
  {
    id: "urban-procrastinator",
    title: "Inside the mind of a master procrastinator",
    by: "Tim Urban",
    url: "https://www.youtube.com/watch?v=arj7oStGLkU",
    length: "14 min",
    blurb: "Meet the instant gratification monkey — and the deadline panic monster.",
    emoji: "🐒",
  },
  {
    id: "steindl-rast-grateful",
    title: "Want to be happy? Be grateful",
    by: "David Steindl-Rast",
    url: "https://www.youtube.com/watch?v=UtBsl3j0YRQ",
    length: "14 min",
    blurb: "Happiness isn't what makes us grateful. Gratefulness makes us happy.",
    emoji: "🌾",
  },
  {
    id: "brown-vulnerability",
    title: "The power of vulnerability",
    by: "Brené Brown",
    url: "https://www.youtube.com/watch?v=iCvmsMzlF7o",
    length: "20 min",
    blurb: "The willingness to show up and be seen, with no guarantees.",
    emoji: "💫",
  },
  {
    id: "achor-happy",
    title: "The happy secret to better work",
    by: "Shawn Achor",
    url: "https://www.youtube.com/watch?v=fLJsdqxnZb0",
    length: "12 min",
    blurb: "Happiness inspires productivity — not the other way around.",
    emoji: "☀️",
  },
];

/**
 * Pick a watch at random, never the same one twice in a row.
 * `rand` is injectable (defaults to Math.random) so tests can be deterministic.
 */
export function pickIntentionalWatch(
  excludeId: string | null,
  rand: () => number = Math.random,
): IntentionalWatch {
  const pool =
    excludeId && INTENTIONAL_WATCHES.some((w) => w.id === excludeId)
      ? INTENTIONAL_WATCHES.filter((w) => w.id !== excludeId)
      : INTENTIONAL_WATCHES;
  return pool[Math.floor(rand() * pool.length)] ?? INTENTIONAL_WATCHES[0];
}
