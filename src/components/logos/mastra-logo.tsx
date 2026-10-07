import type { SVGProps } from "react";

export function MastraLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="Mastra logo"
      className={`size-4 shrink-0 overflow-visible fill-white ${className ?? ""}`}
      {...props}
    >
      <path d="M2.2 20V4.2L8 12.1 12 6.6l4 5.5L21.8 4.2V20h-3.1v-8.6L16 14.2 12 8.8 8 14.2 5.3 11.4V20H2.2Z" />
    </svg>
  );
}
