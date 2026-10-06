"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SunCloud01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { PromptSuggestion } from "./types";

interface ChatEmptyStateProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS: PromptSuggestion[] = [
  {
    label: "Weather in Tokyo",
    prompt: "What is the current weather and temperature in Tokyo?",
  },
  {
    label: "Rain check for London",
    prompt: "Will it rain in London today? Should I bring an umbrella?",
  },
  {
    label: "Outdoor plans in Paris",
    prompt:
      "Suggest outdoor activities in Paris based on the weather forecast.",
  },
  {
    label: "Weekend in New York",
    prompt:
      "Give me the weekend weather summary and outdoor recommendations for New York.",
  },
];

export const ChatEmptyState = memo(
  ({ onSelectSuggestion, disabled }: ChatEmptyStateProps) => (
    <Empty className="mx-auto max-w-2xl">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SunCloud01Icon} />
        </EmptyMedia>
        <EmptyTitle>Ask about the weather</EmptyTitle>
        <EmptyDescription>
          Get current conditions for any city, or plan your day around the
          forecast.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-2xl flex-row flex-wrap justify-center">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion.label}
            variant="outline"
            size="sm"
            disabled={disabled}
            title={suggestion.prompt}
            onClick={() => onSelectSuggestion(suggestion.prompt)}
          >
            {suggestion.label}
          </Button>
        ))}
      </EmptyContent>
    </Empty>
  )
);

ChatEmptyState.displayName = "ChatEmptyState";
