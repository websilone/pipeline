import { ContactCard } from "@/components/contact-card";
import type { ScheduleFollowUpAction } from "@/components/follow-up-form";
import type { MoveContactAction } from "@/components/stage-select";
import { cn } from "@/lib/utils";
import { STAGES, type BoardContact, type Stage } from "@/services/contact-service";

const STAGE_STYLES: Record<Stage, { column: string; title: string }> = {
  todo: { column: "bg-stage-todo", title: "text-stage-todo-foreground" },
  contacted: { column: "bg-stage-contacted", title: "text-stage-contacted-foreground" },
  talking: { column: "bg-stage-talking", title: "text-stage-talking-foreground" },
  won: { column: "bg-stage-won", title: "text-stage-won-foreground" },
  lost: { column: "bg-stage-lost", title: "text-stage-lost-foreground" },
};

type StageColumnProps = {
  stage: Stage;
  contacts: BoardContact[];
  moveAction: MoveContactAction;
  scheduleAction: ScheduleFollowUpAction;
};

export function StageColumn({ stage, contacts, moveAction, scheduleAction }: StageColumnProps) {
  const label = STAGES.find(({ id }) => id === stage)?.label;
  const styles = STAGE_STYLES[stage];

  return (
    <section className={cn("flex w-64 shrink-0 flex-col gap-3 rounded-xl p-3", styles.column)}>
      <h2 className={cn("flex items-center justify-between text-sm font-medium", styles.title)}>
        {label}
        <span>{contacts.length}</span>
      </h2>
      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun contact</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <ContactCard contact={contact} moveAction={moveAction} scheduleAction={scheduleAction} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
