"use client";

import { useCallback, useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatErrorAlert } from "./chat-error-alert";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

interface ChatConversationProps {
  threadId: string;
  initialMessages: UIMessage[];
  /** Called as soon as the user sends a message. */
  onMessageSent: (text: string) => void;
  /** Called when a response finished or failed, so the thread list can refresh. */
  onTurnFinished: () => void;
}

export function ChatConversation({
  threadId,
  initialMessages,
  onMessageSent,
  onTurnFinished,
}: ChatConversationProps) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
      }),
    [threadId]
  );

  const { messages, sendMessage, regenerate, stop, status, error, clearError } =
    useChat({
      id: threadId,
      messages: initialMessages,
      transport,
      onFinish: () => onTurnFinished(),
      onError: () => onTurnFinished(),
    });

  const isBusy = status === "submitted" || status === "streaming";

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      clearError();
      void sendMessage({ text: trimmed });
      onMessageSent(trimmed);
    },
    [isBusy, clearError, sendMessage, onMessageSent]
  );

  const handleSubmit = useCallback(() => {
    send(input);
    setInput("");
  }, [input, send]);

  const handleRetry = useCallback(() => {
    clearError();
    void regenerate();
  }, [clearError, regenerate]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 overflow-y-auto px-4">
            <ChatEmptyState onSelectSuggestion={send} disabled={isBusy} />
          </div>
        ) : (
          <ChatMessages messages={messages} status={status} />
        )}
      </div>

      {error && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-2">
          <ChatErrorAlert
            title="Message failed"
            error={error}
            onRetry={messages.length > 0 ? handleRetry : undefined}
            onDismiss={clearError}
          />
        </div>
      )}

      <ChatInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isBusy={isBusy}
      />
    </div>
  );
}
