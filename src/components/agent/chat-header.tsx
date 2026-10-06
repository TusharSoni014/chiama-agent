"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  Call02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import type { AgentView } from "./types";

interface ChatHeaderProps {
  view: AgentView;
  onNewChat: () => void;
  onViewChange: (view: AgentView) => void;
}

export const ChatHeader = memo(
  ({ view, onNewChat, onViewChange }: ChatHeaderProps) => {
    const { state, isMobile } = useSidebar();
    const showNewChat = view === "chat" && (isMobile || state === "collapsed");

    return (
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-2">
          {showNewChat && (
            <Button variant="outline" size="sm" onClick={onNewChat}>
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
              New chat
            </Button>
          )}

          {view === "chat" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange("call")}
            >
              <HugeiconsIcon icon={Call02Icon} data-icon="inline-start" />
              Call agent
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange("chat")}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
              Back to chat
            </Button>
          )}
        </div>
      </header>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
