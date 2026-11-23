import { expect, test } from "vitest";
import { resolveDatabaseConfig } from "@/data/database";

test("uses Turso when its variables are set", () => {
  expect(
    resolveDatabaseConfig({ TURSO_DATABASE_URL: "libsql://pipeline-acme.turso.io", TURSO_AUTH_TOKEN: "secret" }),
  ).toEqual({ url: "libsql://pipeline-acme.turso.io", authToken: "secret" });
});

test("uses Turso on Vercel", () => {
  expect(
    resolveDatabaseConfig({
      VERCEL: "1",
      TURSO_DATABASE_URL: "libsql://pipeline-acme.turso.io",
      TURSO_AUTH_TOKEN: "secret",
    }),
  ).toEqual({ url: "libsql://pipeline-acme.turso.io", authToken: "secret" });
});

test("falls back to the local SQLite file without Turso variables", () => {
  expect(resolveDatabaseConfig({})).toEqual({ url: "file:pipeline.db" });
});

test("lets DATABASE_URL point to another local file", () => {
  expect(resolveDatabaseConfig({ DATABASE_URL: "file:/tmp/other.db" })).toEqual({ url: "file:/tmp/other.db" });
});

test("prefers Turso over DATABASE_URL", () => {
  expect(
    resolveDatabaseConfig({
      DATABASE_URL: "file:/tmp/other.db",
      TURSO_DATABASE_URL: "libsql://pipeline-acme.turso.io",
      TURSO_AUTH_TOKEN: "secret",
    }),
  ).toMatchObject({ url: "libsql://pipeline-acme.turso.io" });
});

test("ignores empty Turso variables", () => {
  expect(resolveDatabaseConfig({ TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "" })).toEqual({ url: "file:pipeline.db" });
});

test("refuses a Turso URL without its auth token", () => {
  expect(() => resolveDatabaseConfig({ TURSO_DATABASE_URL: "libsql://pipeline-acme.turso.io" })).toThrow(
    "TURSO_AUTH_TOKEN",
  );
});

test("refuses to start on Vercel without Turso, where a local file would not survive a redeploy", () => {
  expect(() => resolveDatabaseConfig({ VERCEL: "1" })).toThrow("TURSO_DATABASE_URL");
});
