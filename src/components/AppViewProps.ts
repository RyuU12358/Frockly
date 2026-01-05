import type { WorkspaceApi } from "./blockly/types";
import type { CellMap } from "./excelGrid";
import type { CellRange } from "./excelGrid/types";
import type { RibbonTab } from "./ribbon/ExcelRibbon";

export type AppViewNamedFn = {
  id: string;
  name: string;
  params: string[];
  workspaceId: string;
  description: string;
};

export type AppViewWsItem = {
  id: string;
  title: string;
  kind: "main" | "fn";
  fnId?: string;
};

export type AppViewUiProps = {
  ribbonTab: RibbonTab;
  setRibbonTab: (v: RibbonTab) => void;

  uiLang: "en" | "ja";
  setUiLang: (v: "en" | "ja") => void;

  leftWidth: number;
  onStartSplitDrag: (e: React.MouseEvent) => void;

  focusOn: boolean;
  pathOn: boolean;
  onToggleFocus: () => void;
  onTogglePath: () => void;
};
export type CreateFnResult = { fnId: string; wsId: string };
export type AppViewProjectProps = {
  project: any; // TODO: ProjectState に差し替え
  activeWorkspaceTitle: string;

  namedFns: AppViewNamedFn[];
  workspaces: AppViewWsItem[];

  // Ribbon: named fn ops
  onCreateNamedFn: () => CreateFnResult;
  onDuplicateNamedFn: (fnId: string) => void;
  onDeleteNamedFn: (fnId: string) => void;
  onRenameNamedFn: (fnId: string, newName: string) => void;
  onUpdateNamedFnMeta: (fnId: string, patch: any) => void;

  // Ribbon: import/export
  onExportNamedFns: () => void;
  onImportNamedFns: (file: File) => Promise<void>;

  // Ribbon: xlsx
  onImportXlsx: (file: File) => Promise<void>;
  sheets: string[];
  activeSheet: number;
  onChangeSheet: (idx: number) => void;
};

export type AppViewRefs = {
  workspaceApiRef: React.MutableRefObject<WorkspaceApi | null>;
};

export type AppViewGridProps = {
  selectedCell: string;
  setSelectedCell: (v: string) => void;

  cells: CellMap;
  onCellsChange: (updater: (c: CellMap) => CellMap) => void;

  highlightRange: CellRange | null;
  setHighlightRange: (r: CellRange | null) => void;
};

export type AppViewFormulaProps = {
  formula: string;
  setFormula: (v: string) => void;
};

export type AppViewProps = {
  ui: AppViewUiProps;
  projectCtx: AppViewProjectProps;
  refs: AppViewRefs;
  grid: AppViewGridProps;
  formula: AppViewFormulaProps;

  // いまは固定でええなら省略してもOK
  blockCategory?: string;
  // ★追加：数式から作成（モーダルを開く）
  onImportFromFormula?: () => void;
};
