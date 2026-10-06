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
import { Message, MessageContent } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: ChatStatus;
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const lastIndex = messages.length - 1;

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
                />
              </MessageScrollerItem>
            ))}

            {status === "submitted" && (
              <MessageScrollerItem messageId="pending-response">
                <Message>
                  <MessageContent>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner />
                      Thinking
                    </span>
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
