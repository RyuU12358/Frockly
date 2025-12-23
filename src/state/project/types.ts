// src/state/project/types.ts

export type WorkspaceKind = "main" | "fn";

export type WorkspaceEntity = {
  id: string;
  kind: WorkspaceKind;
  title: string;
  xml: string;
  fnId?: string; // 関数WSの場合は関数IDを保持
};

export type FunctionEntity = {
  id: string; // 固定ID（呼び出しブロックはこれ参照）
  name: string;
  params: string[];
  workspaceId: string; // = 関数WSのid
  summary?: string;
};

export type ProjectState = {
  version: 1;
  activeWorkspaceId: string;
  workspaces: WorkspaceEntity[];
  functions: FunctionEntity[];
};
