"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThinkingOrb, type OrbSize, type OrbState } from "thinking-orbs";
import { cn } from "cn";

interface AgentOrbProps {
  state?: OrbState;
  size?: OrbSize;
  paused?: boolean;
  label?: string;
  className?: string;
}

const SIZE_CLASS: Record<OrbSize, string> = {
  64: "size-16",
  32: "size-8",
  20: "size-5",
};

/** Agent presence from the thinking-orbs library. The app is always dark. */
export function AgentOrb({
  state = "breathing",
  size = 64,
  paused = false,
  label,
  className,
}: AgentOrbProps) {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };

  return (
    <span className={cn("relative inline-flex shrink-0", SIZE_CLASS[size], className)}>
      <AnimatePresence initial={false}>
        <motion.div
          key={state}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          <ThinkingOrb
            state={state}
            size={size}
            theme="dark"
            paused={paused}
            aria-label={label}
          />
        </motion.div>
      </AnimatePresence>
    </span>
  );
}
