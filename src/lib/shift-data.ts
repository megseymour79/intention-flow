// ShiftedMind content: moments, star colors, response styles, quiz, shifts.

export type ColorKey =
  | "nova"
  | "pulse"
  | "wave"
  | "surge"
  | "ember"
  | "orbit"
  // rank-gated rare glows (see lib/unlocks.ts RARE_COLORS)
  | "comet"
  | "bloodmoon";

export interface StarColor {
  label: string;
  hex: string;
  glow: string; // rgba for box-shadow
  chip: string; // tailwind classes for small chips
}

export const STAR_COLORS: Record<ColorKey, StarColor> = {
  nova: {
    label: "Nova gold",
    hex: "#facc15",
    glow: "rgba(250,204,21,0.45)",
    chip: "border-yellow-300/40 bg-yellow-300/10 text-yellow-100 hover:border-yellow-300/80 hover:bg-yellow-300/20",
  },
  pulse: {
    label: "Pulse pink",
    hex: "#e879f9",
    glow: "rgba(232,121,249,0.45)",
    chip: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-100 hover:border-fuchsia-300/80 hover:bg-fuchsia-300/20",
  },
  wave: {
    label: "Wave cyan",
    hex: "#22d3ee",
    glow: "rgba(34,211,238,0.45)",
    chip: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 hover:border-cyan-300/80 hover:bg-cyan-300/20",
  },
  surge: {
    label: "Surge lime",
    hex: "#a3e635",
    glow: "rgba(163,230,53,0.45)",
    chip: "border-lime-300/40 bg-lime-300/10 text-lime-100 hover:border-lime-300/80 hover:bg-lime-300/20",
  },
  ember: {
    label: "Ember orange",
    hex: "#fb923c",
    glow: "rgba(251,146,60,0.45)",
    chip: "border-orange-300/40 bg-orange-300/10 text-orange-100 hover:border-orange-300/80 hover:bg-orange-300/20",
  },
  orbit: {
    label: "Orbit violet",
    hex: "#a78bfa",
    glow: "rgba(167,139,250,0.45)",
    chip: "border-violet-300/40 bg-violet-300/10 text-violet-100 hover:border-violet-300/80 hover:bg-violet-300/20",
  },
  // rank-gated rare glows — offered in the editor once earned
  comet: {
    label: "Comet silver",
    hex: "#cbd5e1",
    glow: "rgba(203,213,225,0.55)",
    chip: "border-slate-300/40 bg-slate-300/10 text-slate-100 hover:border-slate-300/80 hover:bg-slate-300/20",
  },
  bloodmoon: {
    label: "Blood moon",
    hex: "#f87171",
    glow: "rgba(248,113,113,0.5)",
    chip: "border-red-300/40 bg-red-300/10 text-red-100 hover:border-red-300/80 hover:bg-red-300/20",
  },
};

/** The always-available palette. Rare glows live in lib/unlocks.ts. */
export const STAR_COLOR_KEYS: ColorKey[] = [
  "nova",
  "pulse",
  "wave",
  "surge",
  "ember",
  "orbit",
];

export function starColor(key: string): StarColor {
  return STAR_COLORS[key as ColorKey] ?? STAR_COLORS.nova;
}

export interface Moment {
  id: string;
  label: string;
  emoji: string;
}

export const MOMENTS: Moment[] = [
  { id: "conversations", label: "In hard conversations", emoji: "🗣️" },
  { id: "mornings", label: "On slow mornings", emoji: "🌅" },
  { id: "meetings", label: "In big meetings", emoji: "💼" },
  { id: "change", label: "When plans change", emoji: "🎲" },
  { id: "stress", label: "When I'm stressed", emoji: "🌪️" },
  { id: "feedback", label: "When receiving feedback", emoji: "🎯" },
  { id: "nights", label: "Before I sleep", emoji: "🌙" },
  { id: "waiting", label: "While waiting", emoji: "⏳" },
];

export function momentLabel(id: string): string {
  return MOMENTS.find((m) => m.id === id)?.label ?? "Any moment";
}

export interface SkyStar {
  id: string;
  text: string;
  moment: string; // moment id
  emoji: string;
  colorKey: ColorKey;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
  active: boolean;
}

export const STAR_EMOJIS = [
  "✦",
  "✧",
  "★",
  "✶",
  "✷",
  "✵",
  "✹",
  "✺",
] as const;

export interface SuggestedStar {
  text: string;
  moment: string; // moment id
  emoji: string;
  colorKey: ColorKey;
}

export const SUGGESTED_STARS: SuggestedStar[] = [
  { text: "Stay curious when the answer feels obvious", moment: "conversations", emoji: "✦", colorKey: "nova" },
  { text: "Speak slower than I think", moment: "meetings", emoji: "✧", colorKey: "wave" },
  { text: "Let the silence hold its weight", moment: "conversations", emoji: "✶", colorKey: "orbit" },
  { text: "One thing at a time, all the way through", moment: "mornings", emoji: "★", colorKey: "surge" },
  { text: "Get curious before I get defensive", moment: "feedback", emoji: "✷", colorKey: "pulse" },
  { text: "Breathe first, then decide", moment: "stress", emoji: "✺", colorKey: "ember" },
  { text: "Adapt the plan, keep the goal", moment: "change", emoji: "✹", colorKey: "wave" },
  { text: "Leave the work at the door tonight", moment: "nights", emoji: "✧", colorKey: "orbit" },
  { text: "Let the other person finish", moment: "conversations", emoji: "✦", colorKey: "surge" },
  { text: "Notice the urge, don't obey it", moment: "stress", emoji: "★", colorKey: "pulse" },
  { text: "Arrive 10% more prepared", moment: "meetings", emoji: "✶", colorKey: "nova" },
  { text: "Choose kindness, even when it's earned", moment: "feedback", emoji: "✷", colorKey: "ember" },
];

export interface ResponseStyle {
  id: "spark" | "anchor" | "current" | "bloom";
  name: string;
  emoji: string;
  element: string; // short celestial essence
  tagline: string;
  description: string;
  shadow: string; // the honest weakness of the archetype
  practice: string;
  intentions: string[]; // suggested star texts
  bar: string;
  glow: string;
}

export const RESPONSE_STYLES: ResponseStyle[] = [
  {
    id: "spark",
    name: "The Comet",
    emoji: "☄️",
    element: "Velocity",
    tagline: "You move fast, burn bright, and trust instinct.",
    description:
      "Comets cross the whole sky in minutes, and so do you: your instinct fires first and the world warms up around you. People feel your arrival — decisions get made, things get moving. Your gift is momentum most people can't summon. The discipline is remembering that a comet that never slows never gets to choose its orbit.",
    shadow:
      "Burning through moments faster than you can mean them — and occasionally burning out before the thing is finished.",
    practice:
      "Once a day, before one reaction, take three slow breaths and ask: 'Am I answering this moment, or the last one?' Then let the same fire out — aimed.",
    intentions: ["Breathe first, then decide", "Get curious before I get defensive", "Notice the urge, don't obey it"],
    bar: "bg-yellow-300",
    glow: "text-yellow-300",
  },
  {
    id: "anchor",
    name: "The North Star",
    emoji: "🌟",
    element: "Constancy",
    tagline: "You are the fixed point other people steer by.",
    description:
      "While everything else drifts, you hold position. Your word lands, your judgment is weighed carefully, and people navigate by you — often without saying so. Your gift is reliability that outlasts moods and trends. The discipline is remembering that even fixed stars precess: staying constant on purpose is different from staying still by default.",
    shadow:
      "Holding a position long after it stopped serving you — and mistaking stillness for strength.",
    practice:
      "Give small decisions a one-minute deadline and commit. For the big ones, write down what you actually need, then answer the moment in front of you instead of the one in your head.",
    intentions: ["One thing at a time, all the way through", "Speak slower than I think", "Adapt the plan, keep the goal"],
    bar: "bg-cyan-300",
    glow: "text-cyan-300",
  },
  {
    id: "current",
    name: "The Moon",
    emoji: "🌙",
    element: "Reflection",
    tagline: "You move in phases and read every light in the room.",
    description:
      "You wax, you wane, and you notice — rooms, moods, the unspoken thing under the words. You adapt without being asked, and people feel understood around you in a way they can't quite explain. Your gift is a permeability that makes you fluent in others. The discipline is keeping some light that is only yours.",
    shadow:
      "Reflecting everyone so faithfully that you lose track of what you actually wanted.",
    practice:
      "Once a day, name what you want before checking what's convenient. Then adapt around that — not instead of it.",
    intentions: ["Adapt the plan, keep the goal", "Let the other person finish", "Notice the urge, don't obey it"],
    bar: "bg-fuchsia-300",
    glow: "text-fuchsia-300",
  },
  {
    id: "bloom",
    name: "The Nebula",
    emoji: "🌌",
    element: "Emergence",
    tagline: "You are raw potential — always forming something new.",
    description:
      "Nebulae are where stars are born, and you live there: in the space between what is and what could be. You see options before others see problems, and your openness is generative — people leave conversations with you carrying ideas they didn't have coming in. Your gift is possibility. The discipline is choosing which cloud collapses into a star.",
    shadow:
      "Starting galaxies and finishing none — openness that never hardens into a decision.",
    practice:
      "For every yes you hand out today, give one to yourself. 'I'll help' and 'I need a minute' can live in the same conversation.",
    intentions: ["Stay curious when the answer feels obvious", "Leave the work at the door tonight", "Get curious before I get defensive"],
    bar: "bg-emerald-300",
    glow: "text-emerald-300",
  },
];

export function styleById(id: string): ResponseStyle {
  return RESPONSE_STYLES.find((s) => s.id === id) ?? RESPONSE_STYLES[0];
}

export interface QuizQuestion {
  question: string;
  emoji: string;
  answers: { label: string; style: ResponseStyle["id"] }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "When your mind goes quiet and nobody's watching, where does it drift?",
    emoji: "🌌",
    answers: [
      { label: "To what's next — I'm three steps ahead before I notice", style: "spark" },
      { label: "To what's steady — the things that never let me down", style: "anchor" },
      { label: "To everyone else — I narrate the room even when I'm alone", style: "current" },
      { label: "Everywhere — ideas arrive uninvited and I let them stay", style: "bloom" },
    ],
  },
  {
    question: "Choose the pull that costs you the most to resist:",
    emoji: "✨",
    answers: [
      { label: "Saying the true thing right now", style: "spark" },
      { label: "Fixing the thing that's out of place", style: "anchor" },
      { label: "Soothing the tension in the room", style: "current" },
      { label: "Following the interesting detour", style: "bloom" },
    ],
  },
  {
    question: "How do you actually recharge — not the posted answer, the real one?",
    emoji: "🔋",
    answers: [
      { label: "A trusted routine: same walk, same tea, same order", style: "anchor" },
      { label: "Momentum — moving fast is the rest", style: "spark" },
      { label: "Low-stakes time near people who get me", style: "current" },
      { label: "A blank afternoon with nothing planned", style: "bloom" },
    ],
  },
  {
    question: "Friends would call your superpower…",
    emoji: "🏅",
    answers: [
      { label: "Following through, every time", style: "anchor" },
      { label: "Setting stuck things on fire (lovingly)", style: "spark" },
      { label: "Reading between every line", style: "current" },
      { label: "Seeing what something could become", style: "bloom" },
    ],
  },
  {
    question: "And the shadow you'd rather not name…",
    emoji: "🌑",
    answers: [
      { label: "I stay too long where I should have moved", style: "anchor" },
      { label: "I move before I've understood", style: "spark" },
      { label: "I dissolve into keeping everyone comfortable", style: "current" },
      { label: "I open doors and walk through none", style: "bloom" },
    ],
  },
  {
    question: "A decision is due tomorrow. Tonight, honestly, you…",
    emoji: "🌙",
    answers: [
      { label: "Sleep on it — it's made by morning", style: "anchor" },
      { label: "Decide it in the shower and sleep great", style: "spark" },
      { label: "Take one more quiet reading of everyone involved", style: "current" },
      { label: "Fall in love with three options at once", style: "bloom" },
    ],
  },
  {
    question: "What does your favorite room feel like?",
    emoji: "🪟",
    answers: [
      { label: "Everything in its place, doors I control", style: "anchor" },
      { label: "Loud, warm, mid-argument, alive", style: "spark" },
      { label: "Mirrors — I can see everyone from here", style: "current" },
      { label: "Half-finished projects everywhere, and I love them", style: "bloom" },
    ],
  },
  {
    question: "You have one completely free hour. The honest you picks…",
    emoji: "⏳",
    answers: [
      { label: "The thing I promised myself last week", style: "anchor" },
      { label: "The thing that makes the pulse jump", style: "spark" },
      { label: "Whoever's nearby — company first", style: "current" },
      { label: "The new thing I haven't tried yet", style: "bloom" },
    ],
  },
  {
    question: "Which silence are you most at home in?",
    emoji: "🤫",
    answers: [
      { label: "The settled quiet after everything's handled", style: "anchor" },
      { label: "The held breath right before I act", style: "spark" },
      { label: "A shared pause — comfortable, two-sided", style: "current" },
      { label: "The hum of my own head, generating", style: "bloom" },
    ],
  },
  {
    question: "Pick the pull that matches your energy:",
    emoji: "🌈",
    answers: [
      { label: "Cyan — steady, deep, constant", style: "anchor" },
      { label: "Gold — fast, bright, catching", style: "spark" },
      { label: "Pink — flexible, shifting, alive", style: "current" },
      { label: "Green — open, growing, becoming", style: "bloom" },
    ],
  },
];

/** Questions drawn per quiz run. */
export const QUIZ_LENGTH = 8;

function shuffled<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Build a fresh quiz run: random questions from the bank, answers shuffled. */
export function buildQuiz(length: number = QUIZ_LENGTH): QuizQuestion[] {
  return shuffled(QUIZ_QUESTIONS)
    .slice(0, Math.min(length, QUIZ_QUESTIONS.length))
    .map((q) => ({ ...q, answers: shuffled(q.answers) }));
}

/** Rank all four archetypes by score, strongest first — for result readings. */
export function rankStyles(scores: Record<string, number>): ResponseStyle[] {
  return [...RESPONSE_STYLES].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  );
}

export interface Shift {
  emoji: string;
  title: string;
  body: string;
}

export const SHIFTS: Shift[] = [
  {
    emoji: "🫁",
    title: "The 4-7-8 reset",
    body: "In for 4, hold for 7, out for 8. Three rounds — long enough to move a response from reaction to choice.",
  },
  {
    emoji: "✍️",
    title: "Name the urge",
    body: "Before you respond, name what's driving you: 'I'm scared', 'I'm annoyed', 'I'm showing off'. A named urge is a choice; an unnamed one is a reflex.",
  },
  {
    emoji: "⏳",
    title: "The one-beat rule",
    body: "Wait one full second after someone finishes before you speak. You'll hear more, and you'll sound considered.",
  },
  {
    emoji: "📵",
    title: "Phone swap",
    body: "Next time you reach for your phone on autopilot, reach for a pen and doodle instead. Confusion counts as thinking.",
  },
  {
    emoji: "🚶",
    title: "Walk the decision",
    body: "A one-block walk without input changes the frame. Decisions made in motion hold up better than decisions made in inboxes.",
  },
  {
    emoji: "📓",
    title: "The worry parking lot",
    body: "Write down what's looping and park it in a notebook. It'll still be there tomorrow — and tomorrow-you can carry it better.",
  },
  {
    emoji: "💬",
    title: "Repeat it back",
    body: "Before answering a loaded question, repeat what you heard. Half the conflict in a day comes from two people hearing two different things.",
  },
  {
    emoji: "🧊",
    title: "The cold splash",
    body: "Cold water on your wrists for ten seconds. It's a reset button your nervous system actually presses.",
  },
  {
    emoji: "🎧",
    title: "One-song shift",
    body: "When the mood turns on you, play one song you loved at sixteen and let it have the whole room.",
  },
  {
    emoji: "📉",
    title: "Lower the stakes",
    body: "Ask yourself: 'What's the worst that actually happens here?' Usually it's smaller than the version your brain is running.",
  },
  {
    emoji: "🪞",
    title: "The mirror hello",
    body: "Five seconds, eye contact, your own name. It's the fastest way to remind yourself who's choosing this response.",
  },
  {
    emoji: "📵",
    title: "No-reply hour",
    body: "One hour a day where nothing gets a response. You'll see how many 'urgent' things were just waiting for your attention.",
  },
  {
    emoji: "🤝",
    title: "The real check-in",
    body: "Ask someone 'how are you, really?' and wait for the actual answer. You'll both feel less invisible.",
  },
  {
    emoji: "🌙",
    title: "The day's ledger",
    body: "Each night, note one moment you responded well and one you'd redo. Not to score yourself — to pattern-match tomorrow.",
  },
];

export function shiftOfTheDay(date: Date): Shift {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return SHIFTS[dayOfYear % SHIFTS.length];
}

export function timeAgo(date: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function dayKeyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Best-guess "life moment" for the current hour — grounds suggestions in now. */
export function momentForHour(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "nights";
  if (h < 11) return "mornings";
  if (h < 14) return "meetings";
  if (h < 18) return "conversations";
  if (h < 21) return "change";
  return "nights";
}

/** Rank suggestions so stars for the selected moment surface first. */
export function suggestionsForMoment(
  selectedMoment: string,
  limit = 6,
): SuggestedStar[] {
  return [...SUGGESTED_STARS]
    .sort((a, b) => {
      const aMatch = a.moment === selectedMoment ? 0 : 1;
      const bMatch = b.moment === selectedMoment ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, limit);
}

export interface QualityHint {
  tone: "good" | "nudge";
  message: string;
}

const DOING_WORDS =
  /\b(finish|complete|email|call|reply|clean|exercise|work out|study|apply|submit|buy|send|stop)\b/i;
const BEING_WORDS =
  /\b(stay|be|remain|keep|choose|allow|notice|let|show up|respond|act|feel|hold|carry|arrive)\b/i;

/** A gentle check that the intention is about *being*, not *doing*. */
export function intentionQuality(text: string): QualityHint | null {
  const t = text.trim();
  if (t.length < 8) return null;
  if (DOING_WORDS.test(t) && !BEING_WORDS.test(t)) {
    return {
      tone: "nudge",
      message:
        "That reads like a task to finish. Try the way you want to be while doing it — “finish it calmly” becomes “stay steady under pressure”.",
    };
  }
  if (BEING_WORDS.test(t) && t.length < 30) {
    return {
      tone: "good",
      message:
        "Short and being-shaped — the kind you can still remember mid-moment.",
    };
  }
  if (BEING_WORDS.test(t)) {
    return {
      tone: "good",
      message: "That's about how you want to be. It'll hold up under pressure.",
    };
  }
  return {
    tone: "nudge",
    message:
      "Try framing it as a way of being — “stay”, “choose”, “notice”, “let” — rather than a thing to get done.",
  };
}