import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { StageColumn } from "@/components/stage-column";
import type { BoardContact } from "@/services/contact-service";

const ada: BoardContact = {
  id: "1",
  name: "Ada Lovelace",
  company: "Analytical Engines",
  email: "ada@example.com",
  notes: "",
  stage: "todo",
  nextFollowUpDate: null,
  createdAt: "2026-11-20T10:00:00.000Z",
  overdue: false,
};

const actions = { moveAction: async () => {}, scheduleAction: async () => ({}) };

test("shows the stage title and its contacts", () => {
  const html = renderToStaticMarkup(<StageColumn stage="todo" contacts={[ada]} {...actions} />);

  expect(html).toContain("À contacter");
  expect(html).toContain("Ada Lovelace");
  expect(html).toContain("Analytical Engines");
  expect(html).toContain("ada@example.com");
});

test("shows an empty state when the stage has no contact", () => {
  expect(renderToStaticMarkup(<StageColumn stage="todo" contacts={[]} {...actions} />)).toContain(
    "Aucun contact",
  );
});

test.each([
  ["contacted", "Contacté"],
  ["talking", "En discussion"],
  ["won", "Gagné"],
  ["lost", "Perdu"],
] as const)("titles the %s column « %s » and uses its theme tokens", (stage, label) => {
  const html = renderToStaticMarkup(<StageColumn stage={stage} contacts={[]} {...actions} />);

  expect(html).toContain(label);
  expect(html).toContain(`bg-stage-${stage}`);
  expect(html).toContain(`text-stage-${stage}-foreground`);
});
