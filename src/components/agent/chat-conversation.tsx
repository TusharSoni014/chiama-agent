"use client";

import { useCallback, useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useAgentStore } from "@/stores/agent-store";
import {
  getStoredOpenAIKey,
  isOpenAIUsageLimitError,
  OPENAI_KEY_HEADER,
  USAGE_LIMIT_HELP,
} from "@/lib/openai-key-storage";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatErrorAlert } from "./chat-error-alert";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ChatAgentId } from "@/lib/chat-agents";

interface ChatConversationProps {
  threadId: string;
  initialMessages: UIMessage[];
  /** Called as soon as the user sends a message. */
  onMessageSent: (text: string) => void;
  /** Called when a response finished or failed, so the thread list can refresh. */
  onTurnFinished: () => void;
}

const AGENT_PLACEHOLDERS: Record<ChatAgentId, string> = {
  "weather-agent": "Ask about the weather in any city",
  "tusharsoni-agent": "Ask anything about Tushar Soni",
};

export function ChatConversation({
  threadId,
  initialMessages,
  onMessageSent,
  onTurnFinished,
}: ChatConversationProps) {
  // Read at send time, so the agent can change mid-conversation.
  const agentId = useAgentStore((state) => state.selectedAgentId);
  const [input, setInput] = useState("");
  const { selectedAgentId } = useAgentStore();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        // Read at send time, so a key saved in Settings applies to the next message.
        headers: (): Record<string, string> => {
          const key = getStoredOpenAIKey();
          return key ? { [OPENAI_KEY_HEADER]: key } : {};
        },
      }),
    [threadId],
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
      void sendMessage({ text: trimmed }, { body: { agentId } });
      onMessageSent(trimmed);
    },
    [isBusy, clearError, sendMessage, onMessageSent, agentId],
  );

  const handleSubmit = useCallback(() => {
    send(input);
    setInput("");
  }, [input, send]);

  const setSettingsOpen = useAgentStore((state) => state.setSettingsOpen);
  const usageLimit =
    Boolean(error) &&
    !getStoredOpenAIKey() &&
    isOpenAIUsageLimitError(error?.message ?? "");

  const handleRetry = useCallback(() => {
    clearError();
    void regenerate({ body: { agentId } });
  }, [clearError, regenerate, agentId]);

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
            title={usageLimit ? "Usage limit reached" : "Message failed"}
            error={usageLimit ? new Error(USAGE_LIMIT_HELP) : error}
            retryLabel={usageLimit ? "Add OpenAI key" : undefined}
            onRetry={
              usageLimit
                ? () => setSettingsOpen(true)
                : messages.length > 0
                  ? handleRetry
                  : undefined
            }
            onDismiss={clearError}
          />
        </div>
      )}

      <ChatInput
        placeholder={AGENT_PLACEHOLDERS[selectedAgentId]}
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isBusy={isBusy}
      />
    </div>
  );
}
