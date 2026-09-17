import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Theme foundation guard for the Ember Dusk repaint of index.css.
 * The repaint is CSS-only, so the risk is silent CSS drift: a removed
 * directive, a dropped keyframe, or an old-palette fingerprint coming back.
 * These tests parse the stylesheet source directly.
 */

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "index.css"),
  "utf8",
);

/** Extract a full `{ … }` block for a top-level selector (brace-counted). */
function extractBlock(text: string, selector: string): string | null {
  const start = text.indexOf(`${selector} {`);
  if (start === -1) return null;
  const open = text.indexOf("{", start);
  let depth = 1;
  let i = open + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    i++;
  }
  return text.slice(open + 1, i - 1);
}

function varValue(block: string, name: string): string | null {
  const m = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

describe("index.css foundation", () => {
  test("keeps the required Tailwind v4 imports and dark variant", () => {
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@import "tw-animate-css"');
    expect(css).toContain("@custom-variant dark");
    // Google font imports must survive (Space Grotesk is the --font-sans).
    expect(css).toContain("family=Space+Grotesk");
    expect(css).toContain("family=Fraunces");
    expect(css).toContain("family=JetBrains+Mono");
  });

  test("maps every shadcn token in @theme inline", () => {
    const theme = extractBlock(css, "@theme inline");
    expect(theme).not.toBeNull();
    for (const token of [
      "background", "foreground", "card", "popover", "primary", "secondary",
      "muted", "accent", "destructive", "border", "input", "ring", "sidebar",
    ]) {
      // @theme inline declares --color-* aliases of the runtime tokens.
      expect(varValue(theme!, `color-${token}`)).toBe(`var(--${token})`);
    }
  });

  test(":root and .dark both define the full token set", () => {
    const root = extractBlock(css, ":root");
    const dark = extractBlock(css, ".dark");
    expect(root).not.toBeNull();
    expect(dark).not.toBeNull();
    for (const token of [
      "background", "foreground", "card", "popover", "primary",
      "primary-foreground", "secondary", "muted", "accent", "destructive",
      "border", "input", "ring",
    ]) {
      expect(varValue(root!, token)).not.toBeNull();
      expect(varValue(dark!, token)).not.toBeNull();
    }
  });

  test("tokens are in the Ember Dusk palette (plum-ink sky, brass accent)", () => {
    const root = extractBlock(css, ":root")!;
    // Deep plum-ink background: oklch lightness ~0.16–0.18, hue ~300–305.
    const bg = varValue(root, "background")!;
    expect(bg).toMatch(/oklch\(0\.1[6-8]\s+[\d.]+\s+30[0-5]\)/);
    // Warm ivory foreground: high lightness, hue in the 60–90 (amber) band.
    const fg = varValue(root, "foreground")!;
    expect(fg).toMatch(/oklch\(0\.9[0-9]+\s+[\d.]+\s+(6[0-9]|7[0-9]|8[0-9]|90)\)/);
    // Brass/amber accent hue (~55–80) — the repaint's live accent.
    const accent = varValue(root, "accent")!;
    expect(accent).toMatch(/oklch\(0\.[6-9][0-9]*\s+0\.1[0-9]?\s+(5[5-9]|6[0-9]|7[0-9]|80)\)/);
    // Ring tracks primary (the shadcn focus convention this theme keeps).
    expect(varValue(root, "ring")).toBe(varValue(root, "primary"));
  });

  test("dark-mode background steps slightly deeper than light root", () => {
    const root = extractBlock(css, ":root")!;
    const dark = extractBlock(css, ".dark")!;
    const l = (v: string) => Number(v.match(/oklch\(([\d.]+)/)![1]);
    expect(l(varValue(dark, "background")!)).toBeLessThan(
      l(varValue(root, "background")!),
    );
  });
});

describe("index.css palette hygiene", () => {
  test("carries no old lagoon-theme fingerprints", () => {
    expect(css).not.toMatch(/#0a1128/i);
    expect(css).not.toMatch(/#0f1c46/i);
    expect(css).not.toMatch(/22d3ee|34, ?211, ?238/); // old cyan glow
    expect(css).not.toMatch(/7fd8c4/i); // old lagoon accent
    // No cyan/teal/emerald/sky utility classes anywhere in the stylesheet.
    expect(css).not.toMatch(/\b(cyan|teal|emerald|sky)-[0-9]{2,3}\b/);
  });

  test("introduces no cold blue/cyan oklch hues (150°–265°)", () => {
    const hues = [...css.matchAll(/oklch\(\s*[\d.]+\s+[\d.]+\s+(\d+(?:\.\d+)?)/g)]
      .map((m) => Number(m[1]))
      .filter((h) => h > 0); // 0-hue entries are chroma-less grays
    const cold = hues.filter((h) => h >= 150 && h < 265);
    expect(cold).toEqual([]);
  });

  test("glow-pulse breathes ember, not the old cyan", () => {
    const kf = extractBlock(css, "@keyframes glow-pulse");
    expect(kf).not.toBeNull();
    expect(kf!).toMatch(/251, ?176, ?59/); // ember amber rgb
    expect(kf!).not.toMatch(/34, ?211, ?238/); // old cyan rgb
  });
});

describe("index.css utilities + animations used by markup", () => {
  test("layout + typography utilities survive", () => {
    for (const cls of [
      ".font-eyebrow",
      ".panel",
      ".panel-hover",
      ".hairline",
      ".radius-sheet",
      ".page-col",
    ]) {
      expect(css).toContain(cls);
    }
  });

  test("every custom animation referenced by components is defined", () => {
    // Pulled from the actual markup usage (src grep, 2026-09).
    const required = [
      "twinkle", "floaty", "sway", "glow-pulse", "star-pop", "shoot",
      "vortex-pulse", "swirl", "disk-counter", "horizon-breathe", "infall",
      "dive", "dive-fade", "aura", "aurora-sway", "lagoon-breathe",
      "planet-drift", "wisp-rise", "cloud-drift", "cloud-breathe",
    ];
    for (const name of required) {
      expect(css).toContain(`@keyframes ${name}`);
      expect(css).toContain(`.animate-${name}`);
    }
  });

  test("animation classes reference their own keyframes", () => {
    const pairs: [string, string][] = [
      [".animate-glow-pulse", "glow-pulse"],
      [".animate-horizon-breathe", "horizon-breathe"],
      [".animate-lagoon-breathe", "lagoon-breathe"],
      [".animate-star-pop", "star-pop"],
    ];
    for (const [cls, kf] of pairs) {
      const block = extractBlock(css, cls);
      expect(block).not.toBeNull();
      expect(block!).toContain(kf);
    }
  });
});
