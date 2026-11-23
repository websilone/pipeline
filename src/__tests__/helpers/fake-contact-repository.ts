import { vi } from "vitest";
import type { Contact, ContactRepository, NewContact } from "@/data/contact-repository";

export function createFakeRepository() {
  const contacts: Contact[] = [];
  const repository = {
    create: vi.fn(async (input: NewContact) => {
      const contact = { ...input, id: String(contacts.length + 1), createdAt: "2026-11-20T10:00:00.000Z" };
      contacts.push(contact);
      return contact;
    }),
    list: vi.fn(async () => [...contacts]),
    updateStage: vi.fn(async (id: string, stage: Contact["stage"]) => {
      const contact = contacts.find((candidate) => candidate.id === id);
      if (!contact) return null;
      contact.stage = stage;
      return { ...contact };
    }),
  } satisfies ContactRepository;
  return { repository, contacts };
}
