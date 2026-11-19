import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ExampleList } from "@/components/example-list";

test("example list shows an empty state", () => {
  expect(renderToStaticMarkup(<ExampleList items={[]} />)).toContain("Aucun élément");
});

test("example list renders item ids", () => {
  expect(renderToStaticMarkup(<ExampleList items={[{ id: "42" }]} />)).toContain("42");
});
