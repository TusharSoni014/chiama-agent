"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatErrorAlertProps {
  title: string;
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const FALLBACK_MESSAGE =
  "Something went wrong while contacting the assistant. Check that the model server is running and try again.";

/** Turns transport errors (plain text or a JSON body) into a readable sentence. */
function describeError(error: Error) {
  const raw = error.message?.trim();
  if (!raw) return FALLBACK_MESSAGE;

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      const message = parsed?.error?.message ?? parsed?.error ?? parsed?.message;
      if (typeof message === "string" && message) return message;
    } catch {
      // Not JSON, show the raw message below.
    }
  }

  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return "Could not reach the server. Check your connection and try again.";
  }

  return raw;
}

export function ChatErrorAlert({
  title,
  error,
  onRetry,
  onDismiss,
}: ChatErrorAlertProps) {
  const hasActions = Boolean(onRetry || onDismiss);

  return (
    <Alert
      variant="destructive"
      className={cn(hasActions && "has-data-[slot=alert-action]:pr-28")}
    >
      <HugeiconsIcon icon={Alert02Icon} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{describeError(error)}</AlertDescription>
      {hasActions && (
        <AlertAction className="flex items-center gap-1">
          {onRetry && (
            <Button variant="outline" size="xs" onClick={onRetry}>
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              aria-label="Dismiss error"
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Button>
          )}
        </AlertAction>
      )}
    </Alert>
  );
}
