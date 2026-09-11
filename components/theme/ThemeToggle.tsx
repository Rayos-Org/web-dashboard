"use client";

import { useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** Show a text label next to the icon (used in the sidebar). */
  withLabel?: boolean;
}

/**
 * Animated light/dark switch.
 *
 * On supported browsers the new theme is revealed with a circular wipe that
 * originates from the button (View Transitions API). The icon itself
 * cross-fades and rotates with motion so the toggle still feels alive when
 * the browser has no view-transition support.
 */
export function ThemeToggle({ className, withLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // next-themes reads localStorage synchronously on the client, so the first
  // client render can disagree with the server. Render the dark (default) icon
  // until hydration completes to avoid a mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isDark = mounted ? resolvedTheme !== "light" : true;

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || prefersReduced) {
      setTheme(next);
      return;
    }

    // Seed the reveal origin + radius so the CSS keyframe can use them.
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const root = document.documentElement;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${r}px`);

    doc.startViewTransition(() => setTheme(next));
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "group relative inline-flex h-10 items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        withLabel ? "w-full justify-start px-3" : "w-10 justify-center",
        className
      )}
    >
      <span className="relative flex size-5 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="size-[18px] text-indigo-300" />
            ) : (
              <Sun className="size-[18px] text-amber-500" />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      {withLabel && <span>{isDark ? "Dark mode" : "Light mode"}</span>}
    </button>
  );
}
