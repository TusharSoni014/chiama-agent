import type { SVGProps } from "react";

export function NeonLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="NeonDB logo"
      className={`size-4 shrink-0 overflow-visible fill-[#00e5bf] ${className ?? ""}`}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M6.2 3.2h11.6A2.6 2.6 0 0 1 20.4 5.8v12.4a2.6 2.6 0 0 1-2.6 2.6H6.2a2.6 2.6 0 0 1-2.6-2.6V5.8a2.6 2.6 0 0 1 2.6-2.6Zm2.3 4.1v9.4h2.15V12.1l3.15 4.6h2.15V7.3h-2.15v4.6l-3.15-4.6H8.5Z"
      />
    </svg>
  );
}
