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

export interface ContactRepository {
  create(input: NewContact): Promise<Contact>;
  list(): Promise<Contact[]>;
}
