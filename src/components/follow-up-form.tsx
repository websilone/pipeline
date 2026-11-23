"use client";

import { useActionState } from "react";
import { FollowUpFields, type FollowUpState } from "@/components/follow-up-fields";

export type ScheduleFollowUpAction = (previous: FollowUpState, formData: FormData) => Promise<FollowUpState>;

type FollowUpFormProps = {
  contactId: string;
  contactName: string;
  date: string | null;
  action: ScheduleFollowUpAction;
};

export function FollowUpForm({ contactId, contactName, date, action }: FollowUpFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <FollowUpFields contactId={contactId} contactName={contactName} date={date} state={state} pending={pending} />
    </form>
  );
}
