"use client";

import { useRef } from "react";
import type { ChatStatus, UIMessage } from "ai";
import { motion, useReducedMotion } from "motion/react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { AgentOrb } from "./agent-orb";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: ChatStatus;
}

const enter = {
  initial: { opacity: 0, filter: "blur(5px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const reduceMotion = useReducedMotion();
  const lastIndex = messages.length - 1;
  const lastMessage = messages[lastIndex];
  const showThinking =
    status === "submitted" && lastMessage?.role !== "assistant";
  // Messages already on screen when a saved chat opens should not replay.
  const quietIds = useRef<Set<string> | null>(null);
  if (quietIds.current === null) {
    quietIds.current =
      status === "ready"
        ? new Set(messages.map((message) => message.id))
        : new Set();
  }
  const settledIds = quietIds.current;

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map((message, index) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <motion.div
                  initial={
                    reduceMotion || settledIds.has(message.id)
                      ? false
                      : enter.initial
                  }
                  animate={enter.animate}
                  transition={enter.transition}
                >
                  <ChatMessageItem
                    message={message}
                    isStreaming={status === "streaming" && index === lastIndex}
                    isPending={status === "submitted" && index === lastIndex}
                  />
                </motion.div>
              </MessageScrollerItem>
            ))}

            {showThinking && (
              <MessageScrollerItem messageId="pending-response">
                <motion.div
                  initial={reduceMotion ? false : enter.initial}
                  animate={enter.animate}
                  transition={enter.transition}
                >
                  <Message>
                    <span className="flex size-8 shrink-0 items-center justify-center self-end">
                      <AgentOrb state="searching" size={32} />
                    </span>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent>Thinking</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </motion.div>
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
