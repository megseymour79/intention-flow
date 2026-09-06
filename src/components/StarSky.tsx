import { useEffect, useMemo, useRef, useState } from "react";
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
/* The black hole — the way down into deeper quizzes                    */
/* ------------------------------------------------------------------ */

/** A quiet gravitational lens in the sky. Click to dive deeper. */
function SkyVortex({ onDiveIn }: { onDiveIn: () => void }) {
  return (
    <button
      type="button"
      aria-label="Dive into the black hole — open the deeper quizzes"
      title="Dive deeper"
      onClick={onDiveIn}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-none select-none outline-none"
      style={{ left: "88%", top: "18%" }}
    >
      {/* rotating accretion glow */}
      <span
        aria-hidden
        className="animate-swirl absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
        style={{
          background:
            "conic-gradient(from 40deg, transparent 0deg, rgba(150,180,255,0.35) 70deg, rgba(255,255,255,0.5) 110deg, rgba(150,180,255,0.2) 160deg, transparent 240deg)",
        }}
      />
      {/* the event horizon */}
      <span
        aria-hidden
        className="relative block h-9 w-9 rounded-full border border-white/25 transition-transform duration-200 group-hover:scale-110"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, #10141f 0%, #030408 55%, #000 100%)",
          boxShadow:
            "0 0 14px 2px rgba(140,170,255,0.35), inset 0 0 8px 2px rgba(0,0,0,0.9)",
        }}
      />
      {/* hint label on hover / focus */}
      <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[11px] text-amber-50/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        dive deeper ↓
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Constellation lines for the focused star                           */
/* ------------------------------------------------------------------ */

/** Draws soft lines from the active star to its 3 nearest neighbors. */
function Constellation({
  stars,
  live,
}: {
  stars: SkyStarLike[];
  live: Record<string, { x: number; y: number }>;
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
            stroke={color.hex}
            strokeOpacity={0.22}
            strokeWidth={1}
            strokeDasharray="3 6"
            style={{ filter: `drop-shadow(0 0 3px ${color.glow})` }}
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
      <ShootingStars />
      <Constellation stars={stars} live={live} />
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
