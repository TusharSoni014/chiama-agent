"use client";

import { useCallback, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useChatThreads } from "@/hooks/use-chat-threads";
import { toChatTitle } from "@/lib/chat-title";
import { ChatDeleteDialog } from "./chat-delete-dialog";
import { ChatHeader } from "./chat-header";
import { ChatSession } from "./chat-session";
import { ChatSidebar } from "./chat-sidebar";
import type { ActiveChat, ChatThread } from "./types";

const createDraftChat = (): ActiveChat => ({
  id: crypto.randomUUID(),
  isDraft: true,
});

export function AgentWorkspace() {
  const { threads, isLoading, error, refresh, addThread, removeThread } =
    useChatThreads();

  // Always start on a fresh draft so there is a valid thread id before the first message.
  const [activeChat, setActiveChat] = useState<ActiveChat>(createDraftChat);
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const activeChatId = activeChat.id;

  const handleNewChat = useCallback(() => {
    setActiveChat(createDraftChat());
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveChat((prev) =>
      prev.id === threadId ? prev : { id: threadId, isDraft: false }
    );
  }, []);

  const handleMessageSent = useCallback(
    (text: string) => {
      const now = new Date().toISOString();
      addThread({
        id: activeChatId,
        title: toChatTitle(text),
        createdAt: now,
        updatedAt: now,
      });
    },
    [activeChatId, addThread]
  );

  const handleRequestDelete = useCallback((thread: ChatThread) => {
    setDeleteError(null);
    setThreadToDelete(thread);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!threadToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await removeThread(threadToDelete.id);
      if (threadToDelete.id === activeChatId) {
        handleNewChat();
      }
      setThreadToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete the conversation."
      );
    } finally {
      setIsDeleting(false);
    }
  }, [threadToDelete, removeThread, activeChatId, handleNewChat]);

  return (
    <SidebarProvider>
      <ChatSidebar
        threads={threads}
        isLoading={isLoading}
        error={error}
        activeThreadId={activeChatId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onRequestDelete={handleRequestDelete}
      />

      <SidebarInset className="h-svh min-w-0 overflow-hidden">
        <ChatHeader onNewChat={handleNewChat} />
        <ChatSession
          key={activeChatId}
          chat={activeChat}
          onMessageSent={handleMessageSent}
          onTurnFinished={refresh}
        />
      </SidebarInset>

      <ChatDeleteDialog
        thread={threadToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={() => setThreadToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </SidebarProvider>
  );
}
