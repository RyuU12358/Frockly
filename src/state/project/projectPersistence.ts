// src/state/project/projectPersistence.ts
import type { ProjectState } from "./types";

export function exportProjectJson(s: ProjectState): string {
  return JSON.stringify(s, null, 2);
}

export function importProjectJson(text: string): ProjectState {
  const obj = JSON.parse(text) as ProjectState;

  // 超最低限のバリデーション
  if (!obj || obj.version !== 1) {
    throw new Error("[importProjectJson] invalid version");
  }
  if (
    !obj.activeWorkspaceId ||
    !Array.isArray(obj.workspaces) ||
    !Array.isArray(obj.functions)
  ) {
    throw new Error("[importProjectJson] invalid shape");
  }
  return obj;
}
