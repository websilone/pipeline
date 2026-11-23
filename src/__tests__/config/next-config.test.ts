import { expect, test } from "vitest";
import nextConfig from "../../../next.config";

test("sends the security headers on every route", async () => {
  const rules = (await nextConfig.headers?.()) ?? [];
  const everyRoute = rules.find((rule) => rule.source === "/:path*");

  expect(everyRoute?.headers).toEqual(
    expect.arrayContaining([
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]),
  );
});
