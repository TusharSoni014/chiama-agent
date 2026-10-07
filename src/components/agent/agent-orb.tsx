"use client";

import { ThinkingOrb, type OrbSize, type OrbState } from "thinking-orbs";

interface AgentOrbProps {
  state?: OrbState;
  size?: OrbSize;
  paused?: boolean;
  label?: string;
  className?: string;
}

/** Agent presence from the thinking-orbs library. The app is always dark. */
export function AgentOrb({
  state = "breathing",
  size = 64,
  paused = false,
  label,
  className,
}: AgentOrbProps) {
  return (
    <ThinkingOrb
      className={className}
      state={state}
      size={size}
      theme="dark"
      paused={paused}
      aria-label={label}
    />
  );
}
