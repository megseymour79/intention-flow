import { QUIZ_PACKS, packByKind } from "@/lib/quiz-packs";

/**
 * Resolve a `?open=` URL parameter into a valid quiz kind.
 *
 * The dashboard's black-hole dive navigates to `/deeper?open=<kind>`; this
 * guard ensures only real quiz kinds ever open a dialog — unknown, empty,
 * or missing params resolve to null instead of trusting raw input.
 */
export function resolveQuizKind(param: string | null): string | null {
  if (!param) return null;
  return packByKind(param) ? param : null;
}

/** Integrity: every pack is well-formed and uniquely keyed. */
export function quizPackIssues(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const pack of QUIZ_PACKS) {
    if (!pack.kind) issues.push("pack with empty kind");
    if (seen.has(pack.kind)) issues.push(`duplicate kind: ${pack.kind}`);
    seen.add(pack.kind);
    if (!pack.title) issues.push(`${pack.kind}: missing title`);
    if (!pack.questions?.length) issues.push(`${pack.kind}: no questions`);
    if (!pack.results?.length) issues.push(`${pack.kind}: no results`);
  }
  return issues;
}
