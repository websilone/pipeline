import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ContactCard } from "@/components/contact-card";
import type { BoardContact, Stage } from "@/services/contact-service";

function contactIn(stage: Stage, changes: Partial<BoardContact> = {}): BoardContact {
  return {
    id: "42",
    name: "Ada Lovelace",
    company: "",
    email: "",
    notes: "",
    stage,
    nextFollowUpDate: null,
    createdAt: "2026-11-20T10:00:00.000Z",
    overdue: false,
    ...changes,
  };
}

const actions = { moveAction: async () => {}, scheduleAction: async () => ({}) };

function render(contact: BoardContact) {
  return renderToStaticMarkup(<ContactCard contact={contact} {...actions} />);
}

function options(html: string) {
  return [...html.matchAll(/<option([^>]*)>([^<]*)<\/option>/g)].map(([, attributes, label]) => ({
    value: attributes.match(/value="([^"]*)"/)?.[1],
    selected: attributes.includes("selected"),
    label,
  }));
}

test.each(["todo", "contacted", "talking", "won", "lost"] as const)(
  "offers exactly the five fixed stages to a contact in %s, with its own stage selected",
  (stage) => {
    const offered = options(render(contactIn(stage)));

    expect(offered.map((option) => option.label)).toEqual([
      "À contacter",
      "Contacté",
      "En discussion",
      "Gagné",
      "Perdu",
    ]);
    expect(offered.map((option) => option.value)).toEqual(["todo", "contacted", "talking", "won", "lost"]);
    expect(offered.filter((option) => option.selected).map((option) => option.value)).toEqual([stage]);
  },
);

test("sends the contact id and the chosen stage", () => {
  const html = render(contactIn("todo"));

  expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="42"/);
  expect(html).toMatch(/<select[^>]*name="stage"/);
  expect(html).toMatch(/<select[^>]*aria-label="Étape de Ada Lovelace"/);
});

test("shows the follow-up date on the card", () => {
  const html = render(contactIn("contacted", { nextFollowUpDate: "2026-12-01" }));

  expect(html).toContain("Relance le 1 déc. 2026");
  expect(html).not.toContain("text-overdue");
  expect(html).not.toContain("en retard");
});

test("shows no follow-up date when none is planned", () => {
  const html = render(contactIn("contacted"));

  expect(html).toContain("Aucune relance prévue");
  expect(html).not.toContain("Relance le");
});

test("marks an overdue card « en retard » with the overdue token", () => {
  const html = render(contactIn("contacted", { nextFollowUpDate: "2026-11-01", overdue: true }));

  expect(html).toMatch(/<p class="[^"]*text-overdue[^"]*">(?:(?!<\/p>).)*Relance le 1 nov\. 2026/);
  expect(html).toContain("en retard");
});

test("offers a date field to plan or change the follow-up", () => {
  const html = render(contactIn("contacted", { nextFollowUpDate: "2026-12-01" }));

  expect(html).toMatch(/<input[^>]*type="date"[^>]*name="nextFollowUpDate"[^>]*value="2026-12-01"/);
  expect(html).toMatch(/<input[^>]*aria-label="Prochaine relance de Ada Lovelace"/);
  expect(html).toContain("Planifier");
});

test("links the contact name to its sheet", () => {
  expect(render(contactIn("todo"))).toMatch(/<a[^>]*href="\/contacts\/42"[^>]*>Ada Lovelace<\/a>/);
});
