import { useMemo, useRef, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { starColor } from "@/lib/shift-data";

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

/** Decorative field of faint dots + nebula glows behind the user's stars. */
function SkyDecor({ starCount }: { starCount: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: seeded(i, 11) * 100,
        top: seeded(i, 12) * 100,
        size: 1 + seeded(i, 13) * 2.4,
        delay: seeded(i, 14) * 6,
        duration: 3 + seeded(i, 15) * 5,
        dim: seeded(i, 16) > 0.35,
      })),
    [],
  );
  void starCount;
  return (
    <>
      {/* nebula washes */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-rose-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      {dots.map((d, i) => (
        <span
          key={`decor-${i}`}
          aria-hidden
          className={`animate-twinkle pointer-events-none absolute rounded-full ${
            d.dim ? "bg-amber-50/40" : "bg-amber-100/80"
          }`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </>
  );
}

/**
 * The interactive night sky. Stars hang at percentage coordinates; drag any
 * star to move it (persisted by the caller) and tap one to focus it.
 */
export function StarSky({
  stars,
  onPick,
  onDrop,
  onRequestCreate,
  hint,
  className,
}: StarSkyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const tapRef = useRef<{ x: number; y: number } | null>(null);
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
        "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#120d2b] via-[#1b1245] to-[#2a1750]"
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
      <SkyDecor starCount={stars.length} />
      {hint && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-amber-100/70 backdrop-blur-sm">
          {hint}
        </p>
      )}
      {stars.map((star) => {
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
                filter: star.active ? "drop-shadow(0 0 10px rgba(255,255,255,0.35))" : undefined,
                opacity: star.active || dragging ? 1 : 0.85,
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
