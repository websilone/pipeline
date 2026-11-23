import { describe, expect, test } from "vitest";
import { createContactService, isStage, STAGES, type ContactInput, type Stage } from "@/services/contact-service";
import { createFakeRepository } from "../helpers/fake-contact-repository";

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

const TODAY = "2026-11-23";

describe("listContactsByStage", () => {
  test("groups contacts under each of the five stages", async () => {
    const { repository } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada" });

    const byStage = await service.listContactsByStage(TODAY);

    expect(Object.keys(byStage)).toEqual(STAGES.map((stage) => stage.id));
    expect(byStage.todo.map((contact) => contact.name)).toEqual(["Ada"]);
    expect(byStage.contacted).toEqual([]);
  });
});

describe("isStage", () => {
  test.each(["todo", "contacted", "talking", "won", "lost"])("accepts the fixed stage %j", (stage) => {
    expect(isStage(stage)).toBe(true);
  });

  test.each(["", "archived", "TODO", "À contacter", "toString"])("rejects %j", (stage) => {
    expect(isStage(stage)).toBe(false);
  });
});

describe("moveContact", () => {
  async function serviceWithAda() {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    const added = await service.addContact({ name: "Ada" });
    if (!added.ok) throw new Error("setup failed");
    return { service, repository, contacts, ada: added.contact };
  }

  test("moves a contact from « À contacter » to « Contacté »", async () => {
    const { service, ada } = await serviceWithAda();

    const result = await service.moveContact(ada.id, "contacted");

    expect(result).toMatchObject({ ok: true, contact: { id: ada.id, stage: "contacted" } });
    const byStage = await service.listContactsByStage(TODAY);
    expect(byStage.contacted.map((contact) => contact.name)).toEqual(["Ada"]);
    expect(byStage.todo).toEqual([]);
  });

  test("allows moving back to an earlier stage", async () => {
    const { service, ada } = await serviceWithAda();
    await service.moveContact(ada.id, "won");

    const result = await service.moveContact(ada.id, "todo");

    expect(result).toMatchObject({ ok: true, contact: { stage: "todo" } });
  });

  test.each(["archived", "", "Contacté"])(
    "refuses the unknown stage %j and leaves the contact where it was",
    async (stage) => {
      const { service, repository, contacts } = await serviceWithAda();

      const result = await service.moveContact(contacts[0].id, stage);

      expect(result).toEqual({ ok: false, error: "Étape inconnue." });
      expect(repository.updateStage).not.toHaveBeenCalled();
      expect(contacts[0].stage).toBe("todo");
    },
  );

  test("refuses an unknown contact", async () => {
    const { service } = await serviceWithAda();

    const result = await service.moveContact("missing", "contacted");

    expect(result).toEqual({ ok: false, error: "Contact introuvable." });
  });
});

describe("follow-up date on creation", () => {
  test("stores the follow-up date given when adding a contact", async () => {
    const { repository, contacts } = createFakeRepository();

    const result = await createContactService(repository).addContact({ name: "Ada", nextFollowUpDate: "2026-12-01" });

    expect(result).toMatchObject({ ok: true, contact: { nextFollowUpDate: "2026-12-01" } });
    expect(contacts[0].nextFollowUpDate).toBe("2026-12-01");
  });

  test("stores no date when the field is left empty", async () => {
    const { repository, contacts } = createFakeRepository();

    await createContactService(repository).addContact({ name: "Ada", nextFollowUpDate: "  " });

    expect(contacts[0].nextFollowUpDate).toBeNull();
  });

  test.each(["2026-02-30", "01/12/2026", "2026-1-5", "demain"])(
    "refuses the invalid date %j without creating anything",
    async (nextFollowUpDate) => {
      const { repository, contacts } = createFakeRepository();

      const result = await createContactService(repository).addContact({ name: "Ada", nextFollowUpDate });

      expect(result).toEqual({ ok: false, errors: { nextFollowUpDate: "La date n'est pas valide." } });
      expect(contacts).toHaveLength(0);
    },
  );
});

describe("scheduleFollowUp", () => {
  async function serviceWithAda(nextFollowUpDate?: string) {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada", nextFollowUpDate });
    return { service, repository, contacts };
  }

  test("gives a follow-up date to a contact", async () => {
    const { service, contacts } = await serviceWithAda();

    const result = await service.scheduleFollowUp(contacts[0].id, "2026-12-01");

    expect(result).toMatchObject({ ok: true, contact: { nextFollowUpDate: "2026-12-01" } });
    expect(contacts[0].nextFollowUpDate).toBe("2026-12-01");
  });

  test("replaces an existing follow-up date", async () => {
    const { service, contacts } = await serviceWithAda("2026-12-01");

    await service.scheduleFollowUp(contacts[0].id, "2027-01-15");

    expect(contacts[0].nextFollowUpDate).toBe("2027-01-15");
  });

  test("clears the follow-up date when given an empty value", async () => {
    const { service, contacts } = await serviceWithAda("2026-12-01");

    await service.scheduleFollowUp(contacts[0].id, "");

    expect(contacts[0].nextFollowUpDate).toBeNull();
  });

  test("refuses an invalid date and keeps the previous one", async () => {
    const { service, repository, contacts } = await serviceWithAda("2026-12-01");

    const result = await service.scheduleFollowUp(contacts[0].id, "2026-13-01");

    expect(result).toEqual({ ok: false, error: "La date n'est pas valide." });
    expect(repository.update).not.toHaveBeenCalled();
    expect(contacts[0].nextFollowUpDate).toBe("2026-12-01");
  });

  test("refuses an unknown contact", async () => {
    const { service } = await serviceWithAda();

    await expect(service.scheduleFollowUp("missing", "2026-12-01")).resolves.toEqual({
      ok: false,
      error: "Contact introuvable.",
    });
  });
});

describe("overdue follow-ups", () => {
  async function overdueFlags(nextFollowUpDate: string | undefined, stage: Stage = "contacted") {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada", nextFollowUpDate });
    await service.moveContact(contacts[0].id, stage);

    const byStage = await service.listContactsByStage(TODAY);
    return byStage[stage][0].overdue;
  }

  test("flags a contact whose follow-up date is past", async () => {
    await expect(overdueFlags("2026-11-22")).resolves.toBe(true);
  });

  test("does not flag a follow-up due today", async () => {
    await expect(overdueFlags(TODAY)).resolves.toBe(false);
  });

  test("does not flag a future follow-up", async () => {
    await expect(overdueFlags("2026-11-24")).resolves.toBe(false);
  });

  test("does not flag a contact without a follow-up date", async () => {
    await expect(overdueFlags(undefined)).resolves.toBe(false);
  });

  test.each(["won", "lost"] as const)("does not flag a %s contact", async (stage) => {
    await expect(overdueFlags("2026-11-01", stage)).resolves.toBe(false);
  });
});

describe("listFollowUpsDue", () => {
  async function serviceWith(...seeds: { name: string; stage: Stage; nextFollowUpDate?: string }[]) {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    for (const { name, stage, nextFollowUpDate } of seeds) {
      await service.addContact({ name, nextFollowUpDate });
      await service.moveContact(contacts[contacts.length - 1].id, stage);
    }
    return service;
  }

  async function dueNames(...seeds: Parameters<typeof serviceWith>) {
    const service = await serviceWith(...seeds);
    return (await service.listFollowUpsDue(TODAY)).map((contact) => contact.name);
  }

  test("includes a « Contacté » contact whose follow-up is today", async () => {
    await expect(dueNames({ name: "Ada", stage: "contacted", nextFollowUpDate: TODAY })).resolves.toEqual(["Ada"]);
  });

  test("includes an « En discussion » contact whose follow-up is past", async () => {
    await expect(dueNames({ name: "Ada", stage: "talking", nextFollowUpDate: "2026-11-02" })).resolves.toEqual([
      "Ada",
    ]);
  });

  test("includes an « À contacter » contact whose follow-up is due", async () => {
    await expect(dueNames({ name: "Ada", stage: "todo", nextFollowUpDate: TODAY })).resolves.toEqual(["Ada"]);
  });

  test.each(["won", "lost"] as const)("excludes a %s contact even when its follow-up is past", async (stage) => {
    await expect(dueNames({ name: "Ada", stage, nextFollowUpDate: "2026-11-02" })).resolves.toEqual([]);
  });

  test("excludes a contact whose follow-up is tomorrow", async () => {
    await expect(dueNames({ name: "Ada", stage: "contacted", nextFollowUpDate: "2026-11-24" })).resolves.toEqual([]);
  });

  test("excludes a contact without a follow-up date", async () => {
    await expect(dueNames({ name: "Ada", stage: "contacted" })).resolves.toEqual([]);
  });

  test("lists the oldest follow-ups first and flags the overdue ones", async () => {
    const service = await serviceWith(
      { name: "Today", stage: "contacted", nextFollowUpDate: TODAY },
      { name: "Oldest", stage: "talking", nextFollowUpDate: "2026-10-01" },
      { name: "Late", stage: "contacted", nextFollowUpDate: "2026-11-20" },
    );

    const due = await service.listFollowUpsDue(TODAY);

    expect(due.map(({ name, overdue }) => ({ name, overdue }))).toEqual([
      { name: "Oldest", overdue: true },
      { name: "Late", overdue: true },
      { name: "Today", overdue: false },
    ]);
  });

  test("returns an empty list when nobody is due", async () => {
    await expect(dueNames()).resolves.toEqual([]);
  });
});

describe("getContact", () => {
  test("returns the contact with all its details", async () => {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada", company: "Engines", email: "ada@example.com", nextFollowUpDate: TODAY });

    await expect(service.getContact(contacts[0].id)).resolves.toMatchObject({
      name: "Ada",
      company: "Engines",
      email: "ada@example.com",
      notes: "",
      stage: "todo",
      nextFollowUpDate: TODAY,
    });
  });

  test("returns null for an unknown contact", async () => {
    const { repository } = createFakeRepository();

    await expect(createContactService(repository).getContact("missing")).resolves.toBeNull();
  });
});

describe("updateContact", () => {
  async function serviceWithAda() {
    const { repository, contacts } = createFakeRepository();
    const service = createContactService(repository);
    await service.addContact({ name: "Ada", company: "Engines", email: "ada@example.com" });
    return { service, repository, contacts, id: contacts[0].id };
  }

  const details = { name: "Ada", company: "Engines", email: "ada@example.com", notes: "" };

  test("saves new notes", async () => {
    const { service, contacts, id } = await serviceWithAda();

    const result = await service.updateContact(id, { ...details, notes: "Rappeler après le salon." });

    expect(result).toMatchObject({ ok: true, contact: { notes: "Rappeler après le salon." } });
    expect(contacts[0].notes).toBe("Rappeler après le salon.");
  });

  test("corrects name, company and email, trimmed", async () => {
    const { service, contacts, id } = await serviceWithAda();

    await service.updateContact(id, { name: " Ada King ", company: " Babbage ", email: " ada@babbage.example ", notes: "" });

    expect(contacts[0]).toMatchObject({ name: "Ada King", company: "Babbage", email: "ada@babbage.example" });
  });

  test("keeps stage and follow-up date untouched", async () => {
    const { service, contacts, id } = await serviceWithAda();
    await service.moveContact(id, "talking");
    await service.scheduleFollowUp(id, "2026-12-01");

    await service.updateContact(id, { ...details, notes: "x", stage: "won", nextFollowUpDate: "" } as typeof details);

    expect(contacts[0]).toMatchObject({ stage: "talking", nextFollowUpDate: "2026-12-01" });
  });

  test.each(["", "   "])("refuses an empty name (%j) and keeps the contact as it was", async (name) => {
    const { service, repository, contacts, id } = await serviceWithAda();

    const result = await service.updateContact(id, { ...details, name, notes: "nouvelles notes" });

    expect(result).toEqual({ ok: false, errors: { name: "Le nom est obligatoire." } });
    expect(repository.update).not.toHaveBeenCalled();
    expect(contacts[0]).toMatchObject({ name: "Ada", notes: "" });
  });

  test("refuses a malformed email", async () => {
    const { service, repository, id } = await serviceWithAda();

    const result = await service.updateContact(id, { ...details, email: "ada@" });

    expect(result).toEqual({ ok: false, errors: { email: "L'email n'est pas valide." } });
    expect(repository.update).not.toHaveBeenCalled();
  });

  test("refuses an unknown contact", async () => {
    const { service } = await serviceWithAda();

    await expect(service.updateContact("missing", details)).resolves.toEqual({
      ok: false,
      errors: {},
      error: "Contact introuvable.",
    });
  });

  test("shows the new values on the board", async () => {
    const { service, id } = await serviceWithAda();

    await service.updateContact(id, { ...details, name: "Ada King", company: "Babbage" });

    const byStage = await service.listContactsByStage(TODAY);
    expect(byStage.todo[0]).toMatchObject({ name: "Ada King", company: "Babbage" });
  });
});
