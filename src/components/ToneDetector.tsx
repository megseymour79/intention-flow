import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ScanSearch, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* The engine — a small local "instrument" that reads a message        */
/* ================================================================== */

type ToneKey = "rude" | "direct" | "funny" | "warm" | "neutral";

type Flag = {
  kind: "harsh" | "demand" | "shout" | "absolute" | "hedge";
  match: string;
  tip: string;
};

type Reading = {
  primary: string;
  detail: string;
  confidence: number;
  meters: { key: ToneKey; label: string; value: number }[];
  flags: Flag[];
};

const HARSH_WORDS = [
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

const DEMAND_PATTERNS = [
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

const ABSOLUTES = ["always", "never", "every time", "constantly", "you always", "you never"];

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

function findFlags(lower: string, raw: string): Flag[] {
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

function analyze(raw: string): Reading {
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

  let warm = warmHits * 1.4 + emojiWarm * 1.2 + softHits * 0.55;
  if (raw.match(/!/) && !raw.match(/!{2,}/)) warm += 0.5;

  let direct = demandHits * 0.9 + countHits(lower, DIRECT_MARKERS) * 1.2;
  if (raw.match(/\d/)) direct += 0.6;
  if (lower.includes("you")) direct += 0.4;
  direct = Math.max(0, direct - softHits * 0.35);

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

  // Primary reading — the loudest signal, with blends.
  let primary = "Neutral & even";
  let detail = "Calm, level ground. This will land the way it reads — quietly.";
  if (rude >= 24 && demandHits >= 1) {
    primary = "Rude with an edge";
    detail = "There's heat here, and it's aimed at someone. It'll sting before it informs.";
  } else if (rude >= 24) {
    primary = "Rude";
    detail = "Some words carry more heat than the message needs. The point may get lost in the sting.";
  } else if (direct >= 28 && warm >= 20) {
    primary = "Warm & direct";
    detail = "Clear ask, kind packaging. This is the sweet spot — it will get done and nobody bleeds.";
  } else if (direct >= 26) {
    primary = "Direct";
    detail = "Blunt and businesslike. Efficient — just make sure the reader knows you're on their side.";
  } else if (funny >= 28) {
    primary = "Playful";
    detail = "Light and joking. Read it once more if the topic is heavy — humor can land sideways in text.";
  } else if (warm >= 26) {
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

/* ================================================================== */
/* The corrector — one-tap rewrites toward a chosen tone               */
/* ================================================================== */

type Target = "softer" | "kinder" | "direct" | "lighter";

const TARGETS: { key: Target; label: string; note: string }[] = [
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

function soften(raw: string): string {
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

function rewrite(raw: string, target: Target): string[] {
  const lower = raw.toLowerCase();
  const harsh = HARSH_WORDS.some((w) => lower.includes(w));
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

/* ================================================================== */
/* The instrument UI                                                   */
/* ================================================================== */

const SAMPLES = [
  "I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!",
  "Hey! When you get a chance could you take a look at the doc? No rush at all, thanks so much :)",
  "Just a quick thing, sorry to bother you, maybe we could possibly look at the numbers I guess?",
];

const METER_COLORS: Record<ToneKey, string> = {
  rude: "bg-rose-400",
  direct: "bg-sky-300",
  funny: "bg-amber-300",
  warm: "bg-emerald-300",
  neutral: "bg-slate-300",
};

const FLAG_STYLES: Record<Flag["kind"], string> = {
  harsh: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  demand: "border-orange-400/30 bg-orange-400/10 text-orange-100",
  shout: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  absolute: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100",
  hedge: "border-sky-400/30 bg-sky-400/10 text-sky-100",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  return (
    <button
      type="button"
      title="Copy"
      onClick={() => {
        void navigator.clipboard?.writeText(text).catch(() => undefined);
        setCopied(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1400);
      }}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:border-emerald-300/40 hover:text-emerald-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function ToneDetector({ compact = false }: { compact?: boolean }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [listening, setListening] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);

  const reading = useMemo(
    () => (submitted.trim().length > 2 ? analyze(submitted) : null),
    [submitted],
  );

  const variants = useMemo(
    () => (target && submitted.trim() ? rewrite(submitted, target) : null),
    [target, submitted],
  );

  const run = () => {
    if (text.trim().length < 3) return;
    setListening(true);
    setTarget(null);
    window.setTimeout(() => {
      setSubmitted(text);
      setListening(false);
    }, 620);
  };

  const useSample = () => {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setText(s);
    setSubmitted(s);
    setTarget(null);
  };

  return (
    <div className={cn("panel p-6 sm:p-8", compact && "p-5 sm:p-6")}>
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-eyebrow text-muted-foreground">
            Instrument 01 · runs in your browser
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
            Tone detector <span className="text-emerald-200/90">&amp;</span> corrector
          </h3>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Type any message — a reply you're not sure about, a text you're
            debating. The instrument reads its tone, flags the patterns, and
            offers ways to say it differently.
          </p>
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/5 sm:inline-flex">
          <ScanSearch className="h-5 w-5 text-emerald-200/80" />
        </span>
      </div>

      {/* composer */}
      <div className="mt-5">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
          }}
          placeholder={'e.g. "You need to fix this NOW, it is completely broken!!"'}
          className="min-h-[104px] resize-none border-white/10 bg-black/25 text-sm leading-relaxed focus-visible:ring-emerald-300/30"
          maxLength={400}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <Button
            onClick={run}
            disabled={text.trim().length < 3}
            className="h-9 rounded-lg bg-foreground font-semibold text-background hover:bg-foreground/85"
          >
            <ScanSearch className="mr-1.5 h-4 w-4" />
            Read the tone
          </Button>
          <Button
            variant="outline"
            onClick={useSample}
            className="h-9 rounded-lg border-white/12 bg-transparent hover:bg-white/5"
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-emerald-200/70" />
            Try a sample
          </Button>
          <span className="ml-auto font-eyebrow text-muted-foreground/70">
            {text.length}/400
          </span>
        </div>
      </div>

      {/* readout */}
      {(listening || reading) && (
        <motion.div
          key={listening ? "listening" : submitted}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 border-t border-white/8 pt-6"
        >
          {listening || !reading ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              Listening to the words…
            </div>
          ) : (
            <>
              {/* verdict */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="font-eyebrow text-muted-foreground">Reading</p>
                <p className="font-display text-xl font-semibold tracking-tight text-emerald-100 sm:text-2xl">
                  {reading.primary}
                </p>
                <p className="font-eyebrow text-muted-foreground/70">
                  confidence {reading.confidence}%
                </p>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                {reading.detail}
              </p>

              {/* meters */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {reading.meters.map((m) => (
                  <div key={m.key} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-eyebrow text-muted-foreground">
                      {m.label}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className={cn("block h-full rounded-full", METER_COLORS[m.key])}
                      />
                    </span>
                    <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* flags */}
              {reading.flags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {reading.flags.map((f, i) => (
                    <span
                      key={`${f.match}-${i}`}
                      title={f.tip}
                      className={cn(
                        "inline-flex cursor-help items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                        FLAG_STYLES[f.kind],
                      )}
                    >
                      “{f.match}” · {f.tip}
                    </span>
                  ))}
                </div>
              )}

              {/* corrector */}
              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="font-eyebrow text-muted-foreground">
                  Say it another way
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TARGETS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      title={t.note}
                      onClick={() => setTarget((cur) => (cur === t.key ? null : t.key))}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all",
                        target === t.key
                          ? "border-emerald-300/45 bg-emerald-300/12 text-emerald-100"
                          : "border-white/12 bg-white/[0.03] text-foreground/75 hover:border-white/25 hover:text-foreground",
                      )}
                    >
                      <Wand2 className="h-3.5 w-3.5 opacity-70" />
                      {t.label}
                    </button>
                  ))}
                </div>

                {variants && (
                  <motion.ul
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-2.5"
                  >
                    {variants.map((v, i) => (
                      <li
                        key={`${target}-${i}`}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3"
                      >
                        <span className="mt-0.5 font-eyebrow text-muted-foreground/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                          {v}
                        </p>
                        <CopyButton text={v} />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
