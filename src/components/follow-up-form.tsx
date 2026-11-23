import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ScheduleFollowUpAction = (formData: FormData) => Promise<void>;

type FollowUpFormProps = {
  contactId: string;
  contactName: string;
  date: string | null;
  action: ScheduleFollowUpAction;
};

export function FollowUpForm({ contactId, contactName, date, action }: FollowUpFormProps) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={contactId} />
      <Input
        type="date"
        name="nextFollowUpDate"
        defaultValue={date ?? ""}
        aria-label={`Prochaine relance de ${contactName}`}
        className="h-7"
      />
      <Button type="submit" size="sm" variant="outline">
        Planifier
      </Button>
    </form>
  );
}
