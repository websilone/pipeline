import { createClient } from "@libsql/client";
import type { ContactRepository } from "./contact-repository";
import { createLibsqlContactRepository } from "./libsql-contact-repository";

const DEFAULT_DATABASE_URL = "file:pipeline.db";

export function createContactRepository(): ContactRepository {
  const client = createClient({ url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL });
  return createLibsqlContactRepository(client);
}
