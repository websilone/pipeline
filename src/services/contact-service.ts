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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactInput = { name: string; company?: string; email?: string };
export type ContactErrors = Partial<Record<"name" | "email", string>>;
export type AddContactResult = { ok: true; contact: Contact } | { ok: false; errors: ContactErrors };
export type MoveContactResult = { ok: true; contact: Contact } | { ok: false; error: string };

export function isStage(value: string): value is Stage {
  return STAGES.some((stage) => stage.id === value);
}

function validate(name: string, email: string): ContactErrors {
  const errors: ContactErrors = {};
  if (!name) errors.name = "Le nom est obligatoire.";
  if (email && !EMAIL_PATTERN.test(email)) errors.email = "L'email n'est pas valide.";
  return errors;
}

export function createContactService(repository: ContactRepository) {
  return {
    async addContact(input: ContactInput): Promise<AddContactResult> {
      const name = input.name.trim();
      const company = input.company?.trim() ?? "";
      const email = input.email?.trim() ?? "";

      const errors = validate(name, email);
      if (Object.keys(errors).length > 0) return { ok: false, errors };

      const contact = await repository.create({
        name,
        company,
        email,
        notes: "",
        stage: INITIAL_STAGE,
        nextFollowUpDate: null,
      });
      return { ok: true, contact };
    },

    async listContactsByStage(): Promise<Record<Stage, Contact[]>> {
      const contacts = await repository.list();
      return Object.fromEntries(
        STAGES.map(({ id }) => [id, contacts.filter((contact) => contact.stage === id)]),
      ) as Record<Stage, Contact[]>;
    },

    async moveContact(id: string, stage: string): Promise<MoveContactResult> {
      if (!isStage(stage)) return { ok: false, error: "Étape inconnue." };

      const contact = await repository.updateStage(id, stage);
      if (!contact) return { ok: false, error: "Contact introuvable." };
      return { ok: true, contact };
    },
  };
}
