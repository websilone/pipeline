import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ContactCard } from "@/components/contact-card";
import type { Contact, Stage } from "@/services/contact-service";

function contactIn(stage: Stage): Contact {
  return {
    id: "42",
    name: "Ada Lovelace",
    company: "",
    email: "",
    notes: "",
    stage,
    nextFollowUpDate: null,
    createdAt: "2026-11-20T10:00:00.000Z",
  };
}

const moveAction = async () => {};

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
    const html = renderToStaticMarkup(<ContactCard contact={contactIn(stage)} moveAction={moveAction} />);

    const offered = options(html);
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
  const html = renderToStaticMarkup(<ContactCard contact={contactIn("todo")} moveAction={moveAction} />);

  expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="42"/);
  expect(html).toMatch(/<select[^>]*name="stage"/);
  expect(html).toMatch(/<select[^>]*aria-label="Étape de Ada Lovelace"/);
});
