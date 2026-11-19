export type Example = { id: string };

// Contract that future SQLite / Turso implementations will fulfil.
export interface ExampleRepository {
  list(): Promise<Example[]>;
}

export function createInMemoryExampleRepository(): ExampleRepository {
  return {
    list: async () => [],
  };
}
