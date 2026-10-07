"use client";

import { memo } from "react";
import { isToolUIPart, type UIMessage } from "ai";
import type { OrbState } from "thinking-orbs";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageResponse } from "@/components/ai-elements/message";
import { AgentOrb } from "./agent-orb";
import { ChatToolCall } from "./chat-tool-call";
import { UserAvatar } from "./user-avatar";

interface ChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

const RUNNING_TOOL_STATES = new Set(["input-streaming", "input-available"]);

function agentOrbState(
  message: UIMessage,
  isStreaming: boolean,
): { state: OrbState; paused: boolean } {
  const isUsingTool = message.parts.some(
    (part) => isToolUIPart(part) && RUNNING_TOOL_STATES.has(part.state),
  );
  if (isUsingTool) return { state: "searching", paused: false };
  if (isStreaming) return { state: "composing", paused: false };
  return { state: "breathing", paused: true };
}

export const ChatMessageItem = memo(
  ({ message, isStreaming = false }: ChatMessageItemProps) => {
    const isUser = message.role === "user";
    const orb = isUser ? null : agentOrbState(message, isStreaming);

    return (
      <Message align={isUser ? "end" : "start"}>
        {isUser ? (
          <UserAvatar className="self-end" />
        ) : orb ? (
          <span className="flex size-8 shrink-0 items-center justify-center self-end">
            <AgentOrb
              size={32}
              label={orb.paused ? "Agent" : undefined}
              state={orb.state}
              paused={orb.paused}
            />
          </span>
        ) : null}
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
                <Bubble key={key} variant="muted">
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
  },
);

ChatMessageItem.displayName = "ChatMessageItem";
