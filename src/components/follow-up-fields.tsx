import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type FollowUpState = { error?: string };

type FollowUpFieldsProps = {
  contactId: string;
  contactName: string;
  date: string | null;
  state: FollowUpState;
  pending: boolean;
};

export function FollowUpFields({ contactId, contactName, date, state, pending }: FollowUpFieldsProps) {
  const errorId = `follow-up-error-${contactId}`;

  return (
    <>
      <div className="flex items-center gap-2">
        <input type="hidden" name="id" value={contactId} />
        <Input
          type="date"
          name="nextFollowUpDate"
          defaultValue={date ?? ""}
          aria-label={`Prochaine relance de ${contactName}`}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? errorId : undefined}
          className="h-7"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          Planifier
        </Button>
      </div>
      {state.error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </>
  );
}
