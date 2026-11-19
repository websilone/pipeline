import { describe, expect, test } from "vitest";
import type { Contact, ContactRepository, NewContact } from "@/data/contact-repository";
import { createContactService, STAGES, type ContactInput } from "@/services/contact-service";

function createFakeRepository() {
  const contacts: Contact[] = [];
  const repository: ContactRepository = {
    create: async (input: NewContact) => {
      const contact = { ...input, id: String(contacts.length + 1), createdAt: "2026-11-20T10:00:00.000Z" };
      contacts.push(contact);
      return contact;
    },
    list: async () => [...contacts],
  };
  return { repository, contacts };
}

describe("stages", () => {
  test("are the five fixed stages, starting with « À contacter »", () => {
    expect(STAGES.map((stage) => stage.label)).toEqual([
      "À contacter",
      "Contacté",
      "En discussion",
      "Gagné",
      "Perdu",
    ]);
    expect(STAGES[0].id).toBe("todo");
  });
});

describe("addContact", () => {
  test("creates a contact in the « À contacter » stage", async () => {
    const { repository, contacts } = createFakeRepository();

    const result = await createContactService(repository).addContact({
      name: "Ada Lovelace",
      company: "Analytical Engines",
      email: "ada@example.com",
    });

    expect(result).toMatchObject({ ok: true, contact: { name: "Ada Lovelace", stage: "todo" } });
    expect(contacts).toHaveLength(1);
  });

  test("ignores any stage passed in the input", async () => {
    const { repository, contacts } = createFakeRepository();
    const input = { name: "Ada", stage: "won" } as ContactInput;

    await createContactService(repository).addContact(input);

    expect(contacts[0].stage).toBe("todo");
  });

  test("trims fields and stores optional ones as empty strings", async () => {
    const { repository, contacts } = createFakeRepository();

    await createContactService(repository).addContact({ name: "  Ada  ", email: "  " });

    expect(contacts[0]).toMatchObject({ name: "Ada", company: "", email: "", notes: "", nextFollowUpDate: null });
  });

  test.each(["", "   "])("refuses a missing name (%j) without creating anything", async (name) => {
    const { repository, contacts } = createFakeRepository();

    const result = await createContactService(repository).addContact({ name });

    expect(result).toEqual({ ok: false, errors: { name: "Le nom est obligatoire." } });
    expect(contacts).toHaveLength(0);
  });

  test.each(["ada@", "ada.example.com", "ada@example", "a da@example.com"])(
    "refuses a malformed email (%j) without creating anything",
    async (email) => {
      const { repository, contacts } = createFakeRepository();

      const result = await createContactService(repository).addContact({ name: "Ada", email });

      expect(result).toEqual({ ok: false, errors: { email: "L'email n'est pas valide." } });
      expect(contacts).toHaveLength(0);
    },
  );

  test("reports every invalid field at once", async () => {
    const { repository } = createFakeRepository();

    const result = await createContactService(repository).addContact({ name: "", email: "ada@" });

    expect(result).toEqual({
      ok: false,
      errors: { name: "Le nom est obligatoire.", email: "L'email n'est pas valide." },
    });
  });
});

describe("listContactsByStage", () => {
  test("groups contacts under each of the five stages", async () => {
    const { repository } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada" });

    const byStage = await service.listContactsByStage();

    expect(Object.keys(byStage)).toEqual(STAGES.map((stage) => stage.id));
    expect(byStage.todo.map((contact) => contact.name)).toEqual(["Ada"]);
    expect(byStage.contacted).toEqual([]);
  });
});
