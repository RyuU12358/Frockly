// src/components/blockly/view/types.ts
import type * as Blockly from "blockly";

export type WsRef = { current: Blockly.WorkspaceSvg | null };

export type ViewDeps = {
  wsRef: WsRef;
  // 追加で必要なら注入（例：ログ関数、設定、イベント通知など）
  log?: (...args: any[]) => void;
};

export type ViewApi = {
  // collapse
  collapseAll: () => void;
  expandAll: () => void;
  expandStep: (dir: 1 | -1) => void;

  // focus
  toggleFocus: () => void;
  focusStep: (dir: 1 | -1) => void;

  // path
  togglePath: () => void;
  pathStep: (dir: 1 | -1) => void;
};
