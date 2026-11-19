import type { Client } from "@libsql/client";

export async function migrate(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      stage TEXT NOT NULL,
      next_follow_up_date TEXT,
      created_at TEXT NOT NULL
    )
  `);
}
