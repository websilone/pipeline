import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { FollowUpsDue } from "@/components/follow-ups-due";
import type { BoardContact } from "@/services/contact-service";

function contact(changes: Partial<BoardContact>): BoardContact {
  return {
    id: "1",
    name: "Ada Lovelace",
    company: "Analytical Engines",
    email: "",
    notes: "",
    stage: "contacted",
    nextFollowUpDate: "2026-11-23",
    createdAt: "2026-11-20T10:00:00.000Z",
    overdue: false,
    ...changes,
  };
}

test("lists each contact to follow up with its company, stage and date", () => {
  const html = renderToStaticMarkup(
    <FollowUpsDue
      contacts={[
        contact({ id: "1" }),
        contact({ id: "2", name: "Grace Hopper", company: "", stage: "talking", nextFollowUpDate: "2026-11-02", overdue: true }),
      ]}
    />,
  );

  expect(html).toContain("Ada Lovelace");
  expect(html).toContain("Analytical Engines");
  expect(html).toContain("Contacté");
  expect(html).toContain("23 nov. 2026");
  expect(html).toContain("Grace Hopper");
  expect(html).toContain("En discussion");
  expect(html).toMatch(/<[^>]*class="[^"]*text-overdue[^"]*"[^>]*>(?:(?!<\/li>).)*2 nov\. 2026/);
  expect(html.match(/<li/g)).toHaveLength(2);
});

test("shows an empty state when nobody is due", () => {
  const html = renderToStaticMarkup(<FollowUpsDue contacts={[]} />);

  expect(html).toContain("Personne à relancer aujourd&#x27;hui.");
  expect(html).not.toContain("<li");
});
