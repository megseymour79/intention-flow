import { describe, expect, test } from "bun:test";

import {
  INTENTIONAL_WATCHES,
  pickIntentionalWatch,
} from "./intentional-watch";

/* ------------------------------------------------------------------ */
/* the pool — every entry must be complete and link somewhere real      */
/* ------------------------------------------------------------------ */

describe("INTENTIONAL_WATCHES", () => {
  test("offers a healthy pool of films", () => {
    expect(INTENTIONAL_WATCHES.length).toBeGreaterThanOrEqual(10);
  });

  test("every entry has all fields filled", () => {
    for (const w of INTENTIONAL_WATCHES) {
      expect(w.id.length).toBeGreaterThan(0);
      expect(w.title.length).toBeGreaterThan(0);
      expect(w.by.length).toBeGreaterThan(0);
      expect(w.length.length).toBeGreaterThan(0);
      expect(w.blurb.length).toBeGreaterThan(0);
      expect(w.emoji.length).toBeGreaterThan(0);
    }
  });

  test("ids are unique", () => {
    const ids = new Set(INTENTIONAL_WATCHES.map((w) => w.id));
    expect(ids.size).toBe(INTENTIONAL_WATCHES.length);
  });

  test("every url is a standard YouTube watch link", () => {
    for (const w of INTENTIONAL_WATCHES) {
      expect(w.url.startsWith("https://www.youtube.com/watch?v=")).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/* pickIntentionalWatch — never the same film twice in a row            */
/* ------------------------------------------------------------------ */

describe("pickIntentionalWatch", () => {
  test("returns a member of the pool", () => {
    const pick = pickIntentionalWatch(null);
    expect(INTENTIONAL_WATCHES).toContain(pick);
  });

  test("never returns the excluded film", () => {
    for (const excluded of INTENTIONAL_WATCHES) {
      for (let i = 0; i < 40; i++) {
        const pick = pickIntentionalWatch(excluded.id);
        expect(pick.id).not.toBe(excluded.id);
      }
    }
  });

  test("excluding one film still offers the rest of the pool", () => {
    // rand() = 0 always picks the first element of the candidate pool.
    const first = INTENTIONAL_WATCHES[0]!;
    const second = INTENTIONAL_WATCHES[1]!;
    expect(pickIntentionalWatch(first.id, () => 0).id).toBe(second.id);
    expect(pickIntentionalWatch(null, () => 0).id).toBe(first.id);
  });

  test("an unknown exclude id falls back to the full pool", () => {
    const first = INTENTIONAL_WATCHES[0]!;
    expect(pickIntentionalWatch("not-a-real-id", () => 0).id).toBe(first.id);
  });

  test("stays inside the pool across many random draws", () => {
    let current: string | null = null;
    for (let i = 0; i < 500; i++) {
      const pick = pickIntentionalWatch(current);
      expect(INTENTIONAL_WATCHES).toContain(pick);
      expect(pick.id).not.toBe(current);
      current = pick.id;
    }
  });
});
