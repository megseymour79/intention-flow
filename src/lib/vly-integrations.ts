/**
 * Removed: the @vly-ai/integrations package eagerly injects a cross-origin
 * script from cdn.jsdelivr.net at module load, whose masked runtime failures
 * caused repeated "Error: Script error." reports on "/".
 *
 * Nothing in the app imports this module. It is kept as an empty stub only so
 * the module-graph guard test (src/lib/module-graph.test.ts) fails loudly if
 * anyone re-imports the platform package into the runtime bundle. The package
 * remains available to vite.config.ts for build-time use only.
 */
export {};
