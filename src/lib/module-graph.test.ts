import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The @vly-ai/integrations package eagerly injects a cross-origin script from
 * cdn.jsdelivr.net at module load (html2canvas-pro, for a screenshot feature
 * this app never uses). Errors thrown inside that script are masked by the
 * browser to a bare "Script error." — no message, no file, no stack — which
 * the platform then surfaces as a repeated "Error: Script error." loop on "/".
 *
 * The package must therefore stay out of the app's RUNTIME module graph.
 * vite.config.ts may keep its build-time-only vlyPlugin import (platform
 * infrastructure, never shipped to the browser).
 */
const FORBIDDEN_RUNTIME_IMPORT = "@vly-ai/integrations";

/** Matches real import forms: `import … from "pkg"`, `import "pkg"`,
 *  `import("pkg")` — while ignoring prose mentions in comments. */
const IMPORT_STATEMENT =
  /(?:from\s*|import\s*|import\(\s*)["']@vly-ai\/integrations["']/;

function runtimeFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Convex codegen is generated, not hand-written runtime code.
      if (entry === "_generated") continue;
      runtimeFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function runtimeImportIssues(): string[] {
  const issues: string[] = [];
  for (const file of runtimeFiles("src")) {
    if (IMPORT_STATEMENT.test(readFileSync(file, "utf8"))) {
      issues.push(`${file} imports ${FORBIDDEN_RUNTIME_IMPORT}`);
    }
  }
  return issues;
}

describe("runtime module graph integrity", () => {
  it("never imports the platform integrations package at runtime", () => {
    expect(runtimeImportIssues()).toEqual([]);
  });

  it("the guard actually detects the forbidden import (sanity)", () => {
    const detection = (content: string) => IMPORT_STATEMENT.test(content);
    expect(
      detection(`import '@vly-ai/integrations';\nimport React from "react";`),
    ).toBe(true);
    expect(
      detection(`import x from "@vly-ai/integrations";`),
    ).toBe(true);
    expect(
      detection(`void import("@vly-ai/integrations").then(init);`),
    ).toBe(true);
    expect(detection(`import React from "react";`)).toBe(false);
    // Prose mentions in comments must not trip the guard.
    expect(
      detection(`// The @vly-ai/integrations package must stay out of runtime.`),
    ).toBe(false);
  });
});
