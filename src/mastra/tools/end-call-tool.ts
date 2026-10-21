import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/** Name the voice server watches for to hang up the call. Must match the key the tool is registered under. */
export const END_CALL_TOOL_NAME = "endCall";

/**
 * Voice calls only. The agent calls this once it has said its goodbye; the
 * voice server sees the call and tells the browser to hang up. It does nothing
 * else, so there is nothing to execute here.
 */
export const endCallTool = createTool({
  id: END_CALL_TOOL_NAME,
  description:
    "Ends the phone call. Call it right after you have said your final goodbye. Never call it before that.",
  inputSchema: z.object({}),
  outputSchema: z.object({ ended: z.boolean() }),
  execute: async () => ({ ended: true }),
});
