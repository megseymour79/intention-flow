/* ------------------------------------------------------------------ */
/* Moon phase — real, computed from the date                           */
/* ------------------------------------------------------------------ */

const SYNODIC = 29.53058867; // days, new moon to new moon
const KNOWN_NEW_MOON_DAYS = Date.UTC(2000, 0, 6, 18, 14) / 86_400_000;

const MOON_NAMES = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
] as const;

export interface MoonInfo {
  name: string;
  /** 0 = new, 1 = full */
  illumination: number;
  /** 0..1 position in the cycle, for rendering the lit disc */
  phase: number;
}

export function moonPhase(date: Date): MoonInfo {
  const days = date.getTime() / 86_400_000 - KNOWN_NEW_MOON_DAYS;
  const phase = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const idx = Math.round(phase * 8) % 8;
  return { name: MOON_NAMES[idx], illumination, phase };
}

/* ------------------------------------------------------------------ */
/* Tonight's sky event — one per day, rotating through the year        */
/* ------------------------------------------------------------------ */

export type SkyEventKind =
  | "aurora" // shimmer band on the horizon
  | "meteorshower" // meteors run double
  | "starbloom" // three tap-able newborn stars
  | "planetrise" // a bright, unblinking planet
  | "none"; // honest quiet night

export interface SkyEvent {
  id: string;
  kind: SkyEventKind;
  title: string;
  body: string;
  /** For planetrise events, which planet. */
  planet?: string;
}

const SKY_EVENTS: SkyEvent[] = [
  {
    id: "aurora-strong",
    kind: "aurora",
    title: "Aurora watch",
    body: "Solar wind from this week's flare is arriving. A green shimmer may ride the horizon for the next few hours.",
  },
  {
    id: "meteor-trickle",
    kind: "meteorshower",
    title: "Meteor trickle",
    body: "We're crossing an old comet trail. Meteors come in pairs tonight — look between the constellations.",
  },
  {
    id: "stellar-nursery",
    kind: "starbloom",
    title: "Stellar nursery",
    body: "Three new stars ignite in your sky tonight. Tap one before it settles — the light is brightest at birth.",
  },
  {
    id: "jupiter",
    kind: "planetrise",
    planet: "Jupiter",
    title: "Jupiter, high and steady",
    body: "The bright point that doesn't twinkle is Jupiter. Steady light means steady air — a good night to look closely.",
  },
  {
    id: "dead-calm",
    kind: "none",
    title: "Dead-calm dark",
    body: "No events tonight. The darkest skies show the most stars — notice what becomes visible when nothing performs.",
  },
  {
    id: "mars-low",
    kind: "planetrise",
    planet: "Mars",
    title: "Mars, low and burning",
    body: "Mars sits close to the horizon, rust-colored and unblinking. It hasn't twinkled once all night.",
  },
  {
    id: "zodiacal",
    kind: "aurora",
    title: "Zodiacal light",
    body: "A faint cone of glow rises from the horizon — sunlight bouncing off dust older than the planets.",
  },
  {
    id: "sharp-streaks",
    kind: "meteorshower",
    title: "Sharp streaks",
    body: "This shower is known for fast, bright meteors. If you see one, it's gone in half a second. Keep looking up.",
  },
  {
    id: "saturn",
    kind: "planetrise",
    planet: "Saturn",
    title: "Saturn, patient ring",
    body: "Saturn is out. Through anything magnifying, the rings resolve. To the eye: one calm golden point.",
  },
  {
    id: "thin-haze",
    kind: "none",
    title: "High, thin haze",
    body: "Cirrus is passing over. Stars soften behind it — even the sky has nights it doesn't perform.",
  },
];

/** Deterministic per local day: everyone sees the same sky tonight. */
export function skyEventFor(date: Date): SkyEvent {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / 86_400_000,
  );
  return SKY_EVENTS[dayOfYear % SKY_EVENTS.length];
}

/* ------------------------------------------------------------------ */
/* Falling wishes — the comet's gift                                   */
/* ------------------------------------------------------------------ */

/** Sentence starters the caught comet drops into the star editor. */
export const WISH_STARTERS = [
  "Before I sleep tonight, I want to feel…",
  "One thing I'll do differently tomorrow is…",
  "If I could ask tomorrow for one thing, it's…",
  "A boundary I'm ready to hold is…",
  "I want to be someone who…",
  "The feeling I'm chasing this week is…",
  "Tomorrow goes better if I remember…",
] as const;

export function randomWishStarter(): string {
  return WISH_STARTERS[Math.floor(Math.random() * WISH_STARTERS.length)];
}
