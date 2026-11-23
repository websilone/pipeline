"use client";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { STAGES, type Stage } from "@/services/contact-service";

export type MoveContactAction = (formData: FormData) => Promise<void>;

type StageSelectProps = {
  contactId: string;
  contactName: string;
  stage: Stage;
  action: MoveContactAction;
};

export function StageSelect({ contactId, contactName, stage, action }: StageSelectProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={contactId} />
      <NativeSelect
        name="stage"
        size="sm"
        defaultValue={stage}
        aria-label={`Étape de ${contactName}`}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {STAGES.map(({ id, label }) => (
          <NativeSelectOption key={id} value={id}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </form>
  );
}
