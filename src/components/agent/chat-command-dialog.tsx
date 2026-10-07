"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { ChatThread } from "./types";
import { AnimatePresence, motion, useIsPresent } from "motion/react";

interface ChatCommandDialogProps {
  threads: ChatThread[];
  isLoading: boolean;
  error: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
}

function HistoryCommandItem({
  thread,
  onSelect,
}: {
  thread: ChatThread;
  onSelect: () => void;
}) {
  const isPresent = useIsPresent();
  const title = thread.title?.trim() || "Untitled chat";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, pointerEvents: "none" }}
      transition={{
        duration: 0.16,
        ease: "easeOut",
        layout: { duration: 0.22, ease: "easeOut" },
      }}
      className="w-full"
    >
      <CommandItem
        value={`${title} ${thread.id}`}
        disabled={!isPresent}
        onSelect={onSelect}
      >
        <span className="truncate">{title}</span>
      </CommandItem>
    </motion.div>
  );
}

export function ChatCommandDialog({
  threads,
  isLoading,
  error,
  onSelectThread,
  onNewChat,
}: ChatCommandDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  };

  const openThread = (threadId: string) => {
    setOpen(false);
    setSearch("");
    onSelectThread(threadId);
  };

  const startNewChat = () => {
    setOpen(false);
    setSearch("");
    onNewChat();
  };

  const query = search.trim().toLowerCase();
  const showNewChat = query.length === 0;

  const filteredThreads = useMemo(() => {
    if (!query) return threads;
    return threads.filter((thread) => {
      const title = (thread.title?.trim() || "Untitled chat").toLowerCase();
      return title.includes(query) || thread.id.toLowerCase().includes(query);
    });
  }, [threads, query]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Search chats"
      description="Search your conversation history"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search chats..."
        />
        <CommandList>
          <CommandEmpty>
            {isLoading
              ? "Loading conversations..."
              : error
                ? error
                : threads.length === 0
                  ? "No conversations yet."
                  : "No chats found."}
          </CommandEmpty>
          <AnimatePresence mode="wait">
            {showNewChat && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, pointerEvents: "none" }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                  layout: { duration: 0.22, ease: "easeOut" },
                }}
                className="overflow-hidden"
              >
                <CommandGroup heading="Actions">
                  <CommandItem value="new chat" onSelect={startNewChat}>
                    <HugeiconsIcon icon={Add01Icon} />
                    New chat
                  </CommandItem>
                </CommandGroup>
              </motion.div>
            )}
          </AnimatePresence>
          {threads.length > 0 && (
            <CommandGroup>
              <AnimatePresence mode="wait">
                {filteredThreads.length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{
                      duration: 0.16,
                      ease: "easeOut",
                      layout: { duration: 0.2, ease: "easeOut" },
                    }}
                    className="overflow-hidden px-3 py-2 text-xs font-medium text-muted-foreground select-none"
                  >
                    History
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <AnimatePresence mode="wait">
                  {filteredThreads.map((thread) => (
                    <HistoryCommandItem
                      key={thread.id}
                      thread={thread}
                      onSelect={() => openThread(thread.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
