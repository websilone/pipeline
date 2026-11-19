import { ContactCard } from "@/components/contact-card";
import type { Contact } from "@/services/contact-service";

export function StageColumn({ title, contacts }: { title: string; contacts: Contact[] }) {
  return (
    <section className="flex w-full max-w-xs flex-col gap-3 rounded-xl bg-stage-todo p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-stage-todo-foreground">
        {title}
        <span>{contacts.length}</span>
      </h2>
      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun contact</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <ContactCard contact={contact} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
