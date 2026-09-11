/* ==================================================================
   The tone engine — a small local "instrument" that reads a message.
   Pure functions, no DOM, no imports: runnable anywhere, testable fast.
   ================================================================== */

export type ToneKey = "rude" | "direct" | "funny" | "warm" | "neutral";

export type Flag = {
  kind: "harsh" | "demand" | "shout" | "absolute" | "hedge";
  match: string;
  tip: string;
};

export type Reading = {
  primary: string;
  detail: string;
  confidence: number;
  meters: { key: ToneKey; label: string; value: number }[];
  flags: Flag[];
};

export type Target = "softer" | "kinder" | "direct" | "lighter";

export const HARSH_WORDS = [
  "stupid",
  "idiot",
  "idiots",
  "dumb",
  "moron",
  "pathetic",
  "useless",
  "trash",
  "garbage",
  "ridiculous",
  "shut up",
  "get lost",
  "hate you",
  "hate this team",
  "you people",
  "nobody cares",
  "don't care",
  "do not care",
  "whatever",
  "duh",
  "wtf",
  "wth",
];

export const DEMAND_PATTERNS = [
  "you need to",
  "you have to",
  "you must",
  "you should",
  "i said",
  "do it now",
  "right now",
  "asap",
  "no excuses",
  "deal with it",
  "calm down",
  "relax",
  "listen to me",
  "obviously",
  "clearly you",
  "obviously you",
];

export const ABSOLUTES = ["always", "never", "every time", "constantly", "you always", "you never"];

const HEDGES = [
  "just",
  "kind of",
  "kinda",
  "sort of",
  "sorry to bother",
  "sorry to ask",
  "if you don't mind",
  "i guess",
  "maybe just",
  "not sure but",
];

const SOFTENERS = [
  "please",
  "thank",
  "thanks",
  "appreciate",
  "sorry",
  "no rush",
  "when you get a chance",
  "would you mind",
  "could you",
  "i might",
  "i think",
  "maybe",
  "wondering",
  "hope",
];

const WARM_WORDS = [
  "glad",
  "love",
  "great",
  "nice",
  "wonderful",
  "excited",
  "proud",
  "congrats",
  "congratulations",
  "good job",
  "well done",
  "team",
  "together",
  "grateful",
];

const FUNNY_MARKERS = [
  "lol",
  "lmao",
  "haha",
  "hahaha",
  "😂",
  "🤣",
  "😄",
  "😆",
  ";)",
  ":p",
  ":-p",
  "just kidding",
  "jk",
  "kidding",
  "meme",
  "dying",
];

const DIRECT_MARKERS = [
  "i need",
  "i want",
  "i expect",
  "deadline",
  "by tomorrow",
  "by friday",
  "by monday",
  "by today",
  "must",
  "priority",
  "asap",
  "action item",
  "follow up",
  "do this",
  "the fix",
  "blocking",
];

const countHits = (text: string, list: string[]) => {
  let hits = 0;
  for (const w of list) {
    if (text.includes(w)) hits += 1;
  }
  return hits;
};

const meter = (score: number, k: number) =>
  Math.round(100 * (score / (score + k)));

export function findFlags(lower: string, raw: string): Flag[] {
  const flags: Flag[] = [];
  const push = (kind: Flag["kind"], match: string, tip: string) =>
    flags.push({ kind, match, tip });

  for (const w of HARSH_WORDS) {
    if (lower.includes(w))
      push("harsh", w, "This word carries heat — a plainer word lands softer.");
  }
  for (const w of DEMAND_PATTERNS) {
    if (lower.includes(w))
      push("demand", w, "It reads as an order. An invitation gets more yes.");
  }
  if (raw.match(/!{2,}/))
    push("shout", "!!!", "Stacked exclamation marks read as volume, not urgency.");
  if (raw.match(/\b[A-Z]{4,}\b/))
    push("shout", "CAPS", "ALL CAPS is the text version of raising your voice.");
  if (raw.match(/\?!/) || raw.match(/!\?/))
    push("shout", "?!", "A slammed question mark can feel like an accusation.");
  for (const w of ABSOLUTES) {
    if (lower.includes(w))
      push("absolute", w, "Absolutes box people in — describe this instance instead.");
  }
  if (lower.includes("calm down") || lower.includes("relax"))
    push("harsh", "calm down", "Telling someone to calm down reliably does the opposite.");

  if (flags.length === 0) {
    for (const w of HEDGES) {
      if (lower.includes(w))
        push("hedge", w, "This softener undercuts your own message.");
    }
  }
  return flags.slice(0, 4);
}

export function analyze(raw: string): Reading {
  const lower = raw.toLowerCase();
  const words = raw.trim().split(/\s+/).filter(Boolean).length;

  let rude = countHits(lower, HARSH_WORDS) * 3;
  const demandHits = countHits(lower, DEMAND_PATTERNS);
  rude += demandHits * 1.6;

  if (raw.match(/!{2,}/)) rude += 1.6;
  if (raw.match(/\b[A-Z]{4,}\b/)) rude += 1.4;
  if (raw.match(/\?!|!\?/)) rude += 0.8;
  if (raw.match(/\.\s*\.|…{1}/) && words < 8) rude += 0.4;

  const softHits = countHits(lower, SOFTENERS);
  const warmHits = countHits(lower, WARM_WORDS);
  const emojiWarm = (raw.match(/[\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}]/gu) ?? []).length;
  rude = Math.max(0, rude - softHits * 1.1 - warmHits * 0.6 - emojiWarm * 0.5);

  let warm = warmHits * 1.4 + emojiWarm * 1.2 + softHits * 0.8;
  if (raw.match(/!/) && !raw.match(/!{2,}/)) warm += 0.5;

  let direct = demandHits * 0.9 + countHits(lower, DIRECT_MARKERS) * 1.2;
  if (raw.match(/\d/)) direct += 0.6;
  if (lower.includes("you")) direct += 0.4;
  // Only genuine hedges undercut directness — politeness ("could you",
  // "thanks") is not hedging and should not blur a clear ask.
  direct = Math.max(0, direct - countHits(lower, HEDGES) * 0.6);

  let funny = countHits(lower, FUNNY_MARKERS) * 2.4;
  funny += countHits(lower, ["kidding", "lol"]) * 0.5;

  const neutralScore =
    rude + direct + funny + warm < 3.5 ? Math.max(0, 8 - (rude + direct + funny + warm)) : 0;

  const meters = [
    { key: "rude" as ToneKey, label: "Rude", value: meter(rude, 6) },
    { key: "direct" as ToneKey, label: "Direct", value: meter(direct, 5) },
    { key: "funny" as ToneKey, label: "Funny", value: meter(funny, 4) },
    { key: "warm" as ToneKey, label: "Warm", value: meter(warm, 6) },
    {
      key: "neutral" as ToneKey,
      label: "Even",
      value: Math.min(96, meter(neutralScore, 2.5)),
    },
  ];

  // Primary reading — branch on the metered (0–100) scale, not raw scores,
  // so realistic one-word-heat messages still register correctly.
  const rudeM = meter(rude, 6);
  const directM = meter(direct, 5);
  const funnyM = meter(funny, 4);
  const warmM = meter(warm, 6);

  let primary = "Neutral & even";
  let detail = "Calm, level ground. This will land the way it reads — quietly.";
  if (rudeM >= 30 && demandHits >= 1) {
    primary = "Rude with an edge";
    detail = "There's heat here, and it's aimed at someone. It'll sting before it informs.";
  } else if (rudeM >= 30) {
    primary = "Rude";
    detail = "Some words carry more heat than the message needs. The point may get lost in the sting.";
  } else if (directM >= 30 && warmM >= 35) {
    primary = "Warm & direct";
    detail = "Clear ask, kind packaging. This is the sweet spot — it will get done and nobody bleeds.";
  } else if (directM >= 30) {
    primary = "Direct";
    detail = "Blunt and businesslike. Efficient — just make sure the reader knows you're on their side.";
  } else if (funnyM >= 50) {
    primary = "Playful";
    detail = "Light and joking. Read it once more if the topic is heavy — humor can land sideways in text.";
  } else if (warmM >= 35) {
    primary = "Warm";
    detail = "Friendly and open. This builds the relationship while it communicates.";
  }

  const spread =
    Math.max(rude, direct, funny, warm) - Math.min(rude, direct, funny, warm);
  const confidence = Math.max(
    52,
    Math.min(97, 58 + Math.round(spread * 1.6) + Math.min(words, 60) * 0.3),
  );

  return { primary, detail, confidence, meters, flags: findFlags(lower, raw) };
}

/* ------------------------------------------------------------------ */
/* The corrector — one-tap rewrites toward a chosen tone               */
/* ------------------------------------------------------------------ */

export const TARGETS: { key: Target; label: string; note: string }[] = [
  { key: "softer", label: "Softer", note: "same ask, gentler grip" },
  { key: "kinder", label: "Kinder", note: "lead with the person" },
  { key: "direct", label: "More direct", note: "hedges off, point first" },
  { key: "lighter", label: "Lighter", note: "take the weight out" },
];

const GENTLER: [RegExp, string][] = [
  [/\bstupid\b/gi, "not working"],
  [/\bidiot(s)?\b/gi, "confusing moment"],
  [/\bdumb\b/gi, "unclear"],
  [/\bpathetic\b/gi, "disappointing"],
  [/\buseless\b/gi, "not helping"],
  [/\btrash\b/gi, "not great"],
  [/\bgarbage\b/gi, "not great"],
  [/\bridiculous\b/gi, "surprising"],
  [/\bshut up\b/gi, "let's pause here"],
  [/\bget lost\b/gi, "let's take a break"],
  [/\bhate (you|this)\b/gi, "am frustrated with $1"],
  [/\bwtf\b/gi, "wait — what"],
  [/\byou people\b/gi, "folks"],
  [/\bcalm down\b/gi, "let's both take a breath"],
];

const HEDGE_RE =
  /\b(just|kinda|kind of|sort of|sorry to bother you|sorry to bother|sorry to ask|if you don't mind|i guess|not sure but)\b[,\s]?/gi;

export function soften(raw: string): string {
  let out = raw;
  for (const [re, to] of GENTLER) out = out.replace(re, to);
  out = out.replace(/!{2,}/g, "!").replace(/\?!|!\?/g, "?");
  out = out.replace(/\b[A-Z]{4,}\b/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
  out = out.replace(/\byou (need|have) to\b/gi, "could you");
  out = out.replace(/\byou must\b/gi, "it would help to");
  out = out.replace(/\byou should\b/gi, "you might");
  out = out.replace(/\bobviously\b/gi, "i think");
  out = out.replace(/\bclearly you\b/gi, "it seems");
  out = out.replace(/\balways\b/gi, "this time");
  out = out.replace(/\bnever\b/gi, "haven't yet");
  out = out.replace(/\bjust\b\s/gi, "");
  out = out.replace(/\s{2,}/g, " ").trim();
  return out;
}

export function rewrite(raw: string, target: Target): string[] {
  const needsOpener = !/^(hi|hey|hello|dear|quick|just a)/i.test(raw.trim());
  const opener = needsOpener ? "Hey — " : "";
  const base = soften(raw);

  if (target === "softer") {
    const a = `${opener}${base}`;
    return [
      a,
      `${a}${a.endsWith("!") ? "" : "."} No rush — whenever you get a moment.`,
      `Quick thought: ${base}`,
    ];
  }
  if (target === "kinder") {
    return [
      `Hey — hope your day's going okay. ${base} Thanks for hearing me out.`,
      `${opener}${base}${base.endsWith("!") ? "" : "."} I know this one's a bit annoying — appreciate you.`,
      `${opener}When you get a chance: ${base} Thanks!`,
    ];
  }
  if (target === "direct") {
    let d = raw;
    for (const [re, to] of GENTLER) d = d.replace(re, to);
    d = d.replace(HEDGE_RE, " ");
    d = d.replace(/!{2,}/g, ".").replace(/\?!|!\?/g, "?");
    d = d.replace(/\b[A-Z]{4,}\b/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
    d = d.replace(/\s{2,}/g, " ").replace(/\s+([.,?])/g, "$1").trim();
    if (!d.endsWith(".") && !d.endsWith("?") && !d.endsWith("!")) d += ".";
    return [
      `Bottom line: ${d}`,
      d,
      `${d} What's your read?`,
    ];
  }
  // lighter
  const play = base
    .replace(/\bstupid\b/gi, "sneaky")
    .replace(/\bidiot(s)?\b/gi, "silly thing")
    .replace(/\bhate\b/gi, "am side-eyeing");
  return [
    `Okay so — ${play} We'll laugh about this later. Probably. 🙂`,
    `${opener}${play} No drama, just flagging it.`,
    `${play} (Said with love. Mostly.)`,
  ];
}
