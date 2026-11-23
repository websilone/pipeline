import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type FieldProps = {
  name: keyof ContactFormValues;
  label: string;
  type?: string;
  state: ContactFormState;
};

function Field({ name, label, type = "text", state }: FieldProps) {
  const error = name === "company" ? undefined : state.errors[name];
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={state.values[name]}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactFormFields({ state, pending }: { state: ContactFormState; pending: boolean }) {
  return (
    <>
      <Field name="name" label="Nom" state={state} />
      <Field name="company" label="Entreprise" state={state} />
      <Field name="email" label="Email" type="email" state={state} />
      <Field name="nextFollowUpDate" label="Prochaine relance" type="date" state={state} />
      <Button type="submit" disabled={pending}>
        Ajouter
      </Button>
    </>
  );
}
