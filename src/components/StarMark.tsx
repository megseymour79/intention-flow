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
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#101a2e] to-[#050a16] ring-1 ring-white/15",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* tiny background stars */}
      <span
        className="absolute rounded-full bg-blue-100/70"
        style={{
          width: Math.max(1.5, size * 0.045),
          height: Math.max(1.5, size * 0.045),
          top: size * 0.18,
          left: size * 0.16,
        }}
      />
      <span
        className="absolute rounded-full bg-slate-200/50"
        style={{
          width: Math.max(1, size * 0.035),
          height: Math.max(1, size * 0.035),
          bottom: size * 0.16,
          right: size * 0.14,
        }}
      />
      {/* the star */}
      <span
        className="relative text-center font-bold leading-none"
        style={{
          fontSize: size * 0.5,
          lineHeight: 1,
          color: "#e8eeff",
          textShadow:
            "0 0 8px rgba(200,218,255,0.9), 0 0 18px rgba(160,190,255,0.45)",
          transform: "translateY(-2%)",
        }}
      >
        ✦
      </span>
    </div>
  );
}
