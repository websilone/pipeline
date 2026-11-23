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

test("updateStage changes the stage and returns the updated contact", async () => {
  const repository = createLibsqlContactRepository(openClient());
  const created = await repository.create(ada);

  const updated = await repository.updateStage(created.id, "contacted");

  expect(updated).toEqual({ ...created, stage: "contacted" });
  await expect(repository.list()).resolves.toEqual([updated]);
});

test("updateStage returns null for an unknown contact", async () => {
  const repository = createLibsqlContactRepository(openClient());
  await repository.create(ada);

  await expect(repository.updateStage("missing", "won")).resolves.toBeNull();
});

test("a stage change survives closing and reopening the database", async () => {
  const firstClient = openClient();
  const firstRepository = createLibsqlContactRepository(firstClient);
  const created = await firstRepository.create(ada);
  await firstRepository.updateStage(created.id, "talking");
  firstClient.close();

  const reopened = createLibsqlContactRepository(openClient());

  await expect(reopened.list()).resolves.toEqual([{ ...created, stage: "talking" }]);
});

test("update sets the follow-up date and returns the updated contact", async () => {
  const repository = createLibsqlContactRepository(openClient());
  const created = await repository.create(ada);

  const updated = await repository.update(created.id, { nextFollowUpDate: "2026-12-01" });

  expect(updated).toEqual({ ...created, nextFollowUpDate: "2026-12-01" });
  await expect(repository.list()).resolves.toEqual([updated]);
});

test("update replaces then clears the follow-up date", async () => {
  const repository = createLibsqlContactRepository(openClient());
  const created = await repository.create({ ...ada, nextFollowUpDate: "2026-12-01" });

  await expect(repository.update(created.id, { nextFollowUpDate: "2027-01-15" })).resolves.toMatchObject({
    nextFollowUpDate: "2027-01-15",
  });
  await expect(repository.update(created.id, { nextFollowUpDate: null })).resolves.toMatchObject({
    nextFollowUpDate: null,
  });
});

test("update returns null for an unknown contact", async () => {
  const repository = createLibsqlContactRepository(openClient());

  await expect(repository.update("missing", { nextFollowUpDate: "2026-12-01" })).resolves.toBeNull();
});

test("a follow-up date survives closing and reopening the database", async () => {
  const firstClient = openClient();
  const firstRepository = createLibsqlContactRepository(firstClient);
  const created = await firstRepository.create(ada);
  await firstRepository.update(created.id, { nextFollowUpDate: "2026-12-01" });
  firstClient.close();

  const reopened = createLibsqlContactRepository(openClient());

  await expect(reopened.list()).resolves.toEqual([{ ...created, nextFollowUpDate: "2026-12-01" }]);
});
