/**
 * Decides whether an error should be suppressed from the runtime-error dialog
 * and monitoring reports.
 *
 * Background: the app runs in a platform preview frame next to cross-origin
 * scripts (platform bridge, CDN-injected tooling). Browsers mask errors from
 * cross-origin scripts to the literal string "Script error." with no file,
 * line, or stack — there is nothing actionable to show or report. Stale-chunk
 * module-load failures are self-healed by the app's own recovery logic, so
 * reporting them only creates noise. Everything else is a genuine error and
 * must surface with full detail.
 */
const MODULE_LOAD_FAILURE =
  /importing a module script failed|failed to fetch dynamically imported module|error loading dynamically imported module/i;

export function isMaskedOrTransient(message: string, filename: string): boolean {
  // Cross-origin masked errors — the exact string browsers produce.
  if (message === "Script error." || message === "script error.") {
    return true;
  }

  // Stale-chunk reloads are handled by main.tsx's recovery logic.
  if (MODULE_LOAD_FAILURE.test(message)) {
    return true;
  }

  // `window.onerror`-style uncaught messages with no source location carry
  // nothing we could act on. Real ErrorEvents always include a filename.
  if (!filename && message.startsWith("Uncaught")) {
    return true;
  }

  return false;
}
