import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { EditContactFields } from "@/components/edit-contact-fields";

const values = { name: "", company: "Engines", email: "", notes: "Mes notes" };

test("shows the name error on the name field and keeps the typed values", () => {
  const html = renderToStaticMarkup(
    <EditContactFields
      contactId="42"
      state={{ errors: { name: "Le nom est obligatoire." }, values, saved: false }}
      pending={false}
    />,
  );

  expect(html.match(/<input[^>]*name="name"[^>]*>/)?.[0]).toContain('aria-invalid="true"');
  expect(html).toMatch(/id="name-error"[^>]*>Le nom est obligatoire\./);
  expect(html).toMatch(/<textarea[^>]*name="notes"[^>]*>Mes notes<\/textarea>/);
  expect(html).not.toContain("Modifications enregistrées");
});

test("confirms a successful save", () => {
  const html = renderToStaticMarkup(
    <EditContactFields contactId="42" state={{ errors: {}, values: { ...values, name: "Ada" }, saved: true }} pending={false} />,
  );

  expect(html).toContain("Modifications enregistrées.");
  expect(html).not.toContain('aria-invalid="true"');
});

test("reports an unknown contact", () => {
  const html = renderToStaticMarkup(
    <EditContactFields
      contactId="42"
      state={{ errors: {}, values, saved: false, error: "Contact introuvable." }}
      pending={false}
    />,
  );

  expect(html).toMatch(/role="alert"[^>]*>Contact introuvable\./);
});
