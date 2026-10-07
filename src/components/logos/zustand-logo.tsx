import type { SVGProps } from "react";

export function ZustandLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="Zustand logo"
      className={`size-4 shrink-0 overflow-visible fill-none stroke-zinc-200 ${className ?? ""}`}
      {...props}
    >
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.2 7.2a2.2 2.2 0 0 0-1.7 2.2c.2 1 .9 1.7 1.8 1.9A6.6 6.6 0 0 0 5.6 16c0 3.2 2.9 5.6 6.4 5.6s6.4-2.4 6.4-5.6a6.6 6.6 0 0 0-2.7-4.7c.9-.2 1.6-.9 1.8-1.9a2.2 2.2 0 0 0-1.7-2.2c-.8 0-1.5.4-1.9 1.1A7 7 0 0 0 12 7.6c-.7 0-1.4.1-2 .4-.4-.7-1.1-1.1-1.8-.8Z"
      />
      <circle cx="9.7" cy="14.2" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.3" cy="14.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
