import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("home page renders", () => {
  expect(renderToStaticMarkup(<Home />)).toContain("Pipeline");
});

test("home page has a « À relancer aujourd'hui » section", () => {
  expect(renderToStaticMarkup(<Home />)).toMatch(/<h2[^>]*>À relancer aujourd(&#x27;|')hui<\/h2>/);
});

test("the « À relancer aujourd'hui » heading uses the card title component", () => {
  expect(renderToStaticMarkup(<Home />)).toMatch(/<div data-slot="card-title"[^>]*><h2>À relancer aujourd(&#x27;|')hui<\/h2><\/div>/);
});
