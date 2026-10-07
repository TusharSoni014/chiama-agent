"use client";

import { memo } from "react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { getToolName } from "ai";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type ToolPart = ToolUIPart | DynamicToolUIPart;

interface ChatToolCallProps {
  part: ToolPart;
}

const RUNNING_STATES: ReadonlyArray<ToolPart["state"]> = [
  "input-streaming",
  "input-available",
];

function formatToolName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export const ChatToolCall = memo(({ part }: ChatToolCallProps) => {
  const running = RUNNING_STATES.includes(part.state);
  const failed =
    part.state === "output-error" || part.state === "output-denied";

  return (
    <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-muted/50 px-3.5 py-2 text-sm ring-1 ring-foreground/5">
      <span className="min-w-0 flex-1 truncate font-medium">
        {formatToolName(getToolName(part))}
      </span>
      {running ? (
        <Badge variant="secondary">
          <Spinner />
          Running
        </Badge>
      ) : failed ? (
        <Badge variant="destructive">Failed</Badge>
      ) : (
        <Badge variant="outline">Completed</Badge>
      )}
    </div>
  );
});

ChatToolCall.displayName = "ChatToolCall";
