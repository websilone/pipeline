import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactErrors } from "@/services/contact-service";

export type ContactDetailsValues = { name: string; company: string; email: string; notes: string };

export type EditContactState = {
  errors: ContactErrors;
  values: ContactDetailsValues;
  saved: boolean;
  error?: string;
};

type EditContactFieldsProps = { contactId: string; state: EditContactState; pending: boolean };

export function EditContactFields({ contactId, state, pending }: EditContactFieldsProps) {
  const { errors, values } = state;

  return (
    <>
      <input type="hidden" name="id" value={contactId} />
      <FormField name="name" label="Nom" defaultValue={values.name} error={errors.name} />
      <FormField name="company" label="Entreprise" defaultValue={values.company} />
      <FormField name="email" label="Email" type="email" defaultValue={values.email} error={errors.email} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={6} defaultValue={values.notes} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          Enregistrer
        </Button>
        {state.saved && (
          <p role="status" className="text-sm text-muted-foreground">
            Modifications enregistrées.
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </>
  );
}
