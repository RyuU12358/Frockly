export type Ws = {
  id: string;
  title?: string;
  fnId?: string;
};

export type FnMeta = {
  id: string;
  name: string;
  params?: string[];
  description?: string;
};

export type WorkspaceManagerModalProps = {
  onClose: () => void;

  main?: Ws | null;
  fnWorkspaces: Ws[];
  activeWorkspaceId: string;

  fnByWsId: Map<string, FnMeta | undefined>;

  onSwitchWorkspace: (wsId: string) => void;
  onInsertToMain: (fnId: string) => void;
  onDuplicateFn: (fnId: string) => void;
  onDeleteFn: (fnId: string) => void;

  onCreateFn: () => { fnId: string; wsId: string };

  onUpdateFnMeta?: (
    fnId: string,
    patch: Partial<Pick<FnMeta, "name" | "description" | "params">>
  ) => void;

  onRenameFn?: (fnId: string, newName: string) => void;
};
