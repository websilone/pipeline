import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { STAGES, type BoardContact } from "@/services/contact-service";

function stageLabel(stage: BoardContact["stage"]): string | undefined {
  return STAGES.find(({ id }) => id === stage)?.label;
}

export function FollowUpsDue({ contacts }: { contacts: BoardContact[] }) {
  if (contacts.length === 0) {
    return <p className="text-sm text-muted-foreground">Personne à relancer aujourd&apos;hui.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {contacts.map((contact) => (
        <li key={contact.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 text-sm">
          <span>
            <span className="font-medium">{contact.name}</span>
            {contact.company && <span className="text-muted-foreground"> · {contact.company}</span>}
          </span>
          <span className="flex items-baseline gap-3">
            <span className="text-muted-foreground">{stageLabel(contact.stage)}</span>
            <span className={cn(contact.overdue ? "font-medium text-overdue" : "text-muted-foreground")}>
              {contact.nextFollowUpDate && formatDate(contact.nextFollowUpDate)}
              {contact.overdue && " · en retard"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
