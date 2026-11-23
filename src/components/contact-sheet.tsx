import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditContactForm, type UpdateContactAction } from "@/components/edit-contact-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { STAGES, type Contact } from "@/services/contact-service";

export function ContactSheet({ contact, action }: { contact: Contact; action: UpdateContactAction }) {
  const stage = STAGES.find(({ id }) => id === contact.stage)?.label;
  const followUp = contact.nextFollowUpDate ? formatDate(contact.nextFollowUpDate) : "Aucune relance prévue";
  const { name, company, email, notes } = contact;

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}>
        <ArrowLeft aria-hidden="true" />
        Retour au tableau
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{contact.name}</h1>
          </CardTitle>
          <CardDescription>
            <dl className="flex flex-wrap gap-x-6 gap-y-1">
              <div className="flex gap-1.5">
                <dt>Étape :</dt>
                <dd className="text-foreground">{stage}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Prochaine relance :</dt>
                <dd className="text-foreground">{followUp}</dd>
              </div>
            </dl>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditContactForm
            contactId={contact.id}
            initialState={{ errors: {}, values: { name, company, email, notes }, saved: false }}
            action={action}
          />
        </CardContent>
      </Card>
    </div>
  );
}
