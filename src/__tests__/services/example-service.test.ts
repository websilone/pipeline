import { expect, test } from "vitest";
import type { ExampleRepository } from "@/data/example-repository";
import { createExampleService } from "@/services/example-service";

test("service returns what the repository provides", async () => {
  const repository: ExampleRepository = { list: async () => [{ id: "1" }] };

  await expect(createExampleService(repository).listExamples()).resolves.toEqual([{ id: "1" }]);
});
