"use client";

import { memo } from "react";
import { useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { CHIAMA_LOGO_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ChatSidebarUser } from "./chat-sidebar-user";
import type { ChatThread } from "./types";
import Link from "next/link";

// Fixed widths (not random) so server and client render the same markup.
const SKELETON_WIDTHS = ["w-4/5", "w-3/5", "w-11/12", "w-2/3"];

interface ChatSidebarProps {
  threads: ChatThread[];
  isLoading: boolean;
  error: string | null;
  activeThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onRequestDelete: (thread: ChatThread) => void;
}

export const ChatSidebar = memo(
  ({
    threads,
    isLoading,
    error,
    activeThreadId,
    onSelectThread,
    onNewChat,
    onRequestDelete,
  }: ChatSidebarProps) => {
    const { isMobile, setOpenMobile } = useSidebar();
    const { status: sessionStatus } = useSession();

    const closeOnMobile = () => {
      if (isMobile) setOpenMobile(false);
    };

    const showEmptyHistory = !isLoading && !error && threads.length === 0;

    return (
      <Sidebar
        className="rounded-tr-xl overflow-hidden rounded-br-xl"
        collapsible="offcanvas"
      >
        <SidebarHeader className="gap-3 p-3">
          <Link href="/">
            <div className="flex items-center gap-2.5 px-1">
              <Avatar className="size-7">
                <AvatarImage src={CHIAMA_LOGO_URL} alt="Chiama" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold tracking-tight">
                Chiama Agent
              </span>
            </div>
          </Link>
          <Button className="w-full justify-start"
            onClick={() => {
              onNewChat();
              closeOnMobile();
            }}
          >
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
            New chat
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading &&
                  SKELETON_WIDTHS.map((width) => (
                    <SidebarMenuItem key={width}>
                      <Skeleton className={cn("my-1.5 h-5", width)} />
                    </SidebarMenuItem>
                  ))}

                {!isLoading && error && (
                  <li className="px-3 py-2 text-xs text-destructive">
                    {error}
                  </li>
                )}

                {showEmptyHistory && sessionStatus === "unauthenticated" && (
                  <li className="px-1 py-1">
                    <div className="rounded-xl bg-sidebar-accent p-3 ring-1 ring-sidebar-border">
                      <p className="text-xs leading-relaxed text-sidebar-foreground">
                        Log in from the button below to save your chats to
                        your account.
                      </p>
                    </div>
                  </li>
                )}

                {showEmptyHistory && sessionStatus === "authenticated" && (
                  <li className="px-3 py-2 text-xs text-muted-foreground">
                    No conversations yet.
                  </li>
                )}

                {threads.map((thread) => {
                  const title = thread.title?.trim() || "Untitled chat";

                  return (
                    <SidebarMenuItem key={thread.id}>
                      <SidebarMenuButton
                        isActive={thread.id === activeThreadId}
                        onClick={() => {
                          onSelectThread(thread.id);
                          closeOnMobile();
                        }}
                      >
                        <span>{title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        showOnHover
                        aria-label={`Delete conversation: ${title}`}
                        onClick={() => onRequestDelete(thread)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <ChatSidebarUser />
        </SidebarFooter>
      </Sidebar>
    );
  },
);

ChatSidebar.displayName = "ChatSidebar";
