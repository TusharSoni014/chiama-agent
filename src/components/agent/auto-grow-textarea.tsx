"use client";

import { useCallback, useLayoutEffect, useRef, type ComponentProps } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { InputGroupTextarea } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** Height of one line of text including its vertical padding (text-sm + py-3). */
const SINGLE_LINE_HEIGHT = 44;
const DEFAULT_MAX_HEIGHT = 192;

type AutoGrowTextareaProps = ComponentProps<typeof InputGroupTextarea> & {
  /** Height in px after which the textarea scrolls instead of growing. */
  maxHeight?: number;
};

/**
 * Starts as a single line and grows smoothly with its content.
 * The textarea snaps to its real height inside a clipping wrapper, and the
 * wrapper's height is animated with `motion`, so text never reflows mid-animation.
 */
export function AutoGrowTextarea({
  value,
  maxHeight = DEFAULT_MAX_HEIGHT,
  className,
  ...props
}: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMeasured = useRef(false);
  const lastWidth = useRef(0);
  const height = useMotionValue(SINGLE_LINE_HEIGHT);
  const reduceMotion = useReducedMotion();

  const resize = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;

    // Collapse first so scrollHeight reflects the content, not the old height.
    element.style.height = "auto";
    const next = Math.max(
      SINGLE_LINE_HEIGHT,
      Math.min(element.scrollHeight, maxHeight)
    );
    element.style.height = `${next}px`;

    if (!hasMeasured.current || reduceMotion) {
      height.set(next);
      hasMeasured.current = true;
      return;
    }

    animate(height, next, { duration: 0.2, ease: [0.23, 1, 0.32, 1] });
  }, [height, maxHeight, reduceMotion]);

  // Re-measure whenever the text changes (typing, pasting, clearing after send).
  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  // Re-measure when the available width changes, because wrapping changes with it.
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    lastWidth.current = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === lastWidth.current) return;
      lastWidth.current = element.clientWidth;
      resize();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [resize]);

  return (
    <motion.div style={{ height }} className="min-w-0 flex-1 overflow-hidden">
      <InputGroupTextarea
        ref={textareaRef}
        value={value}
        rows={1}
        className={cn(
          "field-sizing-fixed min-h-0 overflow-y-auto py-3 text-sm",
          className
        )}
        {...props}
      />
    </motion.div>
  );
}
