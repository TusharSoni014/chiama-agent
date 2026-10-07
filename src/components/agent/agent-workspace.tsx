"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useAgentStore } from "@/stores/agent-store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useChatThreads } from "@/hooks/use-chat-threads";
import { toChatTitle } from "@/lib/chat-title";
import { ChatCommandDialog } from "./chat-command-dialog";
import { ChatDeleteDialog } from "./chat-delete-dialog";
import { HelpDialog } from "./help-dialog";
import { UserSettingsDialog } from "./user-settings-dialog";
import { ChatHeader } from "./chat-header";
import { ChatSession } from "./chat-session";
import { ChatSidebar } from "./chat-sidebar";
import { CallScreen } from "./call/call-screen";
import type { ActiveChat, AgentView, ChatThread } from "./types";

const createDraftChat = (): ActiveChat => ({
  id: crypto.randomUUID(),
  isDraft: true,
});

export function AgentWorkspace() {
  const { threads, isLoading, error, refresh, addThread, removeThread } =
    useChatThreads();

  // Always start on a fresh draft so there is a valid thread id before the first message.
  const [activeChat, setActiveChat] = useState<ActiveChat>(createDraftChat);
  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === "authenticated";
  const [view, setView] = useState<AgentView>("chat");  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const };
  const setHelpOpen = useAgentStore((state) => state.setHelpOpen);
  useEffect(() => {
    if (sessionStatus === "unauthenticated") setHelpOpen(true);
  }, [sessionStatus, setHelpOpen]);

  const activeChatId = activeChat.id;

  // A saved call adds messages behind the hidden chat, so reopen it from the server.
  const [chatRevision, setChatRevision] = useState(0);
  const handleCallSaved = useCallback(() => {
    setActiveChat((prev) => (prev.isDraft ? { ...prev, isDraft: false } : prev));
    setChatRevision((revision) => revision + 1);
    void refresh();
  }, [refresh]);

  const handleNewChat = useCallback(() => {
    setView("chat");
    setActiveChat(createDraftChat());
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    setView("chat");
    setActiveChat((prev) =>
      prev.id === threadId ? prev : { id: threadId, isDraft: false }
    );
  }, []);

  const handleMessageSent = useCallback(
    (text: string) => {
      // Signed-out chats are not saved, so they never appear in the sidebar.
      if (!isSignedIn) return;
      const now = new Date().toISOString();
      addThread({
        id: activeChatId,
        title: toChatTitle(text),
        createdAt: now,
        updatedAt: now,
      });
    },
    [activeChatId, addThread, isSignedIn]
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
        <ChatHeader
          view={view}
          onNewChat={handleNewChat}
          onViewChange={setView}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Stays mounted behind the call so an in-flight reply is not lost. */}
          <motion.div
            className="absolute inset-0 flex min-h-0 flex-col"
            animate={{ opacity: view === "chat" ? 1 : 0 }}
            transition={fade}
            style={{ pointerEvents: view === "chat" ? "auto" : "none" }}
            aria-hidden={view !== "chat"}
          >
            <ChatSession
              key={`${activeChatId}:${chatRevision}`}
              chat={activeChat}
              onMessageSent={handleMessageSent}
              onTurnFinished={refresh}
            />
          </motion.div>
          <AnimatePresence>
            {view === "call" && (
              <motion.div
                key="call"
                className="absolute inset-0 flex min-h-0 flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                <CallScreen
                  threadId={activeChatId}
                  persist={isSignedIn}
                  onTranscriptSaved={handleCallSaved}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarInset>

      <ChatCommandDialog
        threads={threads}
        isLoading={isLoading}
        error={error}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />

      <HelpDialog signedIn={isSignedIn} />
      <UserSettingsDialog />

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
