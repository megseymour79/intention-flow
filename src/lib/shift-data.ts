// ShiftedMind content: moments, star colors, response styles, quiz, shifts.

export type ColorKey =
  | "nova"
  | "pulse"
  | "wave"
  | "surge"
  | "ember"
  | "orbit";

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
};

export const STAR_COLOR_KEYS = Object.keys(STAR_COLORS) as ColorKey[];

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
  tagline: string;
  description: string;
  practice: string;
  intentions: string[]; // suggested star texts
  bar: string;
  glow: string;
}

export const RESPONSE_STYLES: ResponseStyle[] = [
  {
    id: "spark",
    name: "The Spark",
    emoji: "⚡",
    tagline: "You respond fast, bright, and on instinct.",
    description:
      "Your first reaction is quick and energetic — you feel things immediately and say so. That speed is a gift; the risk is that your first answer isn't always your best one. Your edge comes from inserting a beat between the spark and the flame.",
    practice:
      "Before you answer, count three slow breaths and ask: 'Am I responding to this, or to what I think this means?' Then let the same spark out — aimed.",
    intentions: ["Breathe first, then decide", "Get curious before I get defensive", "Notice the urge, don't obey it"],
    bar: "bg-yellow-300",
    glow: "text-yellow-300",
  },
  {
    id: "anchor",
    name: "The Anchor",
    emoji: "🧭",
    tagline: "You respond with weight, patience, and follow-through.",
    description:
      "You deliberate before you act, and people count on your word because it holds. The risk is that deliberation becomes delay — or that you hold your own needs still while everyone else moves. Your edge is deciding faster once you've decided well.",
    practice:
      "Set a decision deadline for small choices: one minute, then commit. For bigger ones, write down what you actually need, then answer the moment in front of you instead of the one in your head.",
    intentions: ["One thing at a time, all the way through", "Speak slower than I think", "Adapt the plan, keep the goal"],
    bar: "bg-cyan-300",
    glow: "text-cyan-300",
  },
  {
    id: "current",
    name: "The Current",
    emoji: "🌊",
    tagline: "You respond by adapting — and it almost always works.",
    description:
      "You read the room, bend with circumstances, and rarely get stuck. That flexibility keeps you effective; the risk is drifting past your own preferences without noticing. Your edge is choosing your direction, then letting the flow do the work.",
    practice:
      "Once a day, name what you actually want before checking what's convenient. Then adapt around that, not instead of it.",
    intentions: ["Adapt the plan, keep the goal", "Let the other person finish", "Notice the urge, don't obey it"],
    bar: "bg-fuchsia-300",
    glow: "text-fuchsia-300",
  },
  {
    id: "bloom",
    name: "The Bloom",
    emoji: "🌸",
    tagline: "You respond openly — you hold space for what's possible.",
    description:
      "You meet moments with openness and generosity, seeing options others miss. The risk is saying yes until your own needs go quiet. Your edge is keeping your yes as deliberate as your curiosity.",
    practice:
      "For every yes you give today, make one of them to yourself. 'I'll help' and 'I need a minute' can live in the same conversation.",
    intentions: ["Stay curious when the answer feels obvious", "Leave the work at the door tonight", "Get curious before I get defensive"],
    bar: "bg-lime-300",
    glow: "text-lime-300",
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
    question: "Someone cuts you off mid-sentence. Your first instinct is to…",
    emoji: "⏱️",
    answers: [
      { label: "Finish the point — it was important", style: "anchor" },
      { label: "Fire back quickly, then maybe regret it", style: "spark" },
      { label: "Let them talk and find the right moment to return", style: "current" },
      { label: "Wonder why they needed to interrupt so badly", style: "bloom" },
    ],
  },
  {
    question: "Plans change at the last minute. You…",
    emoji: "🎲",
    answers: [
      { label: "Take a breath and rebuild the plan", style: "anchor" },
      { label: "Feel it strongly, then adapt fast", style: "spark" },
      { label: "Roll with it — plans were always suggestions", style: "current" },
      { label: "Look for the unexpected opportunity in it", style: "bloom" },
    ],
  },
  {
    question: "A friend dumps a big problem on you. You…",
    emoji: "🫂",
    answers: [
      { label: "Ask the questions that get to the root", style: "anchor" },
      { label: "Feel for them instantly and say something real", style: "spark" },
      { label: "Match their energy and help them move", style: "current" },
      { label: "Hold space and let them arrive at it themselves", style: "bloom" },
    ],
  },
  {
    question: "Your ideal morning is…",
    emoji: "🌅",
    answers: [
      { label: "A clear plan and a slow start", style: "anchor" },
      { label: "Wide awake fast, ideas already firing", style: "spark" },
      { label: "Whatever the day hands me, without rush", style: "current" },
      { label: "Open windows, open options, one good whim", style: "bloom" },
    ],
  },
  {
    question: "You receive tough feedback. Deep down, you…",
    emoji: "🎯",
    answers: [
      { label: "Weigh it carefully before accepting any of it", style: "anchor" },
      { label: "Get hot — then cool down and mine it for value", style: "spark" },
      { label: "Compromise first, sort feelings later", style: "current" },
      { label: "Hear the person behind the criticism", style: "bloom" },
    ],
  },
  {
    question: "Pick the pulse that matches your energy:",
    emoji: "🌈",
    answers: [
      { label: "Cyan — steady, deep, constant", style: "anchor" },
      { label: "Gold — fast, bright, catching", style: "spark" },
      { label: "Pink — flexible, shifting, alive", style: "current" },
      { label: "Lime — open, growing, curious", style: "bloom" },
    ],
  },
];

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