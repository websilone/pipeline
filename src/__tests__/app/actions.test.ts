import { beforeEach, describe, expect, test, vi } from "vitest";
import { createContactService } from "@/services/contact-service";
import { createFakeRepository } from "../helpers/fake-contact-repository";

const fake = vi.hoisted(() => ({ service: undefined as unknown as ReturnType<typeof createContactService> }));

vi.mock("@/services", () => ({
  get contactService() {
    return fake.service;
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { revalidatePath } = await import("next/cache");
const { addContactAction, moveContactAction, scheduleFollowUpAction, updateContactAction } = await import(
  "@/app/actions"
);
const { EMPTY_FORM_STATE } = await import("@/components/contact-form-fields");

let contacts: ReturnType<typeof createFakeRepository>["contacts"];

beforeEach(async () => {
  vi.mocked(revalidatePath).mockClear();
  const fakeRepository = createFakeRepository();
  contacts = fakeRepository.contacts;
  fake.service = createContactService(fakeRepository.repository);
  await fake.service.addContact({ name: "Ada" });
});

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

test("moves the contact and refreshes the board", async () => {
  await moveContactAction(formData({ id: contacts[0].id, stage: "contacted" }));

  expect(contacts[0].stage).toBe("contacted");
  expect(revalidatePath).toHaveBeenCalledWith("/");
});

test("refuses an unknown stage sent to the server and keeps the contact's stage", async () => {
  await moveContactAction(formData({ id: contacts[0].id, stage: "archived" }));

  expect(contacts[0].stage).toBe("todo");
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("refuses a request without a stage", async () => {
  await moveContactAction(formData({ id: contacts[0].id }));

  expect(contacts[0].stage).toBe("todo");
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("adds a contact with its follow-up date", async () => {
  await addContactAction(
    EMPTY_FORM_STATE,
    formData({ name: "Grace", company: "", email: "", nextFollowUpDate: "2026-12-01" }),
  );

  expect(contacts[1]).toMatchObject({ name: "Grace", nextFollowUpDate: "2026-12-01" });
});

test("returns the date error and the typed values when the date is invalid", async () => {
  const values = { name: "Grace", company: "", email: "", nextFollowUpDate: "2026-02-30" };

  const state = await addContactAction(EMPTY_FORM_STATE, formData(values));

  expect(state).toEqual({ errors: { nextFollowUpDate: "La date n'est pas valide." }, values });
  expect(contacts).toHaveLength(1);
});

test("plans a follow-up date from the card and refreshes the board", async () => {
  await scheduleFollowUpAction(formData({ id: contacts[0].id, nextFollowUpDate: "2026-12-01" }));

  expect(contacts[0].nextFollowUpDate).toBe("2026-12-01");
  expect(revalidatePath).toHaveBeenCalledWith("/");
});

test("refuses an invalid follow-up date sent from the card", async () => {
  await scheduleFollowUpAction(formData({ id: contacts[0].id, nextFollowUpDate: "nope" }));

  expect(contacts[0].nextFollowUpDate).toBeNull();
  expect(revalidatePath).not.toHaveBeenCalled();
});

describe("updateContactAction", () => {
  const initial = { errors: {}, values: { name: "", company: "", email: "", notes: "" }, saved: false };

  test("saves the notes, confirms, and refreshes the board and the sheet", async () => {
    const values = { name: "Ada", company: "Engines", email: "", notes: "Rappeler mardi" };

    const state = await updateContactAction(initial, formData({ id: contacts[0].id, ...values }));

    expect(state).toEqual({ errors: {}, values, saved: true });
    expect(contacts[0]).toMatchObject(values);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith(`/contacts/${contacts[0].id}`);
  });

  test("refuses an empty name with an error and keeps the contact", async () => {
    const values = { name: "", company: "", email: "", notes: "Rappeler mardi" };

    const state = await updateContactAction(initial, formData({ id: contacts[0].id, ...values }));

    expect(state).toEqual({ errors: { name: "Le nom est obligatoire." }, values, saved: false });
    expect(contacts[0]).toMatchObject({ name: "Ada", notes: "" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("reports an unknown contact", async () => {
    const values = { name: "Ada", company: "", email: "", notes: "" };

    const state = await updateContactAction(initial, formData({ id: "missing", ...values }));

    expect(state).toEqual({ errors: {}, values, saved: false, error: "Contact introuvable." });
  });
});
