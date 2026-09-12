import { describe, expect, it } from "bun:test";
import { QUIZ_PACKS } from "@/lib/quiz-packs";
import { quizPackIssues, resolveQuizKind } from "@/lib/quiz-deep-link";

describe("resolveQuizKind", () => {
  it("accepts every real quiz kind", () => {
    for (const pack of QUIZ_PACKS) {
      expect(resolveQuizKind(pack.kind)).toBe(pack.kind);
    }
  });

  it("rejects null, empty, and unknown params", () => {
    expect(resolveQuizKind(null)).toBeNull();
    expect(resolveQuizKind("")).toBeNull();
    expect(resolveQuizKind("not-a-quiz")).toBeNull();
    expect(resolveQuizKind("../../etc")).toBeNull();
  });

  it("is case-sensitive — no fuzzy matches", () => {
    for (const pack of QUIZ_PACKS) {
      expect(resolveQuizKind(pack.kind.toUpperCase())).toBeNull();
    }
  });
});

describe("quiz pack integrity", () => {
  it("every pack is uniquely keyed and well-formed", () => {
    expect(quizPackIssues()).toEqual([]);
  });
});
