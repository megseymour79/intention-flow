import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  ColorKey,
  MOMENTS,
  STAR_COLORS,
  STAR_COLOR_KEYS,
  STAR_EMOJIS,
  SUGGESTED_STARS,
} from "@/lib/shift-data";

export interface StarEditorDraft {
  text: string;
  moment: string;
  emoji: string;
  colorKey: ColorKey;
}

interface StarEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the new star should hang; undefined = random spot. */
  target?: { x: number; y: number };
  /** Editing an existing star. */
  existing?: {
    _id: Id<"stars">;
    text: string;
    moment: string;
    emoji: string;
    colorKey: string;
  } | null;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function StarEditor({
  open,
  onOpenChange,
  target,
  existing,
}: StarEditorProps) {
  const createStar = useMutation(api.stars.create);
  const updateStar = useMutation(api.stars.update);

  const [text, setText] = useState(existing?.text ?? "");
  const [moment, setMoment] = useState(existing?.moment ?? "conversations");
  const [emoji, setEmoji] = useState(existing?.emoji ?? "✦");
  const [colorKey, setColorKey] = useState<ColorKey>(
    (existing?.colorKey as ColorKey | undefined) ?? "nova",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    if (!existing) {
      setText("");
      setMoment("conversations");
      setEmoji(pick(STAR_EMOJIS));
      setColorKey(pick(STAR_COLOR_KEYS));
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const clean = text.trim();
    if (clean.length === 0) {
      setError("Give your star a few words first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await updateStar({
          id: existing._id,
          text: clean,
          moment,
          emoji,
          colorKey,
        });
        toast("Star polished", {
          description: `“${clean.slice(0, 60)}” is back in your sky.`,
        });
      } else {
        const x = target
          ? target.x
          : 12 + Math.round(Math.random() * 72);
        const y = target
          ? target.y
          : 16 + Math.round(Math.random() * 62);
        await createStar({ text: clean, moment, emoji, colorKey, x, y });
        toast("A star is born", {
          description: `“${clean.slice(0, 60)}” now hangs in your sky. Drag it anywhere you like.`,
        });
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't save that star.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/12 bg-[#1c1242]/95 backdrop-blur-xl sm:max-w-xl">
        <DialogTitle className="sr-only">
          {existing ? "Edit your star" : "Hang a new intention star"}
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-5 py-1"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b2a75] to-[#5b2a5e] text-xl ring-1 ring-white/15"
              style={{
                color: STAR_COLORS[colorKey].hex,
                textShadow: `0 0 14px ${STAR_COLORS[colorKey].glow}`,
              }}
            >
              {emoji}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {existing ? "Polishing a star" : "Hang a new intention"}
              </h3>
              <p className="text-sm text-muted-foreground">
                One way you want to <em>be</em> — not one thing you want to do.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I want to stay curious when the answer feels obvious…"
              maxLength={120}
              rows={3}
              className="resize-none border-white/15 bg-white/5 text-[15px] placeholder:text-foreground/35"
            />
            <p className="text-right text-[11px] text-muted-foreground/70">
              {text.length}/120
            </p>
          </div>

          {/* Suggested intentions */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5 text-amber-300/80" /> Or borrow a
              ready-made wish
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_STARS.slice(0, 6).map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => {
                    setText(s.text);
                    setMoment(s.moment);
                    setColorKey(s.colorKey);
                  }}
                  className="max-w-full truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-amber-50/85 transition-colors hover:border-amber-300/50 hover:bg-amber-300/10"
                >
                  {s.emoji} {s.text}
                </button>
              ))}
            </div>
          </div>

          {/* Moment */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              For which moment?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOMENTS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMoment(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    moment === m.id
                      ? "border-amber-300/70 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-foreground/70 hover:border-white/25 hover:text-foreground"
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color of its glow
            </p>
            <div className="flex flex-wrap gap-2">
              {STAR_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorKey(key)}
                  aria-label={STAR_COLORS[key].label}
                  className={`flex h-9 items-center gap-2 rounded-full border px-3 text-xs transition-all ${
                    colorKey === key
                      ? "scale-105 border-white/60"
                      : "border-white/10 opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    background: `${STAR_COLORS[key].hex}14`,
                    color: STAR_COLORS[key].hex,
                    boxShadow:
                      colorKey === key
                        ? `0 0 14px ${STAR_COLORS[key].glow}`
                        : undefined,
                  }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: STAR_COLORS[key].hex,
                      boxShadow: `0 0 8px ${STAR_COLORS[key].glow}`,
                    }}
                  />
                  {STAR_COLORS[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji glyph */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shape of the star
            </p>
            <div className="flex gap-1.5">
              {STAR_EMOJIS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setEmoji(g)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all ${
                    emoji === g
                      ? "border-amber-300/70 bg-amber-300/10 scale-110"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                  style={
                    emoji === g
                      ? { color: STAR_COLORS[colorKey].hex, textShadow: `0 0 12px ${STAR_COLORS[colorKey].glow}` }
                      : undefined
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saving || text.trim().length === 0}
              className="rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : existing ? (
                <Sparkles className="mr-2 h-4 w-4" />
              ) : (
                <span className="mr-1.5">✦</span>
              )}
              {existing ? "Save changes" : "Hang it in the sky"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
