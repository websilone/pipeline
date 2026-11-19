import type { Example } from "@/services/example-service";

export function ExampleList({ items }: { items: Example[] }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">Aucun élément</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.id}</li>
      ))}
    </ul>
  );
}
