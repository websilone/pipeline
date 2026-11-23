import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import type { ContactErrors } from "@/services/contact-service";

export type ContactFormValues = { name: string; company: string; email: string; nextFollowUpDate: string };

export type ContactFormState = {
  errors: ContactErrors;
  values: ContactFormValues;
};

export const EMPTY_FORM_STATE: ContactFormState = {
  errors: {},
  values: { name: "", company: "", email: "", nextFollowUpDate: "" },
};

export function ContactFormFields({ state, pending }: { state: ContactFormState; pending: boolean }) {
  const { errors, values } = state;

  return (
    <>
      <FormField name="name" label="Nom" defaultValue={values.name} error={errors.name} />
      <FormField name="company" label="Entreprise" defaultValue={values.company} />
      <FormField name="email" label="Email" type="email" defaultValue={values.email} error={errors.email} />
      <FormField
        name="nextFollowUpDate"
        label="Prochaine relance"
        type="date"
        defaultValue={values.nextFollowUpDate}
        error={errors.nextFollowUpDate}
      />
      <Button type="submit" disabled={pending}>
        Ajouter
      </Button>
    </>
  );
}
