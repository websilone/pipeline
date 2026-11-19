import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ContactFormFields, EMPTY_FORM_STATE } from "@/components/contact-form-fields";

function fieldMarkup(html: string, name: string): string {
  const match = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`));
  if (!match) throw new Error(`no input named ${name}`);
  return match[0];
}

test("renders name, company and email fields without errors", () => {
  const html = renderToStaticMarkup(<ContactFormFields state={EMPTY_FORM_STATE} pending={false} />);

  for (const name of ["name", "company", "email"]) {
    expect(fieldMarkup(html, name)).not.toContain('aria-invalid="true"');
  }
  expect(html).toContain("Ajouter");
});

test("shows the name error on the name field", () => {
  const html = renderToStaticMarkup(
    <ContactFormFields
      state={{ errors: { name: "Le nom est obligatoire." }, values: { name: "", company: "Acme", email: "" } }}
      pending={false}
    />,
  );

  expect(fieldMarkup(html, "name")).toContain('aria-invalid="true"');
  expect(fieldMarkup(html, "name")).toContain('aria-describedby="name-error"');
  expect(html).toMatch(/id="name-error"[^>]*>Le nom est obligatoire\./);
  expect(fieldMarkup(html, "email")).not.toContain('aria-invalid="true"');
  expect(fieldMarkup(html, "company")).toContain('value="Acme"');
});

test("shows the email error on the email field", () => {
  const html = renderToStaticMarkup(
    <ContactFormFields
      state={{ errors: { email: "L'email n'est pas valide." }, values: { name: "Ada", company: "", email: "ada@" } }}
      pending={false}
    />,
  );

  expect(fieldMarkup(html, "email")).toContain('aria-invalid="true"');
  expect(html).toMatch(/id="email-error"[^>]*>L(&#x27;|')email n(&#x27;|')est pas valide\./);
  expect(fieldMarkup(html, "email")).toContain('value="ada@"');
});
