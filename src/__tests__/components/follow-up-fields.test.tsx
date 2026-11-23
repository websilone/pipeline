import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { FollowUpFields } from "@/components/follow-up-fields";

const props = { contactId: "42", contactName: "Ada Lovelace", date: "2026-12-01", pending: false };

test("shows no error by default", () => {
  const html = renderToStaticMarkup(<FollowUpFields {...props} state={{}} />);

  expect(html).not.toContain('role="alert"');
  expect(html).not.toContain('aria-invalid="true"');
});

test("reports a refused follow-up date with the destructive token", () => {
  const html = renderToStaticMarkup(<FollowUpFields {...props} state={{ error: "La date n'est pas valide." }} />);

  expect(html).toMatch(/<p[^>]*role="alert"[^>]*class="[^"]*text-destructive[^"]*"[^>]*>La date n(&#x27;|')est pas valide\./);
  expect(html.match(/<input[^>]*name="nextFollowUpDate"[^>]*>/)?.[0]).toContain('aria-invalid="true"');
});
