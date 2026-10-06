"use client";

import { memo, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
  placeholder?: string;
}

export const ChatInput = memo(
  ({
    input,
    onInputChange,
    onSubmit,
    onStop,
    isBusy,
    placeholder = "Ask weather agent anything...",
  }: ChatInputProps) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!input.trim() || isBusy) return;
        onSubmit();
      }
    };

    return (
      <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
        <InputGroup className="rounded-2xl border bg-background/80 shadow-xs focus-within:ring-2 focus-within:ring-ring/40">
          <InputGroupTextarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="min-h-12 max-h-48 py-3 px-3.5 text-sm"
          />

          <InputGroupAddon align="inline-end" className="pr-2 pb-2 self-end">
            {isBusy ? (
              <InputGroupButton
                size="icon-sm"
                variant="destructive"
                onClick={onStop}
                className="size-8 rounded-lg"
                title="Stop response"
              >
                <Square className="size-3.5 fill-current" />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                size="icon-sm"
                variant="default"
                onClick={onSubmit}
                disabled={!input.trim()}
                className="size-8 rounded-lg disabled:opacity-40"
                title="Send message"
              >
                <ArrowUp className="size-4" />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Chiama Agent can query live weather conditions and organize outdoor activity schedules.
        </p>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
