import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterEach, beforeEach, expect, test } from "vitest";
import type { NewContact } from "@/data/contact-repository";
import { createLibsqlContactRepository } from "@/data/libsql-contact-repository";

const ada: NewContact = {
  name: "Ada Lovelace",
  company: "Analytical Engines",
  email: "ada@example.com",
  notes: "",
  stage: "todo",
  nextFollowUpDate: null,
};

let dir: string;
let url: string;
const clients: Client[] = [];

function openClient(): Client {
  const client = createClient({ url });
  clients.push(client);
  return client;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "pipeline-"));
  url = `file:${join(dir, "test.db")}`;
});

afterEach(() => {
  clients.splice(0).forEach((client) => client.close());
  rmSync(dir, { recursive: true, force: true });
});

test("create stores every field and returns the contact with an id", async () => {
  const repository = createLibsqlContactRepository(openClient());

  const created = await repository.create(ada);

  expect(created).toMatchObject(ada);
  expect(created.id).toEqual(expect.any(String));
  await expect(repository.list()).resolves.toEqual([created]);
});

test("list returns contacts in creation order", async () => {
  const repository = createLibsqlContactRepository(openClient());

  const first = await repository.create(ada);
  const second = await repository.create({ ...ada, name: "Grace Hopper", stage: "contacted" });

  await expect(repository.list()).resolves.toEqual([first, second]);
});

test("contacts survive closing and reopening the database", async () => {
  const firstClient = openClient();
  const created = await createLibsqlContactRepository(firstClient).create(ada);
  firstClient.close();

  const reopened = createLibsqlContactRepository(openClient());

  await expect(reopened.list()).resolves.toEqual([created]);
});
