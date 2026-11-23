import { beforeEach, expect, test, vi } from "vitest";
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
const { moveContactAction } = await import("@/app/actions");

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
