"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ComponentProps, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends Omit<ComponentProps<typeof motion.div>, "children"> {
  /** Max tilt in degrees. */
  max?: number;
  children?: ReactNode;
}

/** 3-D tilt on hover with a travelling sheen. Desktop-only interaction. */
export function TiltCard({ className, max = 8, children, ...props }: TiltCardProps) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 22 });
  const sheen = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(420px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgb(255 255 255 / 0.14), transparent 55%)`
  );

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn("relative [perspective:1200px]", className)}
      {...props}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: sheen }}
      />
    </motion.div>
  );
}
