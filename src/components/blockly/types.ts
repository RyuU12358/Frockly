// components/blockly/types.ts
export type WorkspaceApi = {
  insertBlock: (t: string) => void;
  insertRefBlock: (refText: string) => void;
  insertFromFormula: (formula: string) => void;

  insertFnCall?: (fnId: string) => void;
  insertFnToMain?: (fnId: string) => void;
  switchWorkspace?: (wsId: string) => void;

  view?: {
    collapseAll?: () => void;
    expandAll?: () => void;
    expandStep?: (dir: 1 | -1) => void;

    toggleFocus?: () => void;
    focusStep?: (dir: 1 | -1) => void;

    togglePath?: () => void;
    pathStep?: (dir: 1 | -1) => void;
  };
};
