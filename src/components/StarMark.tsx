import { cn } from "@/lib/utils";

interface StarMarkProps {
  size?: number;
  className?: string;
}

/** ShiftedMind brand badge — a star caught mid-twinkle over the night sky. */
export function StarMark({ size = 40, className }: StarMarkProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b1d5e] via-[#3b2a75] to-[#5b2a5e] ring-1 ring-white/15",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* tiny background stars */}
      <span
        className="absolute rounded-full bg-amber-100/70"
        style={{
          width: Math.max(2, size * 0.05),
          height: Math.max(2, size * 0.05),
          top: size * 0.18,
          left: size * 0.16,
        }}
      />
      <span
        className="absolute rounded-full bg-cyan-200/60"
        style={{
          width: Math.max(1.5, size * 0.04),
          height: Math.max(1.5, size * 0.04),
          bottom: size * 0.16,
          right: size * 0.14,
        }}
      />
      {/* the star */}
      <span
        className="relative text-center font-bold leading-none"
        style={{
          fontSize: size * 0.52,
          lineHeight: 1,
          color: "#fde68a",
          textShadow: "0 0 10px rgba(251,191,36,0.9), 0 0 22px rgba(251,191,36,0.5)",
          transform: "translateY(-2%)",
        }}
      >
        ✦
      </span>
    </div>
  );
}
