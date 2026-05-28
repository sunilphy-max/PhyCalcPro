export type StoredEntity = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type PhysicsProject = StoredEntity & {
  name: string;
  description?: string;
  tags: string[];
};

export type PhysicsModel = StoredEntity & {
  projectId: string;
  title: string;
  moduleId: string;
  payload: Record<string, unknown>;
};

export type PhysicsEquation = StoredEntity & {
  projectId: string;
  modelId?: string;
  title: string;
  expression: string;
  outputDimension: string;
  variableSpecs: Array<{
    key: string;
    dimension: string;
    min?: number;
    max?: number;
  }>;
};

export type PhysicsRun = StoredEntity & {
  projectId: string;
  modelId?: string;
  equationId?: string;
  status: "queued" | "running" | "succeeded" | "failed";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
};

export type CollectionName = "projects" | "models" | "equations" | "runs";
