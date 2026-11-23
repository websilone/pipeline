import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ContactSheet } from "@/components/contact-sheet";
import type { Contact } from "@/services/contact-service";

const ada: Contact = {
  id: "42",
  name: "Ada Lovelace",
  company: "Analytical Engines",
  email: "ada@example.com",
  notes: "Intéressée par l'offre annuelle",
  stage: "talking",
  nextFollowUpDate: "2026-12-01",
  createdAt: "2026-11-20T10:00:00.000Z",
};

const action = async () => ({ errors: {}, values: { name: "", company: "", email: "", notes: "" }, saved: false });

function render(contact: Contact) {
  return renderToStaticMarkup(<ContactSheet contact={contact} action={action} />);
}

function inputMarkup(html: string, name: string): string {
  const match = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`));
  if (!match) throw new Error(`no input named ${name}`);
  return match[0];
}

test("shows name, company, email, notes, stage and follow-up date", () => {
  const html = render(ada);

  expect(inputMarkup(html, "name")).toContain('value="Ada Lovelace"');
  expect(inputMarkup(html, "company")).toContain('value="Analytical Engines"');
  expect(inputMarkup(html, "email")).toContain('value="ada@example.com"');
  expect(html).toMatch(/<textarea[^>]*name="notes"[^>]*>Intéressée par l(&#x27;|')offre annuelle<\/textarea>/);
  expect(html).toContain("En discussion");
  expect(html).toContain("1 déc. 2026");
});

test("says when no follow-up is planned", () => {
  expect(render({ ...ada, nextFollowUpDate: null })).toContain("Aucune relance prévue");
});

test("sends the contact id with the form and offers a way back to the board", () => {
  const html = render(ada);

  expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="42"/);
  expect(html).toContain("Enregistrer");
  expect(html).toMatch(/<a[^>]*href="\/"[^>]*>(?:(?!<\/a>).)*Retour au tableau/);
});
