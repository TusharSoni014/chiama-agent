import { ChatLoader } from "@/components/agent/chat-loader";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <ChatLoader chatId={chatId} />;
}
