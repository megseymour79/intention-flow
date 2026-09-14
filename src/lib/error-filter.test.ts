import { describe, expect, it } from "bun:test";
import { isMaskedOrTransient } from "@/lib/error-filter";

describe("isMaskedOrTransient", () => {
  it("suppresses cross-origin masked errors (the 'Script error.' loop)", () => {
    expect(isMaskedOrTransient("Script error.", "")).toBe(true);
    expect(isMaskedOrTransient("Script error.", "https://cdn.jsdelivr.net/x.js")).toBe(
      true,
    );
    expect(isMaskedOrTransient("script error.", "")).toBe(true);
  });

  it("suppresses stale-chunk module-load failures (self-healed by recovery logic)", () => {
    expect(
      isMaskedOrTransient(
        "Failed to fetch dynamically imported module: https://app/assets/Dashboard-abc.js",
        "",
      ),
    ).toBe(true);
    expect(
      isMaskedOrTransient("Importing a module script failed.", ""),
    ).toBe(true);
    expect(
      isMaskedOrTransient("Error loading dynamically imported module /x.js", ""),
    ).toBe(true);
  });

  it("suppresses uncaught messages with no source location", () => {
    expect(isMaskedOrTransient("Uncaught TypeError: x is not a function", "")).toBe(
      true,
    );
  });

  it("suppresses the masked string regardless of source — cross-origin has no origin detail", () => {
    expect(
      isMaskedOrTransient("Script error.", "https://platform.example/bridge.js"),
    ).toBe(true);
  });

  it("keeps near-miss messages visible — a real bug once hid behind them", () => {
    // Partial overlap with "Script error." must NOT be masked: the exact
    // string only. A past regression class hid behind prefix/suffix noise.
    expect(isMaskedOrTransient("Script error. (see console)", "")).toBe(false);
    expect(isMaskedOrTransient("My script error. details", "")).toBe(false);
  });
});
