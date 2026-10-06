"use client";

import { memo } from "react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { getToolName } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

function formatJson(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function StatusBadge({ state }: { state: ToolPart["state"] }) {
  if (RUNNING_STATES.includes(state)) {
    return (
      <Badge variant="secondary">
        <Spinner />
        Running
      </Badge>
    );
  }
  if (state === "output-error" || state === "output-denied") {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="outline">Completed</Badge>;
}

function Section({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">
        {formatJson(value)}
      </pre>
    </div>
  );
}

export const ChatToolCall = memo(({ part }: ChatToolCallProps) => {
  const hasInput = part.input !== undefined && part.input !== null;
  const hasOutput = part.output !== undefined && part.output !== null;
  const errorText = "errorText" in part ? part.errorText : undefined;

  return (
    <Collapsible className="w-full max-w-xl rounded-xl border bg-card text-card-foreground">
      <CollapsibleTrigger className="group/tool flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-xl">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="truncate font-medium">
            {formatToolName(getToolName(part))}
          </span>
          <StatusBadge state={part.state} />
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-4 shrink-0 text-muted-foreground group-data-[panel-open]/tool:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 border-t px-3.5 py-3">
          {hasInput && <Section label="Input" value={part.input} />}
          {hasOutput && <Section label="Output" value={part.output} />}
          {errorText && (
            <p className="text-sm text-destructive">{errorText}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

ChatToolCall.displayName = "ChatToolCall";
