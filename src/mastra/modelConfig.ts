import type { RequestContext } from "@mastra/core/request-context";

export const textModel = "openrouter/openrouter/free";

/** Request-context key holding the visitor's own OpenAI key for a single request. */
export const OPENAI_KEY_CONTEXT = "openaiApiKey";

/** Model used when the visitor brings their own OpenAI key. */
const OPENAI_TEXT_MODEL = "openai/gpt-5.4-mini";

/**
 * Picks the chat model per request: the visitor's own OpenAI key when they sent
 * one, otherwise the default model. The key lives only in this request's context.
 */
export function resolveTextModel({
  requestContext,
}: {
  requestContext: RequestContext;
}) {
  const apiKey = requestContext.get(OPENAI_KEY_CONTEXT);
  return typeof apiKey === "string" && apiKey
    ? ({ id: OPENAI_TEXT_MODEL, apiKey } as const)
    : textModel;
}
