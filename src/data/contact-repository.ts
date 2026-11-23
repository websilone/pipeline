export type Stage = "todo" | "contacted" | "talking" | "won" | "lost";

export type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  notes: string;
  stage: Stage;
  nextFollowUpDate: string | null;
  createdAt: string;
};

export type NewContact = Omit<Contact, "id" | "createdAt">;

export type ContactChanges = Partial<Pick<Contact, "name" | "company" | "email" | "notes" | "nextFollowUpDate">>;

export interface ContactRepository {
  create(input: NewContact): Promise<Contact>;
  list(): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  /** Returns the updated contact, or null when no contact has this id. */
  updateStage(id: string, stage: Stage): Promise<Contact | null>;
  /** Applies the given changes. Returns the updated contact, or null when no contact has this id. */
  update(id: string, changes: ContactChanges): Promise<Contact | null>;
}
