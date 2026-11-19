import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contact } from "@/services/contact-service";

export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
        {contact.company && <CardDescription>{contact.company}</CardDescription>}
      </CardHeader>
      {contact.email && <CardContent className="text-muted-foreground">{contact.email}</CardContent>}
    </Card>
  );
}
