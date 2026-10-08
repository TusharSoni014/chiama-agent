"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
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
import { ChatLoader } from "./chat-loader";
import { ChatSidebar } from "./chat-sidebar";
import { CallScreen } from "./call/call-screen";
import type { AgentView, ChatThread } from "./types";

type ChatPanel =
  | { type: "draft"; id: string; urlLive: boolean }
  | { type: "saved"; id: string };

function createDraft(): ChatPanel {
  return { type: "draft", id: crypto.randomUUID(), urlLive: false };
}

function readChatId(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export function AgentWorkspace({ children }: { children: ReactNode }) {
  const threads = useChatThreads();
  const { isLoading, error, refresh, removeThread } = threads;
  const router = useRouter();
  const reloadChat = useAgentStore((state) => state.reloadChat);

  // `/agent` is an empty draft. `/agent/<id>` is a saved chat, or a draft whose
  // first message just created that id. The chat stays mounted here so that
  // URL change does not reset the reply that is already streaming.
  const chatId = readChatId(useParams().chatId);
  const [panel, setPanel] = useState<ChatPanel>(() =>
    chatId ? { type: "saved", id: chatId } : createDraft(),
  );
  const seenUrl = useRef(chatId ?? null);
  const urlId = chatId ?? null;

  if (seenUrl.current !== urlId) {
    seenUrl.current = urlId;
    if (urlId == null) {
      if (panel.type !== "draft") setPanel(createDraft());
    } else if (panel.type === "draft" && panel.id === urlId) {
      if (!panel.urlLive) setPanel({ ...panel, urlLive: true });
    } else if (!(panel.type === "saved" && panel.id === urlId)) {
      setPanel({ type: "saved", id: urlId });
    }
  }

  const openChatId =
    panel.type === "saved" || panel.urlLive ? panel.id : undefined;

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

  const publishDraft = useCallback(
    (id: string) => {
      setPanel((current) =>
        current.type === "draft" && current.id === id
          ? { ...current, urlLive: true }
          : current,
      );
      if (chatId !== id) router.replace(`/agent/${id}`, { scroll: false });
    },
    [chatId, router],
  );

  // A saved call adds messages to the chat, so reload it from the server.
  // A call on a new chat is what creates that chat's URL.
  const handleCallSaved = useCallback(() => {
    if (panel.type === "draft") publishDraft(panel.id);
    reloadChat();
    void refresh();
  }, [panel, publishDraft, reloadChat, refresh]);

  // A new chat keeps the plain `/agent` URL until it has something to save.
  const handleNewChat = useCallback(() => {
    setView("chat");
    setPanel(createDraft());
    router.push("/agent", { scroll: false });
  }, [router]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setView("chat");
      if (panel.type === "draft" && panel.id === threadId) {
        publishDraft(threadId);
        return;
      }
      setPanel({ type: "saved", id: threadId });
      router.push(`/agent/${threadId}`, { scroll: false });
    },
    [panel, publishDraft, router],
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
      if (openChatId && threadToDelete.id === openChatId) {
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
  }, [threadToDelete, removeThread, openChatId, handleNewChat]);

  return (
    <ChatThreadsContext.Provider value={threads}>
      <SidebarProvider>
        <ChatSidebar
          threads={threads.threads}
          isLoading={isLoading}
          error={error}
          activeThreadId={openChatId}
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
              <ChatLoader
                key={panel.id}
                chatId={panel.id}
                fresh={panel.type === "draft"}
                onFirstMessage={
                  panel.type === "draft"
                    ? () => publishDraft(panel.id)
                    : undefined
                }
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
                    threadId={panel.id}
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
