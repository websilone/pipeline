import { createClient, type Config } from "@libsql/client";
import type { ContactRepository } from "./contact-repository";
import { createLibsqlContactRepository } from "./libsql-contact-repository";

const DEFAULT_DATABASE_URL = "file:pipeline.db";

type DatabaseEnv = Readonly<Record<string, string | undefined>>;

/** Turso when its variables are set, otherwise a local SQLite file. */
export function resolveDatabaseConfig(env: DatabaseEnv): Config {
  const tursoUrl = env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    if (!env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set.");
    return { url: tursoUrl, authToken: env.TURSO_AUTH_TOKEN };
  }

  if (env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL is required on Vercel: a local SQLite file does not survive redeploys.");
  }
  return { url: env.DATABASE_URL || DEFAULT_DATABASE_URL };
}

export function createContactRepository(): ContactRepository {
  const client = createClient(resolveDatabaseConfig(process.env));
  return createLibsqlContactRepository(client);
}
