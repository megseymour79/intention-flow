// Whimsical content for Ember: intentions, vibes, quiz archetypes, tips.

export type VibeKey = "glow" | "calm" | "bloom" | "grove" | "dusk" | "tide";

export const INTENTION_VIBES: Record<
  VibeKey,
  { label: string; chip: string; hex: string; ring: string }
> = {
  glow: {
    label: "Warm glow",
    chip: "border-amber-300/30 bg-amber-400/10 text-amber-100 hover:border-amber-300/70 hover:bg-amber-300/20",
    hex: "#fbbf24",
    ring: "ring-amber-300/60",
  },
  calm: {
    label: "Still water",
    chip: "border-sky-300/30 bg-sky-400/10 text-sky-100 hover:border-sky-300/70 hover:bg-sky-300/20",
    hex: "#38bdf8",
    ring: "ring-sky-300/60",
  },
  bloom: {
    label: "Soft bloom",
    chip: "border-rose-300/30 bg-rose-400/10 text-rose-100 hover:border-rose-300/70 hover:bg-rose-300/20",
    hex: "#fb7185",
    ring: "ring-rose-300/60",
  },
  grove: {
    label: "Deep grove",
    chip: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300/70 hover:bg-emerald-300/20",
    hex: "#34d399",
    ring: "ring-emerald-300/60",
  },
  dusk: {
    label: "Purple dusk",
    chip: "border-violet-300/30 bg-violet-400/10 text-violet-100 hover:border-violet-300/70 hover:bg-violet-300/20",
    hex: "#a78bfa",
    ring: "ring-violet-300/60",
  },
  tide: {
    label: "Ocean tide",
    chip: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/70 hover:bg-cyan-300/20",
    hex: "#22d3ee",
    ring: "ring-cyan-300/60",
  },
};

export interface Intention {
  text: string;
  emoji: string;
  vibe: VibeKey;
}

export const INTENTIONS: Intention[] = [
  { text: "Be curious about the small things", emoji: "✨", vibe: "glow" },
  { text: "Move through today with grace", emoji: "🕊️", vibe: "calm" },
  { text: "Speak kindly, especially to myself", emoji: "🌸", vibe: "bloom" },
  { text: "Stay rooted when things get wobbly", emoji: "🌳", vibe: "grove" },
  { text: "Let the day unfold, don't force it", emoji: "☁️", vibe: "calm" },
  { text: "Find one silly reason to laugh", emoji: "🎈", vibe: "glow" },
  { text: "Be brave in one small way", emoji: "🦁", vibe: "glow" },
  { text: "Listen more than I speak", emoji: "🎧", vibe: "dusk" },
  { text: "Slow down and savor the moment", emoji: "🍯", vibe: "glow" },
  { text: "Turn my phone off and look up", emoji: "🌙", vibe: "dusk" },
  { text: "Be the calm in someone else's storm", emoji: "🪶", vibe: "calm" },
  { text: "Grow a little, quietly", emoji: "🌱", vibe: "grove" },
  { text: "Let joy be louder than worry", emoji: "🧡", vibe: "bloom" },
  { text: "Say yes to one adventure", emoji: "🧭", vibe: "tide" },
  { text: "Rest without feeling guilty", emoji: "🛋️", vibe: "bloom" },
  { text: "Notice three beautiful things", emoji: "🌼", vibe: "glow" },
  { text: "Flow like water around obstacles", emoji: "🌊", vibe: "tide" },
  { text: "Trust that I am enough today", emoji: "💫", vibe: "dusk" },
];

export interface Archetype {
  id: "firefly" | "river" | "mountain" | "wildflower";
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  practice: string;
  intentions: string[];
  bar: string;
  glow: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "firefly",
    name: "The Firefly",
    emoji: "✨",
    tagline: "You light up rooms without even trying.",
    description:
      "You carry a warm, playful spark. When things get heavy, you find the light — and you help others find theirs. Your superpower is turning an ordinary moment into something golden.",
    practice:
      "Before the day starts, name one tiny thing you'll make delightful today. Then actually do it — a fancy coffee, a silly song, a doodle. Delight is your fuel.",
    intentions: ["Let joy be louder than worry", "Find one silly reason to laugh", "Be curious about the small things"],
    bar: "bg-amber-300",
    glow: "text-amber-300",
  },
  {
    id: "river",
    name: "The River",
    emoji: "🌊",
    tagline: "You bend, you flow, you always find the way through.",
    description:
      "You're adaptable and gentle, yet unstoppable. Stress rolls off you because you move with it instead of against it. Your calm presence steadies everyone around you.",
    practice:
      "When something blocks your path today, pause and ask: 'What's the easy way around this?' Then take it — no guilt, just flow. Water never apologizes for finding the way.",
    intentions: ["Flow like water around obstacles", "Let the day unfold, don't force it", "Move through today with grace"],
    bar: "bg-sky-300",
    glow: "text-sky-300",
  },
  {
    id: "mountain",
    name: "The Mountain",
    emoji: "⛰️",
    tagline: "You are the steady one. The world leans on you — and you hold.",
    description:
      "Grounded, patient, and quietly powerful. You don't chase the storm; you let it pass. Your steadiness is a gift, but remember: even mountains rest, and even mountains bloom.",
    practice:
      "Plant your feet, take five slow breaths, and pick one thing you'll do today with complete presence. You don't need to move fast to move far.",
    intentions: ["Stay rooted when things get wobbly", "Slow down and savor the moment", "Be the calm in someone else's storm"],
    bar: "bg-emerald-300",
    glow: "text-emerald-300",
  },
  {
    id: "wildflower",
    name: "The Wildflower",
    emoji: "🌼",
    tagline: "You bloom anywhere — especially where nobody expected it.",
    description:
      "Free-spirited, resilient, and quietly radiant. You find the crack in the concrete and grow through it anyway. Your joy is contagious because it's completely your own.",
    practice:
      "Choose one thing today that's just for you — a detour, a melody, a moment of silliness. Wildflowers don't ask permission to bloom. Neither should you.",
    intentions: ["Say yes to one adventure", "Notice three beautiful things", "Trust that I am enough today"],
    bar: "bg-rose-300",
    glow: "text-rose-300",
  },
];

export function archetypeById(id: string): Archetype {
  return ARCHETYPES.find((a) => a.id === id) ?? ARCHETYPES[0];
}

export interface QuizQuestion {
  question: string;
  emoji: string;
  answers: { label: string; archetype: Archetype["id"] }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "A storm rolls in right before your big moment. You…",
    emoji: "⛈️",
    answers: [
      { label: "Grab an umbrella and keep going — weather is just weather", archetype: "mountain" },
      { label: "Lean into it; storms make the best stories", archetype: "firefly" },
      { label: "Let it pass and adjust your plans on the fly", archetype: "river" },
      { label: "Dance in it for a sec, then bloom anyway", archetype: "wildflower" },
    ],
  },
  {
    question: "Pick your perfect weekend scene:",
    emoji: "🎨",
    answers: [
      { label: "Sunrise hike, thermos in hand, zero rush", archetype: "mountain" },
      { label: "A lantern festival where everything glows", archetype: "firefly" },
      { label: "A hammock by the water, book optional", archetype: "river" },
      { label: "A spontaneous meadow picnic with people I love", archetype: "wildflower" },
    ],
  },
  {
    question: "Your friends would describe your superpower as…",
    emoji: "🦸",
    answers: [
      { label: "Holding it together when everyone else is losing it", archetype: "mountain" },
      { label: "Making any room feel warmer in seconds", archetype: "firefly" },
      { label: "Somehow staying chill in total chaos", archetype: "river" },
      { label: "Making ordinary moments feel magical", archetype: "wildflower" },
    ],
  },
  {
    question: "Your ideal morning looks like…",
    emoji: "🌅",
    answers: [
      { label: "A clear plan, a quiet stretch, feet on the floor early", archetype: "mountain" },
      { label: "Slow coffee, a playlist, zero schedule", archetype: "firefly" },
      { label: "An easy pace and wherever the day leads", archetype: "river" },
      { label: "Sunlight, open windows, and following a whim", archetype: "wildflower" },
    ],
  },
  {
    question: "Someone asks 'how are you, really?' Your honest answer is…",
    emoji: "🫖",
    answers: [
      { label: "'Steady. A little tired, but steady.'", archetype: "mountain" },
      { label: "'Honestly? Sparkly and slightly chaotic.'", archetype: "firefly" },
      { label: "'Rolling with it — same as always.'", archetype: "river" },
      { label: "'Blooming, mostly. Ask me again in an hour.'", archetype: "wildflower" },
    ],
  },
  {
    question: "Choose a glow for your day:",
    emoji: "🌈",
    answers: [
      { label: "Golden, like fireflies at dusk", archetype: "firefly" },
      { label: "Blue, like a river catching the light", archetype: "river" },
      { label: "Green, like moss on a mountain trail", archetype: "mountain" },
      { label: "Pink, like wildflowers in a field", archetype: "wildflower" },
    ],
  },
];

export interface Tip {
  emoji: string;
  title: string;
  body: string;
}

export const TIPS: Tip[] = [
  {
    emoji: "🌬️",
    title: "The 4-7-8 drift",
    body: "Breathe in for 4, hold for 7, out for 8. Three rounds and your shoulders remember they can relax.",
  },
  {
    emoji: "🫖",
    title: "Tea with intention",
    body: "Make a warm drink and take one full minute to just watch the steam. That's it. That's the practice.",
  },
  {
    emoji: "📵",
    title: "The phone swap",
    body: "Next time you reach for your phone out of habit, pick up a pen and doodle instead. Confusion counts as creativity.",
  },
  {
    emoji: "🚶",
    title: "A one-block stroll",
    body: "Walk somewhere — anywhere — without a destination or a podcast. Let your thoughts drift like a kite.",
  },
  {
    emoji: "🙏",
    title: "The gratitude hunt",
    body: "Find three things today that are quietly working for you: a warm mug, a green light, a friend's inside joke.",
  },
  {
    emoji: "🪴",
    title: "Water something",
    body: "A plant, a friendship, a half-finished idea. Small, regular watering grows the most surprising things.",
  },
  {
    emoji: "💌",
    title: "Leave a note",
    body: "Write a one-line kindness to yourself and leave it where tomorrow-you will find it. Future you deserves it.",
  },
  {
    emoji: "🪞",
    title: "The mirror hello",
    body: "Look yourself in the eye for five seconds and say your name like you're meeting someone wonderful. Because you are.",
  },
  {
    emoji: "🎶",
    title: "One-song reset",
    body: "When stress spikes, put on one song you loved at sixteen and let it have the whole room.",
  },
  {
    emoji: "🧊",
    title: "The cold splash",
    body: "Splash cold water on your wrists for 10 seconds. It's a tiny reset button your nervous system actually pushes.",
  },
  {
    emoji: "🌙",
    title: "Dusk gratitude",
    body: "As the day dims, name one thing you did today that tiny-you would be proud of. Then let it go.",
  },
  {
    emoji: "📓",
    title: "The worry parking lot",
    body: "Write down what's spinning in your head and literally park it in a notebook. It'll still be there tomorrow, I promise.",
  },
  {
    emoji: "🥪",
    title: "Eat the good thing",
    body: "Don't save the best bite for last today. Lead with it. Small rebellions keep the spirit awake.",
  },
  {
    emoji: "🛏️",
    title: "The 10-second tidy",
    body: "Make your bed corner or clear one countertop before you leave a room. Order on the outside, order on the inside.",
  },
  {
    emoji: "🌻",
    title: "Face the sun",
    body: "For 60 seconds, stand in actual sunlight with your eyes closed. Photosynthesis for the soul.",
  },
  {
    emoji: "🤝",
    title: "The real check-in",
    body: "Ask someone 'how are you, really?' and wait for the actual answer. You'll both feel less invisible.",
  },
];

export function tipOfTheDay(date: Date): Tip {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return TIPS[dayOfYear % TIPS.length];
}