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
import { useAgentStore } from "@/stores/agent-store";
import { ChatAgentId } from "@/lib/chat-agents";
import { AnimatePresence, motion } from "motion/react";

interface ChatEmptyStateProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

const AGENT_TITLES: Record<
  ChatAgentId,
  { title: string; description: string }
> = {
  "weather-agent": {
    title: "Ask about the weather",
    description:
      "Get current conditions for any city, or plan your day around the forecast.",
  },
  "tusharsoni-agent": {
    title: "Ask about Tushar Soni",
    description:
      "Get information about Tushar Soni's projects, skills, and professional experience.",
  },
};

const AGENT_SUGGESTIONS: Record<ChatAgentId, PromptSuggestion[]> = {
  "weather-agent": [
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
  ],
  "tusharsoni-agent": [
    {
      label: "Wbo is Tushar Soni",
      prompt: "Tell me about Tushar Soni and what he does?",
    },
    {
      label: "Tushar's Latest Project",
      prompt:
        "What is Tushar Soni's latest project? give me the link as well along with its details.",
    },
    {
      label: "Tushar's Skills",
      prompt: "What are Tushar Soni's technical skills?",
    },
    {
      label: "Tushar's Professional Experience",
      prompt: "What is Tushar Soni's professional experience?",
    },
  ],
};

export const ChatEmptyState = memo(
  ({ onSelectSuggestion, disabled }: ChatEmptyStateProps) => {
    const { selectedAgentId } = useAgentStore();
    return (
      <Empty className="mx-auto max-w-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={SunCloud01Icon} />
          </EmptyMedia>
          <EmptyTitle>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedAgentId}
                initial={{ y: 20, filter: "blur(5px)", opacity: 0 }}
                animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                exit={{ y: -20, filter: "blur(5px)", opacity: 0 }}
              >
                {AGENT_TITLES[selectedAgentId].title}
              </motion.div>
            </AnimatePresence>
          </EmptyTitle>
          <EmptyDescription>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedAgentId}
                initial={{ y: -20, filter: "blur(5px)", opacity: 0 }}
                animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                exit={{ y: 20, filter: "blur(5px)", opacity: 0 }}
              >
                {AGENT_TITLES[selectedAgentId].description}
              </motion.div>
            </AnimatePresence>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-2xl flex-row flex-wrap justify-center">
          <AnimatePresence mode="popLayout">
            {AGENT_SUGGESTIONS[selectedAgentId].map((suggestion, index) => (
              <motion.div
                key={suggestion.prompt}
                initial={{
                  filter: "blur(5px)",
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  filter: "blur(0px)",
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  filter: "blur(5px)",
                  scale: 0.6,
                  opacity: 0,
                }}
                transition={{
                  delay: 0.1 * index,
                }}
              >
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
              </motion.div>
            ))}
          </AnimatePresence>
        </EmptyContent>
      </Empty>
    );
  },
);

ChatEmptyState.displayName = "ChatEmptyState";
