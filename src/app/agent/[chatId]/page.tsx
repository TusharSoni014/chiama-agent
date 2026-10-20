/**
 * `/agent/<chat id>` is an existing chat.
 *
 * Renders nothing on purpose: the UI is in `../layout.tsx` (AgentWorkspace), which
 * reads `chatId` from the URL and loads the thread. See `../page.tsx` for why.
 */
export default function ChatPage() {
  return null;
}
