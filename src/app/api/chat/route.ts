import { handleChatStream } from "@mastra/ai-sdk";
import { toAISdkMessages } from "@mastra/ai-sdk/ui";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import {
  CHAT_AGENT_ID,
  deriveThreadTitle,
  errorResponse,
  getChatMemory,
  getChatResourceId,
  getErrorMessage,
} from "@/lib/chat-server";

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const threadId: string | undefined =
      params.threadId ?? params.memory?.thread;

    if (!threadId) {
      return errorResponse("Missing threadId for this conversation.", 400);
    }

    const resourceId = await getChatResourceId();
    const memory = await getChatMemory();

    // Make sure the thread exists (and is titled) before the agent runs, so it
    // shows up in the sidebar and can never be claimed by another resource.
    if (memory) {
      const existing = await memory.getThreadById({ threadId });

      if (existing && existing.resourceId !== resourceId) {
        return errorResponse(
          "This conversation belongs to a different account.",
          403
        );
      }

      if (!existing) {
        await memory.createThread({
          threadId,
          resourceId,
          title: deriveThreadTitle(params.messages),
        });
      }
    }

    const stream = await handleChatStream({
      mastra,
      agentId: CHAT_AGENT_ID,
      version: "v7",
      params: {
        ...params,
        memory: {
          ...params.memory,
          thread: threadId,
          resource: resourceId,
        },
      },
    });
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Chat request failed:", error);
    return errorResponse(
      getErrorMessage(error, "The assistant could not process this message."),
      500
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json([]);
  }

  const resourceId = await getChatResourceId();
  const memory = await mastra.getAgentById(CHAT_AGENT_ID).getMemory();
  let response = null;

  try {
    response = await memory?.recall({
      threadId,
      resourceId,
    });
  } catch {
    console.log("No previous messages found.");
  }

  const uiMessages = toAISdkMessages(response?.messages || [], {
    version: "v7",
  });

  return NextResponse.json(uiMessages);
}
