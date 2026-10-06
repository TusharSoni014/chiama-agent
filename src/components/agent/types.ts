export interface ChatThread {
  id: string;
  title?: string;
  resourceId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PromptSuggestion {
  label: string;
  prompt: string;
}

/** The conversation currently open. A draft has not been sent to the server yet. */
export interface ActiveChat {
  id: string;
  isDraft: boolean;
}
