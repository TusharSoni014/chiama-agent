"use client";

import { memo } from "react";
import { PanelLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const ChatHeader = memo(
  ({ isSidebarOpen, onToggleSidebar, onNewChat }: ChatHeaderProps) => {
    return (
      <header className="h-13 shrink-0 flex items-center justify-between border-b px-4 bg-background/95 backdrop-blur-xs sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleSidebar}
              aria-label="Open sidebar"
              className="text-muted-foreground hover:text-foreground"
            >
              <PanelLeft className="size-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Weather Agent</span>
            <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0">
              <Sparkles className="size-2.5 text-primary" />
              <span>Mastra Powered</span>
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="size-3.5" />
            <span>New Chat</span>
          </Button>
        </div>
      </header>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
