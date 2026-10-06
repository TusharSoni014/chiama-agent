import { handleChatStream } from "@mastra/ai-sdk";
import { toAISdkMessages } from "@mastra/ai-sdk/ui";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DEFAULT_RESOURCE = "weather-chat";

export async function POST(req: Request) {
  const session = await auth();
  const threadId = session?.user?.id ?? "example-user-id";

  const params = await req.json();
  const stream = await handleChatStream({
    mastra,
    agentId: "weather-agent",
    version: "v7",
    params: {
      ...params,
      memory: {
        ...params.memory,
        thread: threadId,
        resource: DEFAULT_RESOURCE,
      },
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function GET() {
  const session = await auth();
  const threadId = session?.user?.id ?? "example-user-id";

  const memory = await mastra.getAgentById("weather-agent").getMemory();
  let response = null;

  try {
    response = await memory?.recall({
      threadId,
      resourceId: DEFAULT_RESOURCE,
    });
  } catch {
    console.log("No previous messages found.");
  }

  const uiMessages = toAISdkMessages(response?.messages || [], {
    version: "v7",
  });

  return NextResponse.json(uiMessages);
}
