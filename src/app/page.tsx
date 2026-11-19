import { Suspense } from "react";
import { connection } from "next/server";
import { addContactAction } from "@/app/actions";
import { AddContactForm } from "@/components/add-contact-form";
import { StageColumn } from "@/components/stage-column";
import { contactService, STAGES } from "@/services";

async function TodoColumn() {
  await connection();
  const contactsByStage = await contactService.listContactsByStage();
  const todo = STAGES[0];

  return <StageColumn title={todo.label} contacts={contactsByStage[todo.id]} />;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <AddContactForm action={addContactAction} />
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <TodoColumn />
        </Suspense>
      </div>
    </main>
  );
}
