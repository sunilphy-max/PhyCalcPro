/** Per-user default project id — avoids global PK collision on `"default"`. */
export function defaultProjectId(userId: string): string {
  return `default:${userId}`;
}

export function isDefaultProjectId(projectId: string): boolean {
  return projectId === "default" || projectId.startsWith("default:");
}
