"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease, delay },
  }),
};

interface RevealProps extends Omit<ComponentProps<typeof motion.div>, "variants"> {
  delay?: number;
  /** Trigger once when scrolled into view (default) or on mount. */
  mode?: "in-view" | "mount";
}

/** Fades + lifts its children into view. Use for section headings & cards. */
export function Reveal({ delay = 0, mode = "in-view", ...props }: RevealProps) {
  return (
    <motion.div
      variants={revealVariants}
      custom={delay}
      initial="hidden"
      {...(mode === "mount"
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-80px" } })}
      {...props}
    />
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

/** Parent that staggers each child wrapped in `<StaggerItem>`. */
export function Stagger(props: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      {...props}
    />
  );
}

export function StaggerItem(props: ComponentProps<typeof motion.div>) {
  return <motion.div variants={staggerItem} {...props} />;
}
