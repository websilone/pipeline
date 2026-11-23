"use server";

import { revalidatePath } from "next/cache";
import { EMPTY_FORM_STATE, type ContactFormState } from "@/components/contact-form-fields";
import type { EditContactState } from "@/components/edit-contact-fields";
import { contactService } from "@/services";

export async function addContactAction(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    nextFollowUpDate: String(formData.get("nextFollowUpDate") ?? ""),
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

export async function scheduleFollowUpAction(formData: FormData): Promise<void> {
  const result = await contactService.scheduleFollowUp(
    String(formData.get("id") ?? ""),
    String(formData.get("nextFollowUpDate") ?? ""),
  );
  if (result.ok) revalidatePath("/");
}

export async function updateContactAction(_previous: EditContactState, formData: FormData): Promise<EditContactState> {
  const id = String(formData.get("id") ?? "");
  const values = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const result = await contactService.updateContact(id, values);
  if (!result.ok) return { errors: result.errors, values, saved: false, ...(result.error && { error: result.error }) };

  revalidatePath("/");
  revalidatePath(`/contacts/${id}`);
  return { errors: {}, values, saved: true };
}
