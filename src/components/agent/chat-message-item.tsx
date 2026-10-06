"use client";

import { memo } from "react";
import type { UIMessage } from "ai";
import type { ToolUIPart } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

interface ChatMessageItemProps {
  message: UIMessage;
}

export const ChatMessageItem = memo(({ message }: ChatMessageItemProps) => {
  if (!message.parts || message.parts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-2">
      {message.parts.map((part, index) => {
        const partKey = `${message.id}-${index}`;

        if (part.type === "text") {
          return (
            <Message key={partKey} from={message.role}>
              <MessageContent>
                <MessageResponse>{part.text}</MessageResponse>
              </MessageContent>
            </Message>
          );
        }

        if (part.type?.startsWith("tool-")) {
          const toolPart = part as ToolUIPart;
          return (
            <Tool key={partKey} className="my-2">
              <ToolHeader
                type={toolPart.type}
                state={toolPart.state || "output-available"}
                className="cursor-pointer"
              />
              <ToolContent>
                <ToolInput input={toolPart.input || {}} />
                <ToolOutput
                  output={toolPart.output}
                  errorText={toolPart.errorText}
                />
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </div>
  );
});

ChatMessageItem.displayName = "ChatMessageItem";
