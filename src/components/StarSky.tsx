import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";
import { starColor } from "@/lib/shift-data";
import { moonPhase, skyEventFor } from "@/lib/sky-events";
import {
  AuroraBand,
  MoonPhase,
  PlanetPoint,
  StarBloom,
  TonightEvent,
  WishCaught,
  WishComet,
} from "@/components/SkyFeatures";

export interface SkyStarLike {
  _id: Id<"stars">;
  text: string;
  moment: string;
  emoji: string;
  colorKey: string;
  x: number; // 0-100 (% of container)
  y: number; // 0-100 (% of container)
  active: boolean;
}

interface StarSkyProps {
  stars: SkyStarLike[];
  onPick: (id: Id<"stars">) => void;
  onDrop: (id: Id<"stars">, x: number, y: number) => void;
  onRequestCreate: (x: number, y: number) => void;
  /** Present to render the black hole; called when it is clicked to dive deeper. */
  onDiveIn?: () => void;
  /** Render the real moon phase in the corner. */
  showMoon?: boolean;
  /** Enables tonight's event, aurora/planets, and the once-a-visit wish comet. */
  onCatchWish?: (starter: string, x: number, y: number) => void;
  /** Enables tap-able newborn stars on starbloom nights. */
  onCatchBloom?: (x: number, y: number) => void;
  /** Nova rank: a living nebula wash behind the stars. */
  deepSky?: boolean;
  /** Supernova rank: the focused star draws golden constellation lines. */
  golden?: boolean;
  hint?: string;
  className?: string;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  pointerX: number;
  pointerY: number;
  moved: boolean;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/* Decorative sky layers                                              */
/* ------------------------------------------------------------------ */

/** Faint background dots, split into two depth layers for parallax. */
function SkyDecor() {
  const layerBack = useRef<HTMLDivElement | null>(null);
  const layerFront = useRef<HTMLDivElement | null>(null);

  const dots = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        left: seeded(i, 11) * 100,
        top: seeded(i, 12) * 100,
        size: 0.8 + seeded(i, 13) * 1.5,
        delay: seeded(i, 14) * 8,
        duration: 4 + seeded(i, 15) * 7,
        bright: seeded(i, 16) > 0.86,
        depth: seeded(i, 17) > 0.5 ? "front" : "back",
      })),
    [],
  );

  // Pointer parallax: back layer drifts opposite the pointer, front layer with it.
  useEffect(() => {
    const host = layerBack.current?.parentElement;
    if (!host) return;
    const onMove = (e: PointerEvent) => {
      const box = host.getBoundingClientRect();
      if (box.width === 0) return;
      const nx = (e.clientX - box.left) / box.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - box.top) / box.height - 0.5;
      if (layerBack.current) {
        layerBack.current.style.transform = `translate(${nx * -10}px, ${ny * -8}px)`;
      }
      if (layerFront.current) {
        layerFront.current.style.transform = `translate(${nx * 16}px, ${ny * 12}px)`;
      }
    };
    host.addEventListener("pointermove", onMove);
    return () => host.removeEventListener("pointermove", onMove);
  }, []);

  const render = (depth: "back" | "front") =>
    dots
      .filter((d) => d.depth === depth)
      .map((d, i) => (
        <span
          key={`${depth}-${i}`}
          aria-hidden
          className={`pointer-events-none absolute rounded-full ${
            d.bright ? "animate-twinkle" : ""
          }`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.bright
              ? "rgba(226,236,255,0.95)"
              : "rgba(214,224,246,0.45)",
            boxShadow: d.bright ? "0 0 6px 1px rgba(226,236,255,0.4)" : undefined,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ));

  return (
    <>
      {/* milky way band — faint unresolved starlight across the upper sky */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(150% 60% at 75% -15%, rgba(196,208,235,0.06) 0%, rgba(196,208,235,0.024) 40%, transparent 68%)",
        }}
      />
      {/* horizon airglow along the bottom edge of the sky */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(30,44,70,0.5) 0%, rgba(22,34,56,0.2) 50%, transparent 100%)",
        }}
      />
      <div
        ref={layerBack}
        className="absolute inset-0 will-change-transform"
        style={{ transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
        aria-hidden
      >
        {render("back")}
      </div>
      <div
        ref={layerFront}
        className="absolute inset-0 will-change-transform"
        style={{ transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        aria-hidden
      >
        {render("front")}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shooting stars                                                     */
/* ------------------------------------------------------------------ */

interface Meteor {
  id: number;
  left: number; // %
  top: number; // %
  angle: number; // deg
  duration: number; // s
  delay: number; // s
}

/** An occasional shooting star streaking across the sky. */
function ShootingStars() {
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const id = nextId.current++;
      const m: Meteor = {
        id,
        left: 8 + Math.random() * 70,
        top: 4 + Math.random() * 40,
        angle: 24 + Math.random() * 26, // always downward-right-ish
        duration: 0.9 + Math.random() * 0.8,
        delay: 0,
      };
      setMeteors((prev) => [...prev.slice(-2), m]);
      setTimeout(() => {
        if (alive) setMeteors((prev) => prev.filter((x) => x.id !== id));
      }, (m.duration + 0.4) * 1000);
      schedule();
    };
    const schedule = () => {
      const wait = 9_000 + Math.random() * 14_000;
      timer = setTimeout(spawn, wait);
    };
    let timer: ReturnType<typeof setTimeout> = setTimeout(spawn, 4_500);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {meteors.map((m) => (
        <span
          key={m.id}
          aria-hidden
          className="animate-shoot pointer-events-none absolute h-px w-24 rounded-full"
          style={
            {
              left: `${m.left}%`,
              top: `${m.top}%`,
              background:
                "linear-gradient(90deg, rgba(235,244,255,0.95), rgba(180,205,245,0.5), transparent)",
              filter: "drop-shadow(0 0 4px rgba(200,220,255,0.7))",
              animationDuration: `${m.duration}s`,
              "--shoot-angle": `${m.angle}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The black hole — a gravitational lens, and the way down into the     */
/* deeper quizzes. Click it to fall in.                                 */
/* ------------------------------------------------------------------ */

/** A quiet gravitational lens in the sky. Click to dive deeper. */
function SkyVortex({ onDiveIn }: { onDiveIn: () => void }) {
  const [falling, setFalling] = useState(false);

  const fall = () => {
    if (falling) return;
    setFalling(true);
    // Let the fall play out (~700ms) before the quiz list opens.
    setTimeout(onDiveIn, 720);
  };

  return (
    <button
      type="button"
      aria-label="Dive into the black hole — open the deeper quizzes"
      title="Dive deeper"
      onClick={fall}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-none select-none outline-none"
      style={{ left: "88%", top: "20%" }}
    >
      {falling && (
        <>
          {/* the whole lens stretching into a thread as you fall through */}
          <span
            aria-hidden
            className="animate-dive absolute left-1/2 top-1/2 h-[148px] w-[148px] rounded-[50%]"
            style={{
              background:
                "radial-gradient(circle, #000 0%, #05070f 55%, rgba(120,150,230,0.14) 72%, transparent 78%)",
            }}
          />
          {/* its glow blown outward, dimming as the horizon swallows you */}
          <span
            aria-hidden
            className="animate-dive-fade absolute left-1/2 top-1/2 h-[148px] w-[148px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, transparent 46%, rgba(150,180,255,0.16) 58%, transparent 74%)",
            }}
          />
        </>
      )}

      {/* gravitational lensing halo — space bending around the void */}
      <span
        aria-hidden
        className="animate-horizon-breathe pointer-events-none absolute left-1/2 top-1/2 h-[168px] w-[168px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, transparent 26%, rgba(140,170,255,0.14) 38%, rgba(90,120,220,0.07) 48%, transparent 62%)",
        }}
      />

      {/* outer accretion disk — slow, cool, broad */}
      <span
        aria-hidden
        className="animate-swirl pointer-events-none absolute left-1/2 top-1/2 h-[132px] w-[132px] rounded-full blur-[4px]"
        style={{
          background:
            "conic-gradient(from 40deg, transparent 0deg, rgba(120,150,255,0.22) 70deg, rgba(210,225,255,0.38) 110deg, rgba(120,150,255,0.14) 160deg, transparent 235deg)",
        }}
      />
      {/* inner disk — counter-rotating, hotter, tighter */}
      <span
        aria-hidden
        className="animate-disk-counter pointer-events-none absolute left-1/2 top-1/2 h-[92px] w-[92px] rounded-full blur-[2px]"
        style={{
          background:
            "conic-gradient(from 200deg, transparent 0deg, rgba(255,246,230,0.5) 55deg, rgba(170,195,255,0.75) 95deg, rgba(255,235,205,0.4) 140deg, transparent 210deg)",
        }}
      />

      {/* the event horizon itself */}
      <span
        aria-hidden
        className="animate-horizon-breathe relative block h-[64px] w-[64px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, #0c101a 0%, #02040a 52%, #000 100%)",
          boxShadow:
            "0 0 30px 8px rgba(130,160,255,0.4), 0 0 80px 24px rgba(80,110,220,0.18), inset 0 0 16px 6px rgba(0,0,0,0.95)",
        }}
      />
      {/* the photon ring — the thin brilliant circle right at the edge */}
      <span
        aria-hidden
        className="animate-horizon-breathe absolute left-1/2 top-1/2 h-[64px] w-[64px] rounded-full"
        style={{
          border: "1.5px solid rgba(255,255,255,0.85)",
          boxShadow:
            "0 0 10px 1px rgba(255,255,255,0.5), 0 0 26px 3px rgba(160,185,255,0.35)",
        }}
      />

      {/* infalling motes — captured starlight spiraling into the horizon */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const d = seeded(i, 71);
        return (
          <span
            key={`infall-${i}`}
            aria-hidden
            className="animate-infall pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full"
            style={
              {
                background: "rgba(220,232,255,0.9)",
                boxShadow: "0 0 5px 1px rgba(190,210,255,0.7)",
                animationDuration: `${2.6 + d * 2.6}s`,
                animationDelay: `${d * 3.2}s`,
                "--fall-from": `${40 + d * 22}px`,
                "--fall-to": `${-180 - d * 160}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {/* slow pulse ring — the void announcing itself */}
      <span
        aria-hidden
        className="animate-vortex-pulse absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/35"
      />

      {/* the invitation — always visible, brighter on hover */}
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-blue-200/20 bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-blue-50/85 backdrop-blur-sm transition-colors duration-200 group-hover:border-blue-200/50 group-hover:text-white">
        dive deeper ↓
      </span>

      {/* a wider, generous grab area so the fall is easy to trigger */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Deep-sky backdrop — the Nova-rank nebula wash                        */
/* ------------------------------------------------------------------ */

/** A slow, living nebula that drifts behind the stars. Rank upgrade. */
function DeepSkyWash() {
  return (
    <div
      aria-hidden
      className="animate-nebula pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 42% at 20% 32%, rgba(129,90,220,0.11) 0%, transparent 70%)," +
            "radial-gradient(48% 38% at 76% 64%, rgba(34,150,190,0.10) 0%, transparent 72%)," +
            "radial-gradient(38% 32% at 52% 16%, rgba(219,120,180,0.07) 0%, transparent 70%)," +
            "radial-gradient(30% 26% at 88% 22%, rgba(90,110,220,0.08) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Constellation lines for the focused star                           */
/* ------------------------------------------------------------------ */

/** Draws soft lines from the active star to its 3 nearest neighbors. */
function Constellation({
  stars,
  live,
  golden,
}: {
  stars: SkyStarLike[];
  live: Record<string, { x: number; y: number }>;
  golden?: boolean;
}) {
  const active = stars.find((s) => s.active);
  if (!active || stars.length < 2) return null;

  const pos = (s: SkyStarLike) => live[s._id] ?? { x: s.x, y: s.y };
  const a = pos(active);

  const others = stars
    .filter((s) => s._id !== active._id)
    .map((s) => ({ s, d: Math.hypot(pos(s).x - a.x, pos(s).y - a.y) }))
    .sort((p, q) => p.d - q.d)
    .slice(0, 3);

  const color = starColor(active.colorKey);
  const stroke = golden ? "#fcd34d" : color.hex;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5]"
      width="100%"
      height="100%"
    >
      {others.map(({ s }) => {
        const b = pos(s);
        return (
          <line
            key={`line-${active._id}-${s._id}`}
            x1={`${a.x}%`}
            y1={`${a.y}%`}
            x2={`${b.x}%`}
            y2={`${b.y}%`}
            stroke={stroke}
            strokeOpacity={golden ? 0.5 : 0.22}
            strokeWidth={golden ? 1.4 : 1}
            strokeDasharray={golden ? undefined : "3 6"}
            style={{
              filter: golden
                ? "drop-shadow(0 0 5px rgba(252,211,77,0.65))"
                : `drop-shadow(0 0 3px ${color.glow})`,
            }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The interactive night sky                                          */
/* ------------------------------------------------------------------ */

/**
 * The interactive night sky. Stars hang at percentage coordinates; drag any
 * star to move it (persisted by the caller) and tap one to focus it.
 * Decor layers parallax with the pointer, meteors streak occasionally,
 * and the focused star draws a constellation to its nearest neighbors.
 */
export function StarSky({
  stars,
  onPick,
  onDrop,
  onRequestCreate,
  onDiveIn,
  showMoon,
  onCatchWish,
  onCatchBloom,
  deepSky,
  golden,
  hint,
  className,
}: StarSkyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const tapRef = useRef<{ x: number; y: number } | null>(null);

  // The sky is different every night — computed once per mount.
  const moon = useMemo(() => moonPhase(new Date()), []);
  const tonight = useMemo(() => skyEventFor(new Date()), []);
  const [eventDismissed, setEventDismissed] = useState(false);
  // One-time per session: point at the black hole so nobody misses the way down.
  const [showVortexHint, setShowVortexHint] = useState(() => {
    try {
      return sessionStorage.getItem("sm-vortex-hint") === null;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (!showVortexHint || !onDiveIn) return;
    const t = setTimeout(() => {
      setShowVortexHint(false);
      try {
        sessionStorage.setItem("sm-vortex-hint", "1");
      } catch {
        /* private mode — hint simply shows again next visit */
      }
    }, 9000);
    return () => clearTimeout(t);
  }, [showVortexHint, onDiveIn]);
  const [pendingWish, setPendingWish] = useState<{
    starter: string;
    x: number;
    y: number;
  } | null>(null);

  // Convert a point event inside the container into sky percentages.
  const pointToSky = (el: HTMLElement) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return null;
    const r = el.getBoundingClientRect();
    return {
      x: clamp(((r.left + r.width / 2 - box.left) / box.width) * 100, 4, 96),
      y: clamp(((r.top + r.height / 2 - box.top) / box.height) * 100, 6, 94),
    };
  };
  // Live drag positions keyed by star id, overriding the stored x/y while dragging
  const [live, setLive] = useState<Record<string, { x: number; y: number }>>({});

  const handleStarDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    star: SkyStarLike,
  ) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: star._id,
      startX: star.x,
      startY: star.y,
      pointerX: e.clientX,
      pointerY: e.clientY,
      moved: false,
    };
    setLive((l) => ({ ...l, [star._id]: { x: star.x, y: star.y } }));
  };

  const handleStarMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.pointerX;
    const dy = e.clientY - d.pointerY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const box = containerRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    const x = clamp(d.startX + (dx / box.width) * 100, 4, 96);
    const y = clamp(d.startY + (dy / box.height) * 100, 6, 94);
    setLive((l) => ({ ...l, [d.id]: { x, y } }));
  };

  const handleStarUp = (
    e: React.PointerEvent<HTMLButtonElement>,
    star: SkyStarLike,
  ) => {
    const d = dragRef.current;
    if (!d || d.id !== star._id) return;
    dragRef.current = null;
    const box = containerRef.current?.getBoundingClientRect();
    if (d.moved && box && box.width > 0 && box.height > 0) {
      const x = clamp(
        d.startX + ((e.clientX - d.pointerX) / box.width) * 100,
        4,
        96,
      );
      const y = clamp(
        d.startY + ((e.clientY - d.pointerY) / box.height) * 100,
        6,
        94,
      );
      onDrop(star._id, Math.round(x), Math.round(y));
    } else {
      onPick(star._id);
    }
    setLive((l) => {
      const next = { ...l };
      delete next[star._id];
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className={
        className ??
        "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#03050e] via-[#071026] to-[#0d1a33]"
      }
      onPointerDown={(e) => {
        // Remember where a press on empty sky began, so scrolls don't open the composer
        if (e.target === e.currentTarget) {
          tapRef.current = { x: e.clientX, y: e.clientY };
        }
      }}
      onPointerCancel={() => {
        tapRef.current = null;
      }}
      onPointerUp={(e) => {
        // Tap on empty sky (no drag) opens the composer at that spot
        const tap = tapRef.current;
        tapRef.current = null;
        if (e.target !== e.currentTarget || !tap) return;
        const dist = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
        if (dist > 10) return;
        const box = e.currentTarget.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        const x = clamp(((e.clientX - box.left) / box.width) * 100, 4, 96);
        const y = clamp(((e.clientY - box.top) / box.height) * 100, 6, 94);
        onRequestCreate(Math.round(x), Math.round(y));
      }}
    >
      <SkyDecor />
      {deepSky && <DeepSkyWash />}
      {/* a small ringed sentinel, drifting in the panel's upper-left dark */}
      <div
        aria-hidden
        className="animate-planet-drift pointer-events-none absolute left-[6%] top-[14%] z-[1]"
        style={{ animationDuration: "30s" }}
      >
        <div className="relative h-9 w-9">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 34% 30%, #ead2a4 0%, #b97f45 40%, #6b3f20 75%, #33200f 100%)",
              boxShadow:
                "0 0 12px 2px rgba(230,170,110,0.18), inset -3px -3px 8px rgba(0,0,10,0.55)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[22px] w-[46px] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%]"
            style={{
              border: "1.5px solid rgba(240,220,180,0.42)",
              clipPath: "polygon(0 0, 100% 0, 100% 48%, 0 48%)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[22px] w-[46px] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%]"
            style={{
              border: "1.5px solid rgba(250,235,200,0.6)",
              clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
            }}
          />
        </div>
      </div>
      <ShootingStars />
      <Constellation stars={stars} live={live} golden={golden} />
      {showMoon && <MoonPhase phase={moon.phase} />}
      {onCatchWish && !eventDismissed && (
        <TonightEvent event={tonight} onDismiss={() => setEventDismissed(true)} />
      )}
      {onCatchWish && tonight.kind === "aurora" && <AuroraBand />}
      {onCatchWish && tonight.kind === "planetrise" && tonight.planet && (
        <PlanetPoint name={tonight.planet} />
      )}
      {onCatchBloom && tonight.kind === "starbloom" && (
        <StarBloom onCatch={(x, y) => onCatchBloom(x, y)} />
      )}
      {onCatchWish && (
        <WishComet
          onCatch={(starter, e) => {
            const pos = pointToSky(e.currentTarget as HTMLElement);
            if (pos) setPendingWish({ starter, ...pos });
          }}
        />
      )}
      <WishCaught
        open={pendingWish !== null}
        starter={pendingWish?.starter ?? null}
        onClose={() => {
          if (pendingWish) {
            onCatchWish?.(pendingWish.starter, pendingWish.x, pendingWish.y);
          }
          setPendingWish(null);
        }}
      />
      {onDiveIn && <SkyVortex onDiveIn={onDiveIn} />}
      {onDiveIn && showVortexHint && (
        <motion.button
          type="button"
          aria-label="Open the deeper quizzes"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          onClick={onDiveIn}
          className="absolute z-20 max-w-[180px] rounded-2xl border border-blue-200/25 bg-black/60 p-3 text-left backdrop-blur-md transition-colors hover:border-blue-200/50"
          // Anchored beside the vortex (centered at 88% / 20%) — the arrow points into the void.
          style={{
            right: "calc(12% + 108px)",
            top: "calc(20% - 30px)",
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200/90">
            Something pulls
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-foreground/80">
            The black hole is a door. Step in and dive into the deeper quizzes.
          </span>
          <span
            aria-hidden
            className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-blue-200/25 bg-black/60"
          />
        </motion.button>
      )}
      {hint && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-amber-100/70 backdrop-blur-sm">
          {hint}
        </p>
      )}
      {stars.map((star, idx) => {
        const pos = live[star._id] ?? { x: star.x, y: star.y };
        const color = starColor(star.colorKey);
        const dragging = Boolean(live[star._id]);
        return (
          <button
            key={star._id}
            type="button"
            aria-label={star.text}
            title={star.text}
            onPointerDown={(e) => handleStarDown(e, star)}
            onPointerMove={handleStarMove}
            onPointerUp={(e) => handleStarUp(e, star)}
            onPointerCancel={() => {
              dragRef.current = null;
              setLive((l) => {
                const next = { ...l };
                delete next[star._id];
                return next;
              });
            }}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-none select-none outline-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              cursor: dragging ? "grabbing" : "grab",
            }}
          >
            <span
              className={`animate-star-pop flex items-center justify-center transition-transform duration-150 group-hover:scale-125 ${
                star.active ? "scale-110" : ""
              }`}
              style={{
                width: 52,
                height: 52,
                fontSize: star.active ? 34 : 27,
                color: color.hex,
                textShadow: `0 0 14px ${color.glow}, 0 0 34px ${color.glow}`,
                filter: star.active
                  ? "drop-shadow(0 0 10px rgba(255,255,255,0.35))"
                  : undefined,
                opacity: star.active || dragging ? 1 : 0.85,
                // gentle idle float, frozen while the star is being dragged
                animation: dragging
                  ? "none"
                  : `floaty ${4.5 + seeded(idx, 31) * 3.5}s ease-in-out ${seeded(idx, 32) * -6}s infinite`,
              }}
            >
              {star.emoji}
            </span>
            {star.active && (
              <span
                className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
                style={{
                  width: 66,
                  height: 66,
                  background: `radial-gradient(circle, ${color.glow}33 0%, transparent 70%)`,
                  boxShadow: `0 0 24px 4px ${color.glow}55`,
                }}
              />
            )}
            {/* label revealed for the focused star */}
            {star.active && (
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[11px] text-amber-50/90 backdrop-blur-sm">
                {star.text.length > 34 ? `${star.text.slice(0, 34)}…` : star.text}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
