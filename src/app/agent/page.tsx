"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatSidebar } from "@/components/agent/chat-sidebar";
import { ChatHeader } from "@/components/agent/chat-header";
import { ChatSession } from "@/components/agent/chat-session";
import type { ChatThread } from "@/components/agent/types";

export default function AgentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads");
      if (!res.ok) return;
      const data: ChatThread[] = await res.json();
      setThreads(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch threads:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchThreads().then((initialThreads) => {
      if (initialThreads && initialThreads.length > 0) {
        setActiveThreadId(initialThreads[0].id);
      }
    });
  }, [fetchThreads]);

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    setActiveThreadId(newId);
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
  }, []);

  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      try {
        const res = await fetch(
          `/api/chat/threads?threadId=${encodeURIComponent(threadId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) return;

        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        if (activeThreadId === threadId) {
          handleNewChat();
        }
      } catch (err) {
        console.error("Failed to delete thread:", err);
      }
    },
    [activeThreadId, handleNewChat]
  );

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onNewChat={handleNewChat}
        />

        <ChatSession
          key={activeThreadId ?? "new-chat"}
          threadId={activeThreadId}
          onThreadActivity={fetchThreads}
        />
      </main>
    </div>
  );
}
