"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAgentStore } from "@/stores/agent-store";
import { ChatThreadsContext, useChatThreads } from "@/hooks/use-chat-threads";
import { ChatCommandDialog } from "./chat-command-dialog";
import { ChatDeleteDialog } from "./chat-delete-dialog";
import { HelpDialog } from "./help-dialog";
import { UserSettingsDialog } from "./user-settings-dialog";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { CallScreen } from "./call/call-screen";
import type { AgentView, ChatThread } from "./types";

export function AgentWorkspace({ children }: { children: ReactNode }) {
  const threads = useChatThreads();
  const { isLoading, error, refresh, removeThread } = threads;
  const router = useRouter();
  const reloadChat = useAgentStore((state) => state.reloadChat);

  // The open chat is whatever id is in the URL: /agent/<chatId>.
  const { chatId } = useParams<{ chatId: string }>();
  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === "authenticated";
  const [view, setView] = useState<AgentView>("chat");
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const };

  // A saved call adds messages to the chat, so reload it from the server.
  const handleCallSaved = useCallback(() => {
    reloadChat();
    void refresh();
  }, [reloadChat, refresh]);

  // `/agent` redirects to a fresh chat id.
  const handleNewChat = useCallback(() => {
    setView("chat");
    router.push("/agent");
  }, [router]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setView("chat");
      router.push(`/agent/${threadId}`);
    },
    [router]
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
      if (threadToDelete.id === chatId) {
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
  }, [threadToDelete, removeThread, chatId, handleNewChat]);

  return (
    <ChatThreadsContext.Provider value={threads}>
      <SidebarProvider>
        <ChatSidebar
          threads={threads.threads}
          isLoading={isLoading}
          error={error}
          activeThreadId={chatId}
          onSelectThread={handleSelectThread}
          onNewChat={handleNewChat}
          onRequestDelete={handleRequestDelete}
        />

        <SidebarInset className="h-svh min-w-0 overflow-hidden bg-black">
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
              {children}
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
                    threadId={chatId}
                    persist={isSignedIn}
                    onTranscriptSaved={handleCallSaved}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SidebarInset>

        <ChatCommandDialog
          threads={threads.threads}
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
    </ChatThreadsContext.Provider>
  );
}
