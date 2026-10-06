"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  onNewChat: () => void;
}

export const ChatHeader = memo(({ onNewChat }: ChatHeaderProps) => {
  const { state, isMobile } = useSidebar();
  const showNewChat = isMobile || state === "collapsed";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
      </div>

      {showNewChat && (
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          New chat
        </Button>
      )}
    </header>
  );
});

ChatHeader.displayName = "ChatHeader";
