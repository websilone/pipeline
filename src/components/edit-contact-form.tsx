"use client";

import { useActionState } from "react";
import { EditContactFields, type EditContactState } from "@/components/edit-contact-fields";

export type UpdateContactAction = (previous: EditContactState, formData: FormData) => Promise<EditContactState>;

type EditContactFormProps = { contactId: string; initialState: EditContactState; action: UpdateContactAction };

export function EditContactForm({ contactId, initialState, action }: EditContactFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <EditContactFields contactId={contactId} state={state} pending={pending} />
    </form>
  );
}
