"use client";

import { useCallback, useState } from "react";
import type { ChatThread } from "@/components/agent/types";

interface UseDeleteThreadOptions {
  removeThread: (threadId: string) => Promise<void>;
  /** The chat currently on screen, if it has a URL. */
  openChatId: string | undefined;
  /** Called after the chat on screen was deleted, so the UI can leave it. */
  onOpenChatDeleted: () => void;
}

/** State for the "delete this conversation?" dialog. */
export function useDeleteThread({
  removeThread,
  openChatId,
  onOpenChatDeleted,
}: UseDeleteThreadOptions) {
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDelete = useCallback((thread: ChatThread) => {
    setError(null);
    setThreadToDelete(thread);
  }, []);

  const cancel = useCallback(() => setThreadToDelete(null), []);

  const confirm = useCallback(async () => {
    if (!threadToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await removeThread(threadToDelete.id);
      if (openChatId && threadToDelete.id === openChatId) onOpenChatDeleted();
      setThreadToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the conversation.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [threadToDelete, removeThread, openChatId, onOpenChatDeleted]);

  return { threadToDelete, isDeleting, error, requestDelete, cancel, confirm };
}
