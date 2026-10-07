"use client";

import type { ChatStatus, UIMessage } from "ai";
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

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const lastIndex = messages.length - 1;
  const lastMessage = messages[lastIndex];
  const showThinking =
    status === "submitted" && lastMessage?.role !== "assistant";

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
                <ChatMessageItem
                  message={message}
                  isStreaming={status === "streaming" && index === lastIndex}
                  isPending={status === "submitted" && index === lastIndex}
                />
              </MessageScrollerItem>
            ))}

            {showThinking && (
              <MessageScrollerItem messageId="pending-response">
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
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
