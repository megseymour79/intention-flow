import { describe, expect, test } from "bun:test";

import {
  analyze,
  findFlags,
  rewrite,
  soften,
  TARGETS,
  type Target,
} from "./tone-engine";

/* ------------------------------------------------------------------ */
/* analyze — verdicts                                                  */
/* ------------------------------------------------------------------ */

describe("analyze", () => {
  test("harsh demand message reads as rude with an edge", () => {
    const r = analyze(
      "I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!",
    );
    expect(r.primary).toBe("Rude with an edge");
    const rude = r.meters.find((m) => m.key === "rude")!;
    expect(rude.value).toBeGreaterThanOrEqual(40);
  });

  test("single harsh word without a demand reads as rude", () => {
    const r = analyze("This design is pathetic and nobody asked for it.");
    expect(r.primary).toBe("Rude");
  });

  test("polite request reads as warm & direct", () => {
    const r = analyze(
      "Hey! I need the numbers by tomorrow. When you get a chance could you take a look? Thanks so much!",
    );
    expect(r.primary).toBe("Warm & direct");
  });

  test("friendly message with warmth reads as warm", () => {
    const r = analyze(
      "Congrats on the launch, so proud of the team! It was wonderful to see everyone together. Hope we celebrate soon!",
    );
    expect(r.primary).toBe("Warm");
  });

  test("jokey message reads as playful", () => {
    const r = analyze("hahaha lol that meeting was a meme, I'm dying 😂");
    expect(r.primary).toBe("Playful");
  });

  test("calm neutral sentence stays neutral & even", () => {
    const r = analyze("The report is on the shared drive. Let me know if anything is unclear.");
    expect(r.primary).toBe("Neutral & even");
  });

  test("politeness offsets heat (please/thanks lower the rude meter)", () => {
    const angry = analyze("This build is trash, fix it.");
    const polite = analyze("This build is not great — could you take another look please? Thanks!");
    const rudeOf = (x: { meters: { key: string; value: number }[] }) =>
      x.meters.find((m) => m.key === "rude")!.value;
    expect(rudeOf(polite)).toBeLessThan(rudeOf(angry));
  });

  test("meters are bounded 0–100 and confidence stays in range", () => {
    const r = analyze("You MUST stop being an idiot about this ASAP!!! WTF?!");
    for (const m of r.meters) {
      expect(m.value).toBeGreaterThanOrEqual(0);
      expect(m.value).toBeLessThanOrEqual(100);
    }
    expect(r.confidence).toBeGreaterThanOrEqual(52);
    expect(r.confidence).toBeLessThanOrEqual(97);
  });

  test("all five meters are present with labels", () => {
    const r = analyze("hello there");
    expect(r.meters.map((m) => m.key)).toEqual([
      "rude",
      "direct",
      "funny",
      "warm",
      "neutral",
    ]);
  });
});

/* ------------------------------------------------------------------ */
/* findFlags — pattern detection                                       */
/* ------------------------------------------------------------------ */

describe("findFlags", () => {
  test("flags harsh words with a tip", () => {
    const flags = findFlags("this is stupid and useless", "this is stupid and useless");
    const kinds = flags.map((f) => f.kind);
    expect(kinds).toContain("harsh");
    expect(flags.every((f) => f.tip.length > 0)).toBe(true);
  });

  test("flags demands, shouting, and absolutes", () => {
    const raw = "You need to STOP doing this ALWAYS!!!";
    const flags = findFlags(raw.toLowerCase(), raw);
    const kinds = flags.map((f) => f.kind);
    expect(kinds).toContain("demand");
    expect(kinds).toContain("shout");
    expect(kinds).toContain("absolute");
  });

  test("flags hedges when nothing harsher is present", () => {
    const flags = findFlags(
      "just a quick thing, i guess, sorry to bother",
      "Just a quick thing, I guess, sorry to bother",
    );
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.every((f) => f.kind === "hedge")).toBe(true);
  });

  test("returns at most 4 flags", () => {
    const flags = findFlags(
      "stupid idiot trash garbage wtf moron",
      "stupid idiot trash garbage wtf moron",
    );
    expect(flags.length).toBeLessThanOrEqual(4);
  });
});

/* ------------------------------------------------------------------ */
/* soften — word-level cleanup                                         */
/* ------------------------------------------------------------------ */

describe("soften", () => {
  test("replaces harsh words with plain ones", () => {
    expect(soften("This is stupid")).not.toContain("stupid");
    expect(soften("You idiot")).not.toContain("idiot");
  });

  test("converts commands into invitations", () => {
    const out = soften("You need to send the file");
    expect(out.toLowerCase()).toContain("could you");
    expect(out.toLowerCase()).not.toContain("you need to");
  });

  test("calms shouting: caps, stacks, and slammed marks", () => {
    const out = soften("STOP THIS NOW!! WHAT?!");
    expect(out).not.toMatch(/!{2,}/);
    expect(out).not.toMatch(/\?!/);
    expect(out).not.toMatch(/\b[A-Z]{4,}\b/);
  });

  test("softens absolutes", () => {
    const out = soften("You always do this");
    expect(out.toLowerCase()).not.toContain("always");
  });
});

/* ------------------------------------------------------------------ */
/* rewrite — all targets produce usable alternatives                   */
/* ------------------------------------------------------------------ */

describe("rewrite", () => {
  const raw =
    "I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!";
  const targets: Target[] = ["softer", "kinder", "direct", "lighter"];

  test("every target returns three non-empty variants", () => {
    for (const t of targets) {
      const variants = rewrite(raw, t);
      expect(variants).toHaveLength(3);
      for (const v of variants) {
        expect(v.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("harsh words never survive any rewrite", () => {
    const harsh = ["stupid", "idiot", "trash", "wtf", "pathetic"];
    for (const t of targets) {
      for (const v of rewrite(raw, t)) {
        const low = v.toLowerCase();
        for (const w of harsh) expect(low).not.toContain(w);
      }
    }
  });

  test("kinder rewrites add appreciation", () => {
    const [first] = rewrite(raw, "kinder");
    expect(first.toLowerCase()).toContain("thanks");
  });

  test("direct rewrites strip hedges and end with punctuation", () => {
    const variants = rewrite("just maybe sort of look at the doc i guess", "direct");
    for (const v of variants) {
      expect(v.toLowerCase()).not.toContain("just");
      expect(v.endsWith(".") || v.endsWith("?") || v.endsWith("!")).toBe(true);
    }
  });

  test("target keys in TARGETS match the Target union", () => {
    expect(TARGETS.map((t) => t.key)).toEqual([
      "softer",
      "kinder",
      "direct",
      "lighter",
    ]);
  });

  test("rewrites never crash on messy input and keep the original ask", () => {
    const messy = "WTF?! you need to FIX this ASAP, it is TRASH!!!";
    for (const t of targets) {
      const variants = rewrite(messy, t);
      expect(variants).toHaveLength(3);
      for (const v of variants) {
        expect(v.toLowerCase()).not.toContain("wtf");
        expect(v.toLowerCase()).not.toContain("trash");
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/* edge cases — the engine must never produce NaN or crash             */
/* ------------------------------------------------------------------ */

describe("edge cases", () => {
  test("empty string stays neutral with no flags and no NaN", () => {
    const r = analyze("");
    expect(r.primary).toBe("Neutral & even");
    expect(r.flags).toHaveLength(0);
    for (const m of r.meters) {
      expect(Number.isFinite(m.value)).toBe(true);
      expect(m.value).toBeGreaterThanOrEqual(0);
    }
    expect(Number.isFinite(r.confidence)).toBe(true);
  });

  test("emoji-only message reads warm, never rude", () => {
    const r = analyze("😀 😄 🎉");
    const rude = r.meters.find((m) => m.key === "rude")!.value;
    const warm = r.meters.find((m) => m.key === "warm")!.value;
    expect(rude).toBe(0);
    expect(warm).toBeGreaterThan(0);
  });

  test("very long message stays within bounds", () => {
    const r = analyze("please review this. ".repeat(400));
    expect(r.confidence).toBeLessThanOrEqual(97);
    for (const m of r.meters) {
      expect(m.value).toBeLessThanOrEqual(100);
      expect(Number.isFinite(m.value)).toBe(true);
    }
  });

  test("shouty caps demand still lands in the rude band", () => {
    const r = analyze("YOU NEED TO STOP THIS NOW!!!");
    expect(["Rude", "Rude with an edge"]).toContain(r.primary);
  });

  test("soften is idempotent (second pass changes nothing)", () => {
    const once = soften("You need to STOP being stupid about this ALWAYS!!");
    const twice = soften(once);
    expect(twice).toBe(once);
  });
});
