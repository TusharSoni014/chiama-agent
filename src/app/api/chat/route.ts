import { handleChatStream } from "@mastra/ai-sdk";
import { toAISdkMessages } from "@mastra/ai-sdk/ui";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DEFAULT_RESOURCE = "weather-chat";

export async function POST(req: Request) {
  const session = await auth();
  const resourceId = session?.user?.id ?? DEFAULT_RESOURCE;
  const params = await req.json();

  const targetThreadId =
    params.threadId ??
    params.memory?.thread ??
    session?.user?.id ??
    "example-user-id";

  const stream = await handleChatStream({
    mastra,
    agentId: "weather-agent",
    version: "v7",
    params: {
      ...params,
      memory: {
        ...params.memory,
        thread: targetThreadId,
        resource: resourceId,
      },
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function GET(req: Request) {
  const session = await auth();
  const resourceId = session?.user?.id ?? DEFAULT_RESOURCE;
  const { searchParams } = new URL(req.url);
  const targetThreadId =
    searchParams.get("threadId") ?? session?.user?.id ?? "example-user-id";

  const memory = await mastra.getAgentById("weather-agent").getMemory();
  let response = null;

  try {
    response = await memory?.recall({
      threadId: targetThreadId,
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
