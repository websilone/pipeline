import { Suspense } from "react";
import { connection } from "next/server";
import { addContactAction, moveContactAction } from "@/app/actions";
import { AddContactForm } from "@/components/add-contact-form";
import { StageColumn } from "@/components/stage-column";
import { contactService, STAGES } from "@/services";

async function Board() {
  await connection();
  const contactsByStage = await contactService.listContactsByStage();

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STAGES.map(({ id }) => (
        <StageColumn key={id} stage={id} contacts={contactsByStage[id]} moveAction={moveContactAction} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
      <AddContactForm action={addContactAction} />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
        <Board />
      </Suspense>
    </main>
  );
}
