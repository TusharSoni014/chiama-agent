import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";

// Tables the Auth.js Postgres adapter expects (https://authjs.dev/getting-started/adapters/pg).
// Created on startup if missing, so a fresh Neon database works without setup.
const AUTH_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  PRIMARY KEY (id)
);
`;

// One shared Neon connection pool and Auth.js adapter for the whole app.
// Cached on globalThis so dev hot reloads reuse it.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

function createPool() {
  const newPool = new Pool({ connectionString: process.env.DATABASE_URL });
  newPool.on("error", (error) => console.error("Database pool error:", error));
  newPool
    .query(AUTH_TABLES_SQL)
    .catch((error) => console.error("Could not create auth tables:", error));
  return newPool;
}

export const pool = (globalForPg.pgPool ??= createPool());

export const prisma = PostgresAdapter(pool);
