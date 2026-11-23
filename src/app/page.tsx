import { Suspense } from "react";
import { connection } from "next/server";
import { addContactAction, moveContactAction, scheduleFollowUpAction } from "@/app/actions";
import { AddContactForm } from "@/components/add-contact-form";
import { FollowUpsDue } from "@/components/follow-ups-due";
import { StageColumn } from "@/components/stage-column";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { todayInParis } from "@/lib/dates";
import { contactService, STAGES } from "@/services";

async function Board() {
  await connection();
  const contactsByStage = await contactService.listContactsByStage(todayInParis());

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STAGES.map(({ id }) => (
        <StageColumn
          key={id}
          stage={id}
          contacts={contactsByStage[id]}
          moveAction={moveContactAction}
          scheduleAction={scheduleFollowUpAction}
        />
      ))}
    </div>
  );
}

async function DueToday() {
  await connection();
  const contacts = await contactService.listFollowUpsDue(todayInParis());

  return <FollowUpsDue contacts={contacts} />;
}

const loading = <p className="text-sm text-muted-foreground">Chargement…</p>;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <AddContactForm action={addContactAction} />
        <Card className="w-full max-w-xl">
          <CardHeader>
            <h2 className="font-heading text-base font-medium">À relancer aujourd&apos;hui</h2>
          </CardHeader>
          <CardContent>
            <Suspense fallback={loading}>
              <DueToday />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      <Suspense fallback={loading}>
        <Board />
      </Suspense>
    </main>
  );
}
