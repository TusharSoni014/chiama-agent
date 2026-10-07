"use client";

import { memo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, StopIcon } from "@hugeicons/core-free-icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { AutoGrowTextarea } from "./auto-grow-textarea";

interface ChatInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
  placeholder?: string;
}

export const ChatInput = memo(
  ({
    value,
    onValueChange,
    onSubmit,
    onStop,
    isBusy,
    placeholder = "Ask about the weather in any city",
  }: ChatInputProps) => {
    const [isMultiline, setIsMultiline] = useState(false);
    const canSend = value.trim().length > 0 && !isBusy;

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      // Ignore Enter used to confirm an IME composition.
      if (event.nativeEvent.isComposing) return;

      event.preventDefault();
      if (canSend) onSubmit();
    };

    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-4">
        <InputGroup
          className={cn(
            "h-auto transition-[border-radius,color,box-shadow,border-color] duration-200",
            isMultiline ? "has-[textarea]:rounded-lg" : "has-[textarea]:rounded-4xl"
          )}
        >
          <AutoGrowTextarea
            onMultilineChange={setIsMultiline}
            autoFocus
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Message"
          />
          <InputGroupAddon align="inline-end" className="self-end py-1.5">
            {isBusy ? (
              <InputGroupButton
                size="icon-sm"
                variant="secondary"
                onClick={onStop}
                aria-label="Stop response"
              >
                <HugeiconsIcon icon={StopIcon} />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                size="icon-sm"
                variant="default"
                onClick={onSubmit}
                disabled={!canSend}
                aria-label="Send message"
              >
                <HugeiconsIcon icon={ArrowUp02Icon} />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send, Shift + Enter for a new line
        </p>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
