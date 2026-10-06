"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ChatMessageItem } from "./chat-message-item";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatInput } from "./chat-input";

interface ChatSessionProps {
  threadId: string | null;
  onThreadActivity?: () => void;
}

export const ChatSession = ({
  threadId,
  onThreadActivity,
}: ChatSessionProps) => {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: threadId ? { threadId } : undefined,
      }),
    [threadId]
  );

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat?threadId=${encodeURIComponent(threadId)}`);
        if (!res.ok) return;
        const data: UIMessage[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load thread history:", err);
      }
    };

    loadHistory();
  }, [threadId, setMessages]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || isBusy) return;

    sendMessage({ text });
    setInput("");
    onThreadActivity?.();
  }, [input, isBusy, sendMessage, onThreadActivity]);

  const handleSelectSuggestion = useCallback(
    (promptText: string) => {
      if (isBusy) return;
      sendMessage({ text: promptText });
      onThreadActivity?.();
    },
    [isBusy, sendMessage, onThreadActivity]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <ChatEmptyState onSelectSuggestion={handleSelectSuggestion} />
        ) : (
          <Conversation className="max-w-3xl mx-auto h-full">
            <ConversationContent>
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              <ConversationScrollButton />
            </ConversationContent>
          </Conversation>
        )}
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isBusy={isBusy}
      />
    </div>
  );
};
