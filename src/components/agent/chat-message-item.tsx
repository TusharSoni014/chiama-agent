"use client";

import { memo, useLayoutEffect, useRef, type ReactNode } from "react";
import { isToolUIPart, type UIMessage } from "ai";
import type { OrbState } from "thinking-orbs";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageResponse } from "@/components/ai-elements/message";
import { CHIAMA_LOGO_URL } from "@/lib/brand";
import { AgentOrb } from "./agent-orb";
import { ChatToolCall } from "./chat-tool-call";
import { UserAvatar } from "./user-avatar";

interface ChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
  isPending?: boolean;
}

const RUNNING_TOOL_STATES = new Set(["input-streaming", "input-available"]);

function agentOrbState(
  message: UIMessage,
  isStreaming: boolean,
  isPending: boolean,
): { state: OrbState; paused: boolean } {
  const isUsingTool = message.parts.some(
    (part) => isToolUIPart(part) && RUNNING_TOOL_STATES.has(part.state),
  );
  if (isUsingTool || isPending) return { state: "searching", paused: false };
  if (isStreaming) return { state: "composing", paused: false };
  return { state: "breathing", paused: true };
}

/** Fades the thinking orb into the Chiama mark when a reply finishes. */
function AgentMark({ state, paused }: { state: OrbState; paused: boolean }) {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };

  return (
    <span className="relative size-8 shrink-0 self-end">
      <AnimatePresence initial={false}>
        {paused ? (
          <motion.div
            key="logo"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <Avatar>
              <AvatarImage src={CHIAMA_LOGO_URL} alt="Chiama" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </motion.div>
        ) : (
          <motion.div
            key={state}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <AgentOrb size={32} state={state} paused={paused} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Eases the bubble's height while streamed text grows, without scaling the text. */
function StreamingFrame({
  active,
  watch,
  children,
}: {
  active: boolean;
  watch: string;
  children: ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const next = inner.offsetHeight;
    if (!active || reduceMotion) {
      height.set("auto");
      return;
    }

    const current = height.get();
    if (typeof current !== "number" || Math.abs(current - next) < 1) {
      height.set(next);
      return;
    }

    const controls = animate(height, next, {
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1],
    });
    return () => controls.stop();
  }, [active, watch, height, reduceMotion]);

  return (
    <motion.div
      style={{ height }}
      className={active ? "min-w-0 flex-1 overflow-hidden" : "min-w-0 flex-1"}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}

export const ChatMessageItem = memo(
  ({
    message,
    isStreaming = false,
    isPending = false,
  }: ChatMessageItemProps) => {
    const isUser = message.role === "user";
    const orb = isUser ? null : agentOrbState(message, isStreaming, isPending);
    const content = (
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
    );

    return (
      <Message align={isUser ? "end" : "start"}>
        {isUser ? (
          <UserAvatar className="self-end" />
        ) : orb ? (
          <AgentMark state={orb.state} paused={orb.paused} />
        ) : null}
        {isUser ? (
          content
        ) : (
          <StreamingFrame
            active={isStreaming || isPending}
            watch={message.parts
              .map((part) =>
                part.type === "text"
                  ? part.text.length
                  : `${part.type}:${"state" in part ? part.state : ""}`,
              )
              .join(":")}
          >
            {content}
          </StreamingFrame>
        )}
      </Message>
    );
  },
);

ChatMessageItem.displayName = "ChatMessageItem";
