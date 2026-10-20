"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAgentStore } from "@/stores/agent-store";
import { ChatThreadsContext, useChatThreads } from "@/hooks/use-chat-threads";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { useDeleteThread } from "@/hooks/use-delete-thread";
import { AgentStage } from "./agent-stage";
import { ChatCommandDialog } from "./chat-command-dialog";
import { ChatDeleteDialog } from "./chat-delete-dialog";
import { HelpDialog } from "./help-dialog";
import { UserSettingsDialog } from "./user-settings-dialog";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import type { AgentView } from "./types";

/**
 * Everything on `/agent` and `/agent/<id>` lives here: sidebar, header, dialogs
 * and the chat/call area. It is the route layout (not the pages) so it stays
 * mounted when a new chat gets its URL, and the reply that is streaming is not
 * lost. See `src/app/agent/layout.tsx`.
 */
export function AgentWorkspace({ children }: { children: ReactNode }) {
  const threads = useChatThreads();
  const { isLoading, error, refresh, removeThread } = threads;
  const reloadChat = useAgentStore((state) => state.reloadChat);

  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === "authenticated";

  const [view, setView] = useState<AgentView>("chat");
  const { panel, openChatId, publishDraft, openThread, startNewChat } =
    useChatPanel();

  const handleNewChat = useCallback(() => {
    setView("chat");
    startNewChat();
  }, [startNewChat]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setView("chat");
      openThread(threadId);
    },
    [openThread],
  );

  const deletion = useDeleteThread({
    removeThread,
    openChatId,
    onOpenChatDeleted: handleNewChat,
  });

  // A saved call adds messages to the chat, so reload it from the server.
  // A call on a new chat is what creates that chat's URL.
  const handleCallSaved = useCallback(() => {
    if (panel.type === "draft") publishDraft(panel.id);
    reloadChat();
    void refresh();
  }, [panel, publishDraft, reloadChat, refresh]);

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
          onRequestDelete={deletion.requestDelete}
        />

        <SidebarInset className="h-svh min-w-0 overflow-hidden bg-black">
          <ChatHeader
            view={view}
            onNewChat={handleNewChat}
            onViewChange={setView}
          />
          <AgentStage
            view={view}
            panel={panel}
            isSignedIn={isSignedIn}
            onPublishDraft={publishDraft}
            onCallSaved={handleCallSaved}
          >
            {children}
          </AgentStage>
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
          thread={deletion.threadToDelete}
          isDeleting={deletion.isDeleting}
          error={deletion.error}
          onCancel={deletion.cancel}
          onConfirm={deletion.confirm}
        />
      </SidebarProvider>
    </ChatThreadsContext.Provider>
  );
}
