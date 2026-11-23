import { Suspense } from "react";
import { notFound } from "next/navigation";
import { updateContactAction } from "@/app/actions";
import { ContactSheet } from "@/components/contact-sheet";
import { contactService } from "@/services";

async function Sheet({ id }: { id: string }) {
  const contact = await contactService.getContact(id);
  if (!contact) notFound();

  return <ContactSheet contact={contact} action={updateContactAction} />;
}

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
        {params.then(({ id }) => (
          <Sheet id={id} />
        ))}
      </Suspense>
    </main>
  );
}
