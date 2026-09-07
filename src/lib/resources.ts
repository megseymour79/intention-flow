/* ------------------------------------------------------------------ */
/* The Observatory — star charts for a changing mind                   */
/* Curated links on neuroplasticity, habit loops, perspective shifts   */
/* and the science of setting intentions. All links hand-verified.     */
/* ------------------------------------------------------------------ */

export type ResourceKind = "Watch" | "Listen" | "Read" | "Practice" | "Explore";

export type CategoryId = "rewire" | "loops" | "lens" | "intention";

export interface ResourceCategory {
  id: CategoryId;
  name: string;
  emoji: string;
  tagline: string;
}

export const CATEGORIES: ResourceCategory[] = [
  {
    id: "rewire",
    name: "Rewiring the mind",
    emoji: "🧠",
    tagline: "Neuroplasticity — proof that the sky you were given isn't the sky you're stuck with.",
  },
  {
    id: "loops",
    name: "Breaking old loops",
    emoji: "🔁",
    tagline: "Engrained responses, and the art of catching them mid-spin.",
  },
  {
    id: "lens",
    name: "Shifting the lens",
    emoji: "🔭",
    tagline: "Perspective is a dial, not a fate. These turn it.",
  },
  {
    id: "intention",
    name: "The science of intention",
    emoji: "🎯",
    tagline: "What actually happens in the brain when you choose who you'll be.",
  },
];

export interface MindResource {
  id: string;
  title: string;
  by: string;
  kind: ResourceKind;
  /** A friendly duration label — “2 min”, “book”, “ongoing”. */
  length: string;
  blurb: string;
  /** The one-line takeaway, in the app's voice. */
  take: string;
  url: string;
  category: CategoryId;
  emoji: string;
}

export const RESOURCES: MindResource[] = [
  /* ---------------- Rewiring the mind ---------------- */
  {
    id: "sentis-neuroplasticity",
    title: "Neuroplasticity, animated",
    by: "Sentis",
    kind: "Watch",
    length: "2 min",
    blurb:
      "The beloved two-minute animation of your brain rewiring itself. Neurons that fire together, wire together — watch what that means.",
    take: "Every star you hang is a new path being walked.",
    url: "https://www.youtube.com/watch?v=ELpfYCZa87g",
    category: "rewire",
    emoji: "🎬",
  },
  {
    id: "huberman-focus",
    title: "How to Focus to Change Your Brain",
    by: "Huberman Lab",
    kind: "Listen",
    length: "~1 hr",
    blurb:
      "Neuroscientist Andrew Huberman explains why focused attention plus urgency is the chemical recipe for adult neuroplasticity — and how to brew it on purpose.",
    take: "Attention is the shovel that digs the new groove.",
    url: "https://www.hubermanlab.com/episode/how-to-focus-to-change-your-brain",
    category: "rewire",
    emoji: "🎧",
  },
  {
    id: "boyd-tedx",
    title: "After watching this, your brain will not be the same",
    by: "Lara Boyd · TEDxVancouver",
    kind: "Watch",
    length: "14 min",
    blurb:
      "The most-watched neuroplasticity talk ever recorded: your brain changes with every action, thought, and experience — the question is whether you're steering it.",
    take: "You are your brain's most important architect.",
    url: "https://www.youtube.com/watch?v=k3ysyttB1Sk",
    category: "rewire",
    emoji: "🎬",
  },
  {
    id: "suzuki-ted",
    title: "The brain-changing benefits of exercise",
    by: "Wendy Suzuki · TED",
    kind: "Watch",
    length: "13 min",
    blurb:
      "A neuroscientist's joyful, personal talk on how movement physically rebuilds the brain — mood, memory, focus — starting with one sweaty walk.",
    take: "The cheapest plasticity booster is a pair of shoes.",
    url: "https://www.ted.com/talks/wendy_suzuki_the_brain_changing_benefits_of_exercise",
    category: "rewire",
    emoji: "🎬",
  },

  /* ---------------- Breaking old loops ---------------- */
  {
    id: "brewer-ted",
    title: "A simple way to break a bad habit",
    by: "Judson Brewer · TED",
    kind: "Watch",
    length: "9 min",
    blurb:
      "A psychiatrist maps the habit loop — trigger, behavior, reward — and shows how curiosity (not willpower) is what actually unwinds it.",
    take: "Don't fight the loop. Get curious about it.",
    url: "https://www.ted.com/talks/judson_brewer_a_simple_way_to_break_a_bad_habit",
    category: "loops",
    emoji: "🎬",
  },
  {
    id: "drjud",
    title: "Dr. Jud's habit-change lab",
    by: "drjud.com",
    kind: "Explore",
    length: "self-paced",
    blurb:
      "Free resources from Judson Brewer's lab: anxiety habit loops, smoking, overeating — all treated as learned loops that can be un-learned.",
    take: "Every engrained response was trained. So it can be retrained.",
    url: "https://drjud.com/",
    category: "loops",
    emoji: "🧭",
  },
  {
    id: "kurzgesagt-habits",
    title: "Why is it so hard to break a bad habit?",
    by: "Kurzgesagt",
    kind: "Watch",
    length: "8 min",
    blurb:
      "Gorgeous animation on why your brain automates loops in the first place — and the kinder, smarter way to swap them instead of fighting them.",
    take: "Your loops aren't broken. They're solving the wrong problem.",
    url: "https://www.youtube.com/watch?v=wr6fQ4KpbRM",
    category: "loops",
    emoji: "🎬",
  },
  {
    id: "tiny-habits",
    title: "Tiny Habits method",
    by: "BJ Fogg · Stanford",
    kind: "Practice",
    length: "5 min/day",
    blurb:
      "The free 5-day method from Stanford's behavior designer: anchor a tiny new behavior to something you already do. Big change, absurdly small start.",
    take: "Make it tiny. Then make it automatic.",
    url: "https://tinyhabits.com/",
    category: "loops",
    emoji: "🌱",
  },
  {
    id: "hidden-brain",
    title: "Hidden Brain",
    by: "Shankar Vedantam",
    kind: "Listen",
    length: "weekly",
    blurb:
      "The podcast about the unconscious scripts running your life — why you reach for your phone, mirror strangers, and defend beliefs you never chose.",
    take: "You can't edit a script you haven't read.",
    url: "https://hiddenbrain.org/",
    category: "loops",
    emoji: "🎧",
  },

  /* ---------------- Shifting the lens ---------------- */
  {
    id: "dweck-ted",
    title: "The power of believing that you can improve",
    by: "Carol Dweck · TED",
    kind: "Watch",
    length: "11 min",
    blurb:
      "The growth-mindset talk that started a movement — and the science of how the word “yet” rewires what failure means.",
    take: "Not “I can't do this.” “I can't do this… yet.”",
    url: "https://www.ted.com/talks/carol_dweck_the_power_of_believing_that_you_can_improve",
    category: "lens",
    emoji: "🎬",
  },
  {
    id: "achor-ted",
    title: "The happy secret to better work",
    by: "Shawn Achor · TED",
    kind: "Watch",
    length: "12 min",
    blurb:
      "Positive psychology's funniest talk: your brain works dramatically better positive-than-negative, and the lens can be trained in 21 days.",
    take: "Happiness isn't the reward for the shift. It's the engine.",
    url: "https://www.ted.com/talks/shawn_achor_the_happy_secret_to_better_work",
    category: "lens",
    emoji: "🎬",
  },
  {
    id: "self-compassion",
    title: "Self-compassion practices",
    by: "Kristin Neff · UT Austin",
    kind: "Practice",
    length: "self-paced",
    blurb:
      "Free guided exercises from the researcher who defined self-compassion — the base layer that makes every other mindset shift survivable.",
    take: "Talk to yourself like someone you're responsible for encouraging.",
    url: "https://self-compassion.org/",
    category: "lens",
    emoji: "💛",
  },
  {
    id: "clearer-thinking",
    title: "Clearer Thinking toolkits",
    by: "clearerthinking.org",
    kind: "Practice",
    length: "free tools",
    blurb:
      "80+ free, research-backed interactive tools and mini-courses: reframe a thought, untangle a belief, learn how your mind actually makes decisions.",
    take: "Interactive is the difference between knowing and changing.",
    url: "https://www.clearerthinking.org/",
    category: "lens",
    emoji: "🧩",
  },
  {
    id: "greater-good",
    title: "Greater Good Science Center",
    by: "UC Berkeley",
    kind: "Explore",
    length: "ongoing",
    blurb:
      "A research center translating the science of awe, gratitude, and purpose into short, readable practices. Their awe pieces pair well with a night sky.",
    take: "Awe is a perspective shift you can practice on demand.",
    url: "https://greatergood.berkeley.edu/",
    category: "lens",
    emoji: "🌏",
  },

  /* ---------------- The science of intention ---------------- */
  {
    id: "huberman-goals",
    title: "The Science of Setting & Achieving Goals",
    by: "Huberman Lab",
    kind: "Listen",
    length: "~2 hr",
    blurb:
      "The neural circuitry of goal pursuit — why specific, vivid intentions outperform vague ones, and the protocol for making them stick.",
    take: "Vague wishes fizzle. Specific intentions recruit the brain.",
    url: "https://www.hubermanlab.com/episode/the-science-of-setting-and-achieving-goals",
    category: "intention",
    emoji: "🎧",
  },
  {
    id: "woop",
    title: "WOOP — Wish, Outcome, Obstacle, Plan",
    by: "Gabriele Oettingen · NYU",
    kind: "Practice",
    length: "5 min",
    blurb:
      "The mental-contrasting method from 20 years of research: picture the outcome, face the obstacle, make an if-then plan. Positive thinking alone doesn't work — this does.",
    take: "Name the obstacle and it loses half its power.",
    url: "https://woopmylife.org/",
    category: "intention",
    emoji: "🪄",
  },
  {
    id: "woop-science",
    title: "The WOOP research — read it yourself",
    by: "PMC / NIH",
    kind: "Read",
    length: "~30 min",
    blurb:
      "A peer-reviewed pilot study on the Wish-Outcome-Obstacle-Plan strategy — for when you want the primary source, not the summary.",
    take: "The method this app borrows from, with receipts.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8893137/",
    category: "intention",
    emoji: "🔬",
  },
  {
    id: "implementation-intentions",
    title: "Implementation intentions — “if-then” plans",
    by: "Peter Gollwitzer · NYU",
    kind: "Read",
    length: "10 min",
    blurb:
      "The most robust finding in goal psychology: pre-deciding “if situation X, then I do Y” roughly doubles follow-through by handing control to the moment.",
    take: "Decide once, in advance, so the moment doesn't have to.",
    url: "https://en.wikipedia.org/wiki/Implementation_intention",
    category: "intention",
    emoji: "📖",
  },
  {
    id: "ellen-langer",
    title: "The mindlessness of “mindlessness”",
    by: "Ellen Langer · Harvard",
    kind: "Explore",
    length: "self-paced",
    blurb:
      "Harvard's “mother of mindfulness” on intentionality: most of life is run on autopilot, and simply noticing — making the implicit explicit — changes outcomes.",
    take: "An intention is an autopilot, deliberately switched off.",
    url: "https://www.ellenlanger.com/",
    category: "intention",
    emoji: "🧘",
  },
];

/** Deterministic “tonight's pick” — same pick all day, rotates daily. */
export function pickOfTheDay(date = new Date()): MindResource {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return RESOURCES[h % RESOURCES.length];
}

export function categoryOf(id: CategoryId): ResourceCategory {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
