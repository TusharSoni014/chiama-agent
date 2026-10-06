"use client";

import { memo } from "react";
import { isToolUIPart, type UIMessage } from "ai";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageResponse } from "@/components/ai-elements/message";
import { ChatToolCall } from "./chat-tool-call";

interface ChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

export const ChatMessageItem = memo(
  ({ message, isStreaming = false }: ChatMessageItemProps) => {
    const isUser = message.role === "user";

    return (
      <Message align={isUser ? "end" : "start"}>
        <MessageContent>
          {message.parts.map((part, index) => {
            const key = `${message.id}-${index}`;

            if (part.type === "text") {
              if (!part.text.trim()) return null;

              return isUser ? (
                <Bubble key={key} variant="secondary" align="end">
                  <BubbleContent className="whitespace-pre-wrap">
                    {part.text}
                  </BubbleContent>
                </Bubble>
              ) : (
                <Bubble key={key} variant="ghost">
                  <BubbleContent>
                    <MessageResponse isAnimating={isStreaming}>
                      {part.text}
                    </MessageResponse>
                  </BubbleContent>
                </Bubble>
              );
            }

            if (isToolUIPart(part)) {
              return <ChatToolCall key={key} part={part} />;
            }

            return null;
          })}
        </MessageContent>
      </Message>
    );
  }
);

ChatMessageItem.displayName = "ChatMessageItem";
