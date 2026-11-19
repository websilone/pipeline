import type { Example, ExampleRepository } from "@/data/example-repository";

export type { Example };

export function createExampleService(repository: ExampleRepository) {
  return {
    listExamples: (): Promise<Example[]> => repository.list(),
  };
}
