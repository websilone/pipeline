import { expect, test } from "vitest";
import { createInMemoryExampleRepository } from "@/data/example-repository";

test("in-memory repository starts empty", async () => {
  await expect(createInMemoryExampleRepository().list()).resolves.toEqual([]);
});
