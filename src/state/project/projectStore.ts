// src/state/project/projectStore.ts
import type { ProjectState } from "./types";

type Listener = () => void;

let state: ProjectState | null = null;
const listeners = new Set<Listener>();

export function getProjectState(): ProjectState {
  if (!state) {
    // 初期化は workspaceOps.ensureProjectInitialized() でやる想定
    throw new Error("[projectStore] state is not initialized yet");
  }
  return state;
}

export function setProjectState(next: ProjectState) {
  state = next;
  for (const l of listeners) l();
}

export function updateProjectState(updater: (s: ProjectState) => ProjectState) {
  const prev = getProjectState();
  setProjectState(updater(prev));
}

export function subscribeProject(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React用：最小の hook（依存なし）
 * - これを App.tsx などで呼んで state を購読
 */
import { useSyncExternalStore } from "react";

export function useProject(): ProjectState {
  return useSyncExternalStore(
    subscribeProject,
    getProjectState,
    getProjectState
  );
}

export function initProjectState(initial: ProjectState) {
  if (state) return; // 二重初期化防止
  setProjectState(initial);
}
