import { cn } from "cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <HugeiconsIcon
        icon={Loading03Icon}
        strokeWidth={2}
        size={size}
        data-slot="spinner"
        className="animate-spin"
      />
    </div>
  );
}

export { Spinner };
