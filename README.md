# Chiama Agent

Chiama is a Next.js app for chatting with Mastra agents and calling them over realtime voice. It ships two agents (weather and Tushar Soni), Google sign-in, optional bring-your-own OpenAI keys, and a dark chat UI.

- **App:** [http://localhost:3000](http://localhost:3000)
- **Agent workspace:** [http://localhost:3000/agent](http://localhost:3000/agent)
- **Voice WebSocket:** `ws://localhost:3001/ws/voice` (separate process)

## Features

- **Chat** with streaming replies, tool banners, and message enter/height motion
- **Voice calls** over a Hono WebSocket to OpenAI Realtime (`gpt-realtime`)
- **Two agents:** Weather Agent (forecast + activity planning) and Tushar Soni Agent (bio, work, projects)
- **Google auth** (NextAuth). Signed-in chats are saved; guests can still talk, but threads are not persisted
- **Thread list** in the sidebar, delete conversations, **Ctrl+K / Cmd+K** command palette to search history
- **BYOK:** optional OpenAI key in Settings (browser `localStorage`, sent per request, never stored on the server)
- Default text model is OpenRouter free (`openrouter/openrouter/free`); a visitor key switches chat to `openai/gpt-5.4-mini`
- **Help modal** (auto-opens when signed out), settings, connect timeout on calls, usage-limit prompt to add a key
- Dark UI, mobile sidebar, icon-only header actions under 768px, pinch-zoom locked

## Tech stack

| Layer | Stack |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn (`base-maia`, Base UI), Hugeicons, Motion |
| Agents | [Mastra](https://mastra.ai) (`@mastra/core`, memory, pg storage, observability) |
| Chat stream | `@mastra/ai-sdk`, Vercel AI SDK (`ai`, `@ai-sdk/react`) |
| Voice | Hono + `@hono/node-ws`, `@mastra/voice-openai-realtime` |
| Auth | NextAuth v5, Google provider |
| State | Zustand (`src/stores/agent-store.ts`) |
| Orbs | `thinking-orbs` |
| DB | Postgres via `@mastra/pg` (`DATABASE_URL`) |

Primitives live in `src/components/ui`. Icon library is **hugeicons** (`components.json`). Do not add Lucide to new agent UI.

## Prerequisites

- Node.js 20+
- npm
- A Postgres database (Mastra memory and threads)
- [Google OAuth](https://console.cloud.google.com/) client (for sign-in)
- [OpenRouter](https://openrouter.ai/) API key (default chat model)
- [OpenAI](https://platform.openai.com/) API key (voice; also used for chat when a visitor pastes their own key)

## Setup

```bash
git clone <this-repo>
cd chiama-agent
npm install
cp .env.example .env
```

Fill `.env` (see [Environment](#environment)). Then run **two** processes:

```bash
npm run dev
```

```bash
npm run dev:voice
```

Open [http://localhost:3000](http://localhost:3000) and go to **Use Agent**.

Voice calls fail until `dev:voice` is running. After changing `server/`, restart that process (or rely on `tsx watch`).

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js app (port 3000) |
| `npm run dev:voice` | Voice WebSocket server (port 3001) |
| `npm run build` / `npm start` | Production Next.js |
| `npm run lint` | ESLint |

Use these scripts instead of `mastra dev` / `mastra build`. Register new agents, tools, workflows, and scorers in `src/mastra/index.ts`.

## Environment

Copy from `.env.example`. Never commit `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection for Mastra storage / chat memory |
| `AUTH_GOOGLE_ID` | Yes (sign-in) | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes (sign-in) | Google OAuth client secret |
| `AUTH_SECRET` | Yes (sign-in) | NextAuth secret |
| `OPENROUTER_API_KEY` | Yes (default chat) | Default text model |
| `OPENAI_API_KEY` | Yes (voice fallback) | Server voice + fallback when the visitor has no key |
| `NEXT_PUBLIC_VOICE_WS_URL` | No | Browser WS origin, default `ws://localhost:3001` |
| `VOICE_SERVER_PORT` | No | Voice server port, default `3001` |
| `VOICE_ALLOWED_ORIGIN` | No | Allowed browser origin, default `http://localhost:3000` |

Visitor OpenAI keys are **not** env vars. They are saved in this browser only (`localStorage` key `chiama:openai-key`) and sent as `x-openai-key` on chat requests, or in the voice `start` WebSocket message. Format: `sk-…` / `sk-proj-…` (see `src/lib/openai-key-storage.ts`).

In production use `https` and `wss`.

## Architecture

```
Browser
  /                 Marketing home
  /agent            Agent workspace (chat + call)
  /api/chat         Mastra chat stream + thread load
  /api/chat/threads Thread list / delete
  /api/chat/call-transcript  Save a finished call into a thread
  /api/auth/*       NextAuth
  /api/weather      Weather helper route
        │
        ├─ Next (Mastra agents, Postgres memory)
        └─ Voice server :3001  ──WebSocket──► OpenAI Realtime
```

- **Signed out:** chat works, nothing is written to memory. Help modal opens on `/agent`.
- **Signed in:** `resourceId` is the Google user id; threads show in the sidebar.
- **Chat + call** share agent instructions/tools. Voice uses `gpt-realtime` and alloy; greeting is a `response.create`, not `speak()`.
- Mic stays muted until the agent greeting has played, and while the agent is speaking (echo would otherwise be transcribed as the caller).
- Call connect waits **10s** for WebSocket `ready`. Rate-limit / quota errors with no visitor key prompt Settings.

## Agents and tools

Registered in `src/mastra/index.ts`:

| Agent | Tools | Role |
| --- | --- | --- |
| `weather-agent` | `weatherTool` (`get-weather`) | Weather and outdoor plans; geocodes a city then fetches current conditions |
| `tusharsoni-agent` | `tusharsoniTool` | Answers from [tusharsoni.com/llms.txt](https://www.tusharsoni.com/llms.txt) |

Voice profiles in `server/voice-agent.ts` reuse the same instructions and tools. Default UI agent is Weather.

Text model: `resolveTextModel` in `src/mastra/modelConfig.ts`.

## App routes and API

| Path | Role |
| --- | --- |
| `/` | Landing page, Chiama logo, link to `/agent` |
| `/agent` | Full workspace |
| `POST /api/chat` | Stream a turn (`handleChatStream`, AI SDK v7) |
| `GET /api/chat?threadId=` | Load saved messages |
| `GET/DELETE /api/chat/threads` | List / delete threads |
| `POST /api/chat/call-transcript` | Append call transcript to a thread |
| `GET/POST /api/auth/[...nextauth]` | Google session |

## Component structure

### Agent UI (`src/components/agent`)

| File | Role |
| --- | --- |
| `agent-workspace.tsx` | Shell: sidebar, chat/call switch (crossfade), dialogs, auto-open help |
| `chat-sidebar.tsx` | Brand, new chat, thread list, user footer |
| `chat-sidebar-user.tsx` | Google sign-in + help, or account menu (Help / Settings / Log out) |
| `chat-header.tsx` | Agent picker, new chat, call / back (icon-only on mobile) |
| `chat-session.tsx` | Loads history then mounts conversation |
| `chat-conversation.tsx` | `useChat`, transport, errors |
| `chat-messages.tsx` / `chat-message-item.tsx` | List, bubbles, orbs → logo, streaming height |
| `chat-input.tsx` / `auto-grow-textarea.tsx` | Composer |
| `chat-empty-state.tsx` | Hero orb + suggestions |
| `chat-tool-call.tsx` | Tool **banner** (not a dropdown) |
| `chat-error-alert.tsx` | Errors; “Add OpenAI key” on usage limits |
| `chat-delete-dialog.tsx` | Confirm delete |
| `chat-command-dialog.tsx` | Ctrl/Cmd+K history search |
| `help-dialog.tsx` | Help tips |
| `user-settings-dialog.tsx` | OpenAI key field |
| `google-sign-in-button.tsx` | Sign in with spinner |
| `agent-orb.tsx` | `thinking-orbs` with state-change fade |
| `user-avatar.tsx` | Google photo or “U” |
| `call/call-screen.tsx` | Call UI, transcript, start/end |

### Other UI

- `src/components/ui` — shadcn/Base UI primitives (button, dialog, sidebar, command, bubble, message, …)
- `src/components/ai-elements` — extra AI widgets (not all wired into the agent page)

### Lib, hooks, store, server

| Path | Role |
| --- | --- |
| `src/lib/chat-agents.ts` | Agent ids the client is allowed to pick |
| `src/lib/chat-server.ts` | Session resource id, titles, visitor key → request context |
| `src/lib/openai-key-storage.ts` | Parse/store key, usage-limit copy |
| `src/lib/voice-protocol.ts` | WS message types (PCM16 24 kHz) |
| `src/lib/call-audio.ts` | Mic capture + playback |
| `src/lib/auth.ts` | NextAuth Google |
| `src/lib/brand.ts` | Chiama logo URL (Cloudflare R2, not a local `chiama.png`) |
| `src/hooks/use-voice-call.ts` | Call session, 10s connect timeout |
| `src/hooks/use-chat-threads.ts` | Thread list |
| `src/hooks/use-thread-history.ts` | Load messages |
| `src/hooks/use-mobile.ts` | `<768px` |
| `src/stores/agent-store.ts` | Selected agent, help/settings open |
| `src/mastra/` | Agents, tools, workflow, Mastra instance |
| `server/index.ts` | Voice HTTP + WS |
| `server/voice-handler.ts` | Per-call Realtime session |
| `server/voice-agent.ts` | Voice agent factory |

## Keyboard and UI notes

- **Ctrl+K / Cmd+K** — search chats (agent page). New chat is listed only when the search box is empty.
- Help **?** next to Sign in when logged out; **Help** in the account menu when logged in (no “sign in” card).
- Header Call / New chat / Back: labels on desktop, icons only below 768px.

## Adding an agent

1. Create the agent (and tools) under `src/mastra/`.
2. Register it in `src/mastra/index.ts`.
3. Add `{ id, name, description }` to `CHAT_AGENTS` in `src/lib/chat-agents.ts` (`id` must match).
4. Add a voice profile in `server/voice-agent.ts` if it should be callable.

## License

Private project (`package.json` `"private": true`).
