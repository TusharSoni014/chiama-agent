import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createVoiceHandler } from "./voice-handler";

const PORT = Number(process.env.VOICE_SERVER_PORT ?? 3001);
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

app.get(
  "/ws/voice",
  upgradeWebSocket(() => createVoiceHandler())
);

const server = serve({ fetch: app.fetch, port: PORT }, () =>
  console.log(`Voice server on http://localhost:${PORT} (ws: /ws/voice)`)
);
injectWebSocket(server);
