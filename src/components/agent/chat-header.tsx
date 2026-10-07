"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Call02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { CHAT_AGENTS, isChatAgentId } from "@/lib/chat-agents";
import { useAgentStore } from "@/stores/agent-store";
import type { AgentView } from "./types";
import { AnimatePresence, motion } from "motion/react";

interface ChatHeaderProps {
  view: AgentView;
  onNewChat: () => void;
  onViewChange: (view: AgentView) => void;
}

export const ChatHeader = memo(
  ({ view, onNewChat, onViewChange }: ChatHeaderProps) => {
    const agentId = useAgentStore((state) => state.selectedAgentId);
    const setSelectedAgentId = useAgentStore(
      (state) => state.setSelectedAgentId,
    );
    const { state, isMobile } = useSidebar();
    const showNewChat = view === "chat" && (isMobile || state === "collapsed");
    const activeAgent =
      CHAT_AGENTS.find((agent) => agent.id === agentId) ?? CHAT_AGENTS[0];

    return (
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Switch agent"
                  className="max-w-48"
                />
              }
            >
              <span className="truncate text-xs sm:text-base">
                {activeAgent.name}
              </span>
              <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Switch agent</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={agentId}
                  onValueChange={(value) => {
                    if (!isChatAgentId(value) || value === agentId) return;
                    setSelectedAgentId(value);
                    onNewChat();
                  }}
                >
                  {CHAT_AGENTS.map((agent) => (
                    <DropdownMenuRadioItem
                      key={agent.id}
                      value={agent.id}
                      closeOnClick
                    >
                      <div className="grid min-w-0 leading-tight">
                        <span className="truncate">{agent.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {agent.description}
                        </span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {showNewChat && (
              <motion.div
                key="new-chat-btn"
                initial={{ opacity: 0, scale: 0.6, filter: "blur(5px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: "blur(5px)" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="New chat"
                  onClick={onNewChat}
                  className="max-md:size-8 max-md:px-0"
                >
                  <HugeiconsIcon icon={Add01Icon} />
                  <span className="max-md:hidden">New chat</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {view === "chat" ? (
            <Button
              variant="outline"
              size="sm"
              aria-label="Call agent"
              onClick={() => onViewChange("call")}
              className="max-md:size-8 max-md:px-0"
            >
              <HugeiconsIcon icon={Call02Icon} />
              <span className="max-md:hidden">Call agent</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              aria-label="Back to chat"
              onClick={() => onViewChange("chat")}
              className="max-md:size-8 max-md:px-0"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              <span className="max-md:hidden">Back to chat</span>
            </Button>
          )}
        </div>
      </header>
    );
  },
);

ChatHeader.displayName = "ChatHeader";
