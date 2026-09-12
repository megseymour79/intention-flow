import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ScanSearch, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  analyze,
  rewrite,
  TARGETS,
  type Flag,
  type Target,
  type ToneKey,
} from "@/lib/tone-engine";
import { cn } from "@/lib/utils";

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
          className="min-h-[104px] resize-none border-white/12 bg-[#161e42]/40 text-sm leading-relaxed focus-visible:ring-emerald-300/30"
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
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#161e42]/40 px-4 py-3"
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
