import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("home page renders", () => {
  expect(renderToStaticMarkup(<Home />)).toContain("Pipeline");
});
