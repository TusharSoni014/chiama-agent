/**
 * `/agent` is a new, empty chat.
 *
 * This page renders nothing on purpose. The UI is in `layout.tsx` (AgentWorkspace),
 * which stays mounted when the first message moves the URL to `/agent/<chat id>`.
 * If the UI lived in this page, that URL change would remount it and cut off the
 * reply that is still streaming. The page only has to exist so the URL is a route.
 */
export default function AgentPage() {
  return null;
}
