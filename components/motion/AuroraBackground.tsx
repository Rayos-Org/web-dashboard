"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  /** Show the subtle grid overlay (default true). */
  grid?: boolean;
  /** Attach a soft spotlight that follows the pointer (default true). */
  spotlight?: boolean;
  /** Overall glow strength multiplier. */
  intensity?: number;
}

/**
 * Ambient product backdrop: three slow-drifting colour blooms, an optional
 * fine grid, and a pointer-following spotlight. Colours come from the
 * --glow-* tokens so it re-tints automatically on theme switch.
 */
export function AuroraBackground({
  className,
  grid = true,
  spotlight = true,
  intensity = 1,
}: AuroraBackgroundProps) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const spot = useTransform(
    [sx, sy],
    ([x, y]) =>
      `radial-gradient(520px circle at ${x}px ${y}px, rgb(var(--glow-1) / calc(var(--glow-alpha) * 0.55)), transparent 70%)`
  );

  useEffect(() => {
    if (!spotlight) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, spotlight]);

  const alpha = (mult: number) => `calc(var(--glow-alpha) * ${mult * intensity})`;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {/* Blooms */}
      <div
        className="absolute -top-[20%] left-[8%] h-[60vmax] w-[60vmax] rounded-full blur-3xl animate-aurora"
        style={{
          background: `radial-gradient(closest-side, rgb(var(--glow-1) / ${alpha(1)}), transparent)`,
        }}
      />
      <div
        className="absolute top-[10%] right-[-10%] h-[55vmax] w-[55vmax] rounded-full blur-3xl animate-aurora"
        style={{
          animationDelay: "-6s",
          animationDirection: "alternate-reverse",
          background: `radial-gradient(closest-side, rgb(var(--glow-2) / ${alpha(0.85)}), transparent)`,
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[30%] h-[50vmax] w-[50vmax] rounded-full blur-3xl animate-aurora"
        style={{
          animationDelay: "-12s",
          background: `radial-gradient(closest-side, rgb(var(--glow-3) / ${alpha(0.7)}), transparent)`,
        }}
      />

      {/* Grid + vignette */}
      {grid && (
        <div
          className="absolute inset-0 bg-grid"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 65% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 65% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
      )}

      {/* Pointer spotlight */}
      {spotlight && (
        <motion.div className="absolute inset-0 hidden md:block" style={{ background: spot }} />
      )}
    </div>
  );
}
