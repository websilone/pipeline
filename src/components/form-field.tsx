import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
  error?: string;
  maxLength?: number;
};

export function FormField({ name, label, type = "text", defaultValue, error, maxLength }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        maxLength={maxLength}
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
