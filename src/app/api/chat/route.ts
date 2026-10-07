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
  getUserKeyContext,
  resolveChatAgentId,
} from "@/lib/chat-server";

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const threadId: string | undefined =
      params.threadId ?? params.memory?.thread;

    const resourceId = await getChatResourceId();

    // Anonymous visitors: answer from the messages sent by the browser, with no
    // memory attached, so nothing is written to the backend.
    if (!resourceId) {
      const { agentId, memory: _memory, threadId: _threadId, ...guestParams } =
        params;
      const guestStream = await handleChatStream({
        mastra,
        agentId: resolveChatAgentId(agentId),
        version: "v7",
        params: { ...guestParams, ...getUserKeyContext(req) },
      });
      return createUIMessageStreamResponse({ stream: guestStream });
    }

    if (!threadId) {
      return errorResponse("Missing threadId for this conversation.", 400);
    }

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

    const { agentId: requestedAgentId, ...chatParams } = params;

    const stream = await handleChatStream({
      mastra,
      agentId: resolveChatAgentId(requestedAgentId),
      version: "v7",
      params: {
        ...chatParams,
        memory: {
          ...chatParams.memory,
          thread: threadId,
          resource: resourceId,
        },
        ...getUserKeyContext(req),
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
  // Anonymous chats are never saved, so there is no history to load.
  if (!resourceId) {
    return NextResponse.json([]);
  }
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
