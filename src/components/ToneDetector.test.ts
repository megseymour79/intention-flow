import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repaint regression guard for ToneDetector's private color maps.
 *
 * During the Ember Dusk bulk color swap, `funny` and `warm` were both set to
 * `bg-amber-300` — two distinct tones rendered identically. These maps are
 * component-private, so they can't be imported; like module-graph.test.ts,
 * this guard parses the component source instead. It fails loudly if the
 * maps move or get renamed (update this file then — that's the point).
 */

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "ToneDetector.tsx"),
  "utf8",
);

/** Pull `key: "value"` pairs out of a `const NAME: Record<…, string> = { … };` */
function recordEntries(name: string): Record<string, string> {
  const start = source.indexOf(`const ${name}:`);
  if (start === -1) {
    throw new Error(
      `Map ${name} not found in ToneDetector.tsx — has it moved or been renamed? Update this guard.`,
    );
  }
  const open = source.indexOf("{", start);
  const close = source.indexOf("};", open);
  const body = source.slice(open + 1, close);
  const entries: Record<string, string> = {};
  for (const m of body.matchAll(/([a-zA-Z]+):\s*"([^"]*)"/g)) {
    entries[m[1]] = m[2];
  }
  return entries;
}

describe("ToneDetector color maps (repaint regression guard)", () => {
  const meterColors = recordEntries("METER_COLORS");
  const flagStyles = recordEntries("FLAG_STYLES");

  it("covers every ToneKey with a meter color", () => {
    expect(Object.keys(meterColors).sort()).toEqual([
      "direct", "funny", "neutral", "rude", "warm",
    ]);
  });

  it("gives every tone a DISTINCT meter color (the funny/warm collision)", () => {
    const values = Object.values(meterColors);
    expect(new Set(values).size).toBe(values.length);
  });

  it("covers every Flag kind with a style", () => {
    expect(Object.keys(flagStyles).sort()).toEqual([
      "absolute", "demand", "harsh", "hedge", "shout",
    ]);
  });

  it("gives every flag kind a DISTINCT style", () => {
    const values = Object.values(flagStyles);
    expect(new Set(values).size).toBe(values.length);
  });

  it("uses no old-theme cold families (cyan/teal/emerald/sky/blue)", () => {
    const all = [...Object.values(meterColors), ...Object.values(flagStyles)].join(" ");
    expect(all).not.toMatch(/\b(cyan|teal|emerald|sky|blue)-[0-9]{2,3}\b/);
  });
});
