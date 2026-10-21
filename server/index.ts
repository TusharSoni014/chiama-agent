import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DEFAULT_CHAT_AGENT_ID, isChatAgentId } from "../src/lib/chat-agents";
import { createVoiceHandler } from "./voice-handler";

const PORT = Number(
  process.env.PORT ?? process.env.VOICE_SERVER_PORT ?? 3001,
);
const HOST = process.env.HOST ?? "0.0.0.0";
const APP_ORIGIN = process.env.VOICE_ALLOWED_ORIGIN ?? "http://localhost:3000";

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("*", cors({ origin: APP_ORIGIN }));

app.get("/", (c) => c.json({ status: "ok", service: "chiama-voice" }));

// Browsers always send Origin on WebSockets and CORS does not apply to them, so
// check it here: otherwise any website could open a call on your OpenAI key.
app.use("/ws/*", async (c, next) => {
  if (c.req.header("origin") !== APP_ORIGIN) return c.text("Forbidden", 403);
  await next();
});

// An agent this server does not know (for example the web app was deployed
// with a new agent but this server was not) must fail loudly. Falling back to
// the default would silently answer as a different agent.
app.use("/ws/voice", async (c, next) => {
  const requested = c.req.query("agentId");
  if (requested !== undefined && !isChatAgentId(requested)) {
    return c.text(`Unknown agent "${requested}". Redeploy the voice server.`, 400);
  }
  await next();
});

app.get(
  "/ws/voice",
  // The browser says which agent it wants as `?agentId=...`; no id means the default.
  upgradeWebSocket((c) => {
    const requested = c.req.query("agentId");
    return createVoiceHandler(
      isChatAgentId(requested) ? requested : DEFAULT_CHAT_AGENT_ID
    );
  })
);

const server = serve({ fetch: app.fetch, port: PORT, hostname: HOST }, () =>
  console.log(`Voice server on http://${HOST}:${PORT} (ws: /ws/voice)`),
);
injectWebSocket(server);
