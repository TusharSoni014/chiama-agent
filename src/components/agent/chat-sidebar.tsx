"use client";

import { memo } from "react";
import { Plus, MessageSquare, Trash2, PanelLeftClose, Bot, LogOut } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatThread } from "./types";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
}

export const ChatSidebar = memo(
  ({
    isOpen,
    onToggle,
    threads,
    activeThreadId,
    onSelectThread,
    onNewChat,
    onDeleteThread,
  }: ChatSidebarProps) => {
    const { data: session } = useSession();

    if (!isOpen) {
      return null;
    }

    return (
      <aside className="w-72 h-full flex flex-col border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-all duration-300 shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Chiama Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            onClick={onNewChat}
            variant="secondary"
            className="w-full justify-start gap-2 shadow-xs font-medium"
          >
            <Plus className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>

        <div className="flex-1 min-h-0 px-2">
          <div className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            History
          </div>
          <ScrollArea className="h-[calc(100%-1.5rem)] pr-2">
            <div className="space-y-1 py-1">
              {threads.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No conversation history yet
                </p>
              ) : (
                threads.map((thread) => {
                  const isActive = activeThreadId === thread.id;
                  const displayTitle =
                    thread.title && thread.title.trim().length > 0
                      ? thread.title
                      : `Chat ${thread.id.slice(0, 8)}`;

                  return (
                    <div
                      key={thread.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}
                      onClick={() => onSelectThread(thread.id)}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="truncate">{displayTitle}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        aria-label="Delete chat"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          {session?.user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="size-7">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {session.user.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate text-xs">
                  <p className="font-medium truncate leading-tight">
                    {session.user.name ?? "User"}
                  </p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {session.user.email ?? session.user.id}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground shrink-0"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => signIn("google")}
            >
              Sign In with Google
            </Button>
          )}
        </div>
      </aside>
    );
  }
);

ChatSidebar.displayName = "ChatSidebar";
