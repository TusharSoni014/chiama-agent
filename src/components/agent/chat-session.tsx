"use client";

import { useThreadHistory } from "@/hooks/use-thread-history";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatConversation } from "./chat-conversation";
import { ChatErrorAlert } from "./chat-error-alert";
import type { ActiveChat } from "./types";

interface ChatSessionProps {
  chat: ActiveChat;
  onMessageSent: (text: string) => void;
  onTurnFinished: () => void;
}

/**
 * Loads a conversation's saved messages before handing over to the live chat.
 * Mount it with `key={chat.id}` so every conversation starts from a clean state.
 */
export function ChatSession({
  chat,
  onMessageSent,
  onTurnFinished,
}: ChatSessionProps) {
  const history = useThreadHistory(chat.id, chat.isDraft);

  if (history.status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <Skeleton className="ml-auto h-10 w-2/5" />
        <Skeleton className="h-20 w-4/5" />
        <Skeleton className="ml-auto h-10 w-1/3" />
      </div>
    );
  }

  if (history.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <ChatErrorAlert
          title="Could not open this conversation"
          error={new Error(history.message)}
        />
      </div>
    );
  }

  return (
    <ChatConversation
      threadId={chat.id}
      initialMessages={history.messages}
      onMessageSent={onMessageSent}
      onTurnFinished={onTurnFinished}
    />
  );
}
