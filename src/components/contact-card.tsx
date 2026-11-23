import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { FollowUpForm, type ScheduleFollowUpAction } from "@/components/follow-up-form";
import { StageSelect, type MoveContactAction } from "@/components/stage-select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dates";
import type { BoardContact } from "@/services/contact-service";

type ContactCardProps = {
  contact: BoardContact;
  moveAction: MoveContactAction;
  scheduleAction: ScheduleFollowUpAction;
};

function FollowUpDate({ date, overdue }: { date: string | null; overdue: boolean }) {
  if (!date) return <p className="text-muted-foreground">Aucune relance prévue</p>;

  return (
    <p className={cn("flex items-center gap-1.5", overdue ? "font-medium text-overdue" : "text-muted-foreground")}>
      <CalendarClock aria-hidden="true" className="size-3.5" />
      Relance le {formatDate(date)}
      {overdue && <span>· en retard</span>}
    </p>
  );
}

export function ContactCard({ contact, moveAction, scheduleAction }: ContactCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link href={`/contacts/${contact.id}`} className="underline-offset-4 hover:underline">
            {contact.name}
          </Link>
        </CardTitle>
        {contact.company && <CardDescription>{contact.company}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {contact.email && <p className="text-muted-foreground">{contact.email}</p>}
        <FollowUpDate date={contact.nextFollowUpDate} overdue={contact.overdue} />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <StageSelect contactId={contact.id} contactName={contact.name} stage={contact.stage} action={moveAction} />
        <FollowUpForm
          contactId={contact.id}
          contactName={contact.name}
          date={contact.nextFollowUpDate}
          action={scheduleAction}
        />
      </CardFooter>
    </Card>
  );
}
