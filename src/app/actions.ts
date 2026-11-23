"use server";

import { revalidatePath } from "next/cache";
import { EMPTY_FORM_STATE, type ContactFormState } from "@/components/contact-form-fields";
import { contactService } from "@/services";

export async function addContactAction(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const result = await contactService.addContact(values);
  if (!result.ok) return { errors: result.errors, values };

  revalidatePath("/");
  return EMPTY_FORM_STATE;
}

export async function moveContactAction(formData: FormData): Promise<void> {
  const result = await contactService.moveContact(
    String(formData.get("id") ?? ""),
    String(formData.get("stage") ?? ""),
  );
  if (result.ok) revalidatePath("/");
}
