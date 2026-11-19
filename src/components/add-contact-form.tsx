"use client";

import { useActionState } from "react";
import { ContactFormFields, EMPTY_FORM_STATE, type ContactFormState } from "@/components/contact-form-fields";

type AddContactAction = (previous: ContactFormState, formData: FormData) => Promise<ContactFormState>;

export function AddContactForm({ action }: { action: AddContactAction }) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);

  return (
    <form action={formAction} noValidate className="flex w-full max-w-xs flex-col gap-3">
      <ContactFormFields state={state} pending={pending} />
    </form>
  );
}
