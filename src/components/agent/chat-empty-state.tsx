"use client";

import { memo } from "react";
import { CloudSun, ArrowUpRight } from "lucide-react";
import type { PromptSuggestion } from "./types";

interface ChatEmptyStateProps {
  onSelectSuggestion: (prompt: string) => void;
}

const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  {
    label: "Tokyo Weather",
    prompt: "What is the current weather and temperature in Tokyo?",
  },
  {
    label: "London Rain Check",
    prompt: "Will it rain in London today? Should I bring an umbrella?",
  },
  {
    label: "Paris Outdoor Plan",
    prompt: "Suggest fun outdoor activities in Paris based on the weather forecast.",
  },
  {
    label: "New York Weekend",
    prompt: "Give me the weekend weather summary and outdoor recommendations for New York.",
  },
];

export const ChatEmptyState = memo(({ onSelectSuggestion }: ChatEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 text-center my-auto">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary shadow-xs mb-4">
        <CloudSun className="size-6" />
      </div>

      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Ask for live weather updates, precipitation alerts, or tailored outdoor activity recommendations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {DEFAULT_SUGGESTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectSuggestion(item.prompt)}
            className="flex items-center justify-between p-3 rounded-xl border bg-card text-card-foreground text-left text-xs transition-all hover:bg-accent/60 hover:border-foreground/20 cursor-pointer group shadow-2xs"
          >
            <div className="min-w-0 pr-2">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="text-muted-foreground truncate text-[11px] mt-0.5">
                {item.prompt}
              </p>
            </div>
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
});

ChatEmptyState.displayName = "ChatEmptyState";
