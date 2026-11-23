import type { Client, Row } from "@libsql/client";
import type { Contact, ContactChanges, ContactRepository, NewContact, Stage } from "./contact-repository";
import { migrate } from "./schema";

const COLUMNS: Record<keyof ContactChanges, string> = {
  name: "name",
  company: "company",
  email: "email",
  notes: "notes",
  nextFollowUpDate: "next_follow_up_date",
};

function toContact(row: Row): Contact {
  return {
    id: String(row.id),
    name: String(row.name),
    company: String(row.company),
    email: String(row.email),
    notes: String(row.notes),
    stage: String(row.stage) as Stage,
    nextFollowUpDate: row.next_follow_up_date === null ? null : String(row.next_follow_up_date),
    createdAt: String(row.created_at),
  };
}

export function createLibsqlContactRepository(client: Client): ContactRepository {
  let ready: Promise<void> | undefined;
  const ensureSchema = () => (ready ??= migrate(client));

  return {
    async create(input: NewContact): Promise<Contact> {
      await ensureSchema();
      const contact: Contact = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      await client.execute({
        sql: `INSERT INTO contacts (id, name, company, email, notes, stage, next_follow_up_date, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          contact.id,
          contact.name,
          contact.company,
          contact.email,
          contact.notes,
          contact.stage,
          contact.nextFollowUpDate,
          contact.createdAt,
        ],
      });
      return contact;
    },

    async list(): Promise<Contact[]> {
      await ensureSchema();
      const result = await client.execute("SELECT * FROM contacts ORDER BY created_at, rowid");
      return result.rows.map(toContact);
    },

    async updateStage(id: string, stage: Stage): Promise<Contact | null> {
      await ensureSchema();
      const result = await client.execute({
        sql: "UPDATE contacts SET stage = ? WHERE id = ? RETURNING *",
        args: [stage, id],
      });
      const [row] = result.rows;
      return row ? toContact(row) : null;
    },

    async update(id: string, changes: ContactChanges): Promise<Contact | null> {
      await ensureSchema();
      const entries = (Object.keys(COLUMNS) as (keyof ContactChanges)[])
        .filter((key) => changes[key] !== undefined)
        .map((key) => [COLUMNS[key], changes[key] ?? null] as const);
      const result = await client.execute({
        sql: `UPDATE contacts SET ${entries.map(([column]) => `${column} = ?`).join(", ")} WHERE id = ? RETURNING *`,
        args: [...entries.map(([, value]) => value), id],
      });
      const [row] = result.rows;
      return row ? toContact(row) : null;
    },
  };
}
