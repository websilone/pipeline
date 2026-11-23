import { StageSelect, type MoveContactAction } from "@/components/stage-select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contact } from "@/services/contact-service";

export function ContactCard({ contact, moveAction }: { contact: Contact; moveAction: MoveContactAction }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
        {contact.company && <CardDescription>{contact.company}</CardDescription>}
      </CardHeader>
      {contact.email && <CardContent className="text-muted-foreground">{contact.email}</CardContent>}
      <CardFooter>
        <StageSelect contactId={contact.id} contactName={contact.name} stage={contact.stage} action={moveAction} />
      </CardFooter>
    </Card>
  );
}
