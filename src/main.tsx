import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import "./types/global.d.ts";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Community = lazy(() => import("./pages/Community.tsx"));
const Messages = lazy(() => import("./pages/Messages.tsx"));
const Observatory = lazy(() => import("./pages/Observatory.tsx"));
const Practice = lazy(() => import("./pages/Practice.tsx"));
const Deeper = lazy(() => import("./pages/Deeper.tsx"));
const Evening = lazy(() => import("./pages/Evening.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Self-heal stale build chunks: if the browser fails to load a module (e.g. after
// a redeploy or a stale Vite dep cache), hard-reload once to pick up fresh assets.
const CHUNK_RECOVERY_KEY = "shiftedmind:chunk-recovery";

function recoverFromChunkFailure() {
  let last = 0;
  let attempts = 0;
  try {
    const [ts, count] = (sessionStorage.getItem(CHUNK_RECOVERY_KEY) ?? "").split("|");
    last = Number(ts) || 0;
    attempts = Number(count) || 0;
  } catch {
    // Storage can be blocked in sandboxed iframes — treat as no history.
  }
  if (attempts >= 2) return; // two self-heals per load, then stop
  const now = Date.now();
  if (now - last < 10_000) return; // avoid reload loops
  try {
    sessionStorage.setItem(CHUNK_RECOVERY_KEY, `${now}|${attempts + 1}`);
  } catch {
    // Ignore — recovery still proceeds without the guard.
  }
  window.location.reload();
}

// A successful mount earns back the recovery budget: once React has rendered
// and the app has been up for a while, clear the counter so a *later* stale
// chunk load still gets its own two self-heal attempts instead of being
// stranded for the rest of the session. Only clears when the app actually
// mounted — a page that loaded but failed to render keeps its cap.
window.setTimeout(() => {
  try {
    if (document.getElementById("root")?.childElementCount) {
      sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    }
  } catch {
    // Storage blocked — nothing to reset.
  }
}, 20_000);

const CHUNK_FAIL = /importing a module script failed|failed to fetch dynamically imported module|error loading dynamically imported module/i;
window.addEventListener("error", (e) => {
  try {
    const msg = e.message ?? "";
    if (CHUNK_FAIL.test(msg)) return recoverFromChunkFailure();
    // Cross-origin proxies mask real errors as a bare "Script error." with no
    // filename and no detail. During the first moments of a page load, that is
    // almost always a stale or briefly-missing module — not app logic — so
    // self-heal the same way (capped at two reloads per session).
    if (msg === "Script error." && !e.filename && performance.now() < 6000) {
      recoverFromChunkFailure();
    }
  } catch {
    // never let the recovery path itself throw
  }
});
window.addEventListener("unhandledrejection", (e) => {
  try {
    const reason = e.reason;
    const text =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : "";
    if (CHUNK_FAIL.test(text)) recoverFromChunkFailure();
  } catch {
    // never let the recovery path itself throw
  }
});

// Fallback UI when a lazy route fails to load (stale cache, network hiccup).
class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
          <p className="text-lg text-muted-foreground">
            The sky drifted out of place. Let's re-anchor it.
          </p>
          <Button onClick={() => window.location.reload()}>Reload ShiftedMind</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <RouteErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/community"
                element={
                  <RequireAuth>
                    <Community />
                  </RequireAuth>
                }
              />
              <Route
                path="/messages"
                element={
                  <RequireAuth>
                    <Messages />
                  </RequireAuth>
                }
              />
              <Route
                path="/observatory"
                element={
                  <RequireAuth>
                    <Observatory />
                  </RequireAuth>
                }
              />
              <Route
                path="/practice"
                element={
                  <RequireAuth>
                    <Practice />
                  </RequireAuth>
                }
              />
              <Route
                path="/deeper"
                element={
                  <RequireAuth>
                    <Deeper />
                  </RequireAuth>
                }
              />
              <Route
                path="/evening"
                element={
                  <RequireAuth>
                    <Evening />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
