import type { Contact, ContactRepository, Stage } from "@/data/contact-repository";

export type { Contact, Stage };

export const STAGES: readonly { id: Stage; label: string }[] = [
  { id: "todo", label: "À contacter" },
  { id: "contacted", label: "Contacté" },
  { id: "talking", label: "En discussion" },
  { id: "won", label: "Gagné" },
  { id: "lost", label: "Perdu" },
];

const INITIAL_STAGE: Stage = "todo";
const CLOSED_STAGES: readonly Stage[] = ["won", "lost"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const INVALID_DATE = "La date n'est pas valide.";
const UNKNOWN_CONTACT = "Contact introuvable.";

/** A day as "YYYY-MM-DD", e.g. "2026-11-23". */
export type IsoDate = string;

export type ContactInput = { name: string; company?: string; email?: string; nextFollowUpDate?: string };
export type ContactErrors = Partial<Record<"name" | "email" | "nextFollowUpDate", string>>;
export type AddContactResult = { ok: true; contact: Contact } | { ok: false; errors: ContactErrors };
export type UpdateResult = { ok: true; contact: Contact } | { ok: false; error: string };
export type BoardContact = Contact & { overdue: boolean };

export function isStage(value: string): value is Stage {
  return STAGES.some((stage) => stage.id === value);
}

/** Returns the normalized date, null for an empty value, or undefined when the value is not a real day. */
function parseDate(raw: string): IsoDate | null | undefined {
  const value = raw.trim();
  if (!value) return null;

  const match = DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDay = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDay ? value : undefined;
}

function isOpen(contact: Contact): boolean {
  return !CLOSED_STAGES.includes(contact.stage);
}

function isOverdue(contact: Contact, today: IsoDate): boolean {
  return isOpen(contact) && contact.nextFollowUpDate !== null && contact.nextFollowUpDate < today;
}

function isDue(contact: Contact, today: IsoDate): boolean {
  return isOpen(contact) && contact.nextFollowUpDate !== null && contact.nextFollowUpDate <= today;
}

function toBoardContact(contact: Contact, today: IsoDate): BoardContact {
  return { ...contact, overdue: isOverdue(contact, today) };
}

function validate(name: string, email: string, nextFollowUpDate: IsoDate | null | undefined): ContactErrors {
  const errors: ContactErrors = {};
  if (!name) errors.name = "Le nom est obligatoire.";
  if (email && !EMAIL_PATTERN.test(email)) errors.email = "L'email n'est pas valide.";
  if (nextFollowUpDate === undefined) errors.nextFollowUpDate = INVALID_DATE;
  return errors;
}

export function createContactService(repository: ContactRepository) {
  return {
    async addContact(input: ContactInput): Promise<AddContactResult> {
      const name = input.name.trim();
      const company = input.company?.trim() ?? "";
      const email = input.email?.trim() ?? "";
      const nextFollowUpDate = parseDate(input.nextFollowUpDate ?? "");

      const errors = validate(name, email, nextFollowUpDate);
      if (Object.keys(errors).length > 0 || nextFollowUpDate === undefined) return { ok: false, errors };

      const contact = await repository.create({
        name,
        company,
        email,
        notes: "",
        stage: INITIAL_STAGE,
        nextFollowUpDate,
      });
      return { ok: true, contact };
    },

    async listContactsByStage(today: IsoDate): Promise<Record<Stage, BoardContact[]>> {
      const contacts = (await repository.list()).map((contact) => toBoardContact(contact, today));
      return Object.fromEntries(
        STAGES.map(({ id }) => [id, contacts.filter((contact) => contact.stage === id)]),
      ) as Record<Stage, BoardContact[]>;
    },

    /** Open contacts whose follow-up is today or past, oldest follow-up first. */
    async listFollowUpsDue(today: IsoDate): Promise<BoardContact[]> {
      return (await repository.list())
        .filter((contact) => isDue(contact, today))
        .sort((a, b) => (a.nextFollowUpDate ?? "").localeCompare(b.nextFollowUpDate ?? ""))
        .map((contact) => toBoardContact(contact, today));
    },

    async moveContact(id: string, stage: string): Promise<UpdateResult> {
      if (!isStage(stage)) return { ok: false, error: "Étape inconnue." };

      const contact = await repository.updateStage(id, stage);
      if (!contact) return { ok: false, error: UNKNOWN_CONTACT };
      return { ok: true, contact };
    },

    async scheduleFollowUp(id: string, date: string): Promise<UpdateResult> {
      const nextFollowUpDate = parseDate(date);
      if (nextFollowUpDate === undefined) return { ok: false, error: INVALID_DATE };

      const contact = await repository.update(id, { nextFollowUpDate });
      if (!contact) return { ok: false, error: UNKNOWN_CONTACT };
      return { ok: true, contact };
    },
  };
}
