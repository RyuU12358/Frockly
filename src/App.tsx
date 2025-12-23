import { useMemo, useRef, useState } from "react";
import { ExcelRibbon } from "./components/ribbon/ExcelRibbon";
import { ExcelGrid } from "./components/excelGrid/ExcelGrid";
import { BlocklyWorkspace } from "./components/blockly/BlocklyWorkspace";
import { FormulaDisplay } from "./components/fomula/FormulaDisplay";
import { findWorkspace } from "./state/project/workspaceOps";
import { useProject } from "./state/project/projectStore";
import {
  ensureProjectInitialized,
  createNamedFunction,
  duplicateNamedFunction,
  deleteNamedFunction,
  renameNamedFunction,
} from "./state/project/workspaceOps";

export default function App() {
  // ★最初にプロジェクト初期化（二重呼びでも安全）
  ensureProjectInitialized();
  const project = useProject();
  const activeWs = findWorkspace(project, project.activeWorkspaceId);
  const activeWsTitle = activeWs?.title ?? "???";

  const [selectedCategory] = useState("math");
  const [uiLang, setUiLang] = useState<"en" | "ja">("en");

  const [formula, setFormula] = useState("");
  const [selectedCell, setSelectedCell] = useState("A1");

  // ★ここを拡張
  const [ribbonTab, setRibbonTab] = useState<"functions" | "named" | "view">(
    "functions"
  );

  // ★追加：ON/OFF表示用のstate（同時ON可能）
  const [focusOn, setFocusOn] = useState(false);
  const [pathOn, setPathOn] = useState(false);

  type WorkspaceApi = {
    insertBlock: (t: string) => void;
    insertRefBlock: (refText: string) => void;
    insertFromFormula: (formula: string) => void;

    // ★追加：名前付き関数（BlocklyWorkspace側で実装する）
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

  const workspaceApiRef = useRef<WorkspaceApi | null>(null);

  const [leftWidth, setLeftWidth] = useState(700);

  const startDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = startWidth + diff;
      if (newWidth > 200 && newWidth < 900) setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ★追加：トグル操作（Workspaceにも反映、UIも反映）
  const onToggleFocus = () => {
    workspaceApiRef.current?.view?.toggleFocus?.();
    setFocusOn((v) => !v);
    setPathOn(false); // ★必須
  };

  const onTogglePath = () => {
    workspaceApiRef.current?.view?.togglePath?.();
    setPathOn((v) => !v);
    setFocusOn(false); // ★必須
  };

  // ★Ribbonへ渡すデータを project から作る
  const namedFns = useMemo(() => {
    return project.functions.map((f) => ({
      id: f.id,
      name: f.name,
      params: f.params,
      workspaceId: f.workspaceId,
    }));
  }, [project.functions]);

  const workspaces = useMemo(() => {
    // main + fn
    const out = project.workspaces.map((w) => {
      if (w.kind === "main") {
        return { id: w.id, title: w.title, kind: "main" as const };
      }
      // fn workspace は functions と突合して fnId を付ける（あれば）
      const fn = project.functions.find((f) => f.workspaceId === w.id);
      return {
        id: w.id,
        title: w.title,
        kind: "fn" as const,
        fnId: fn?.id,
      };
    });
    return out;
  }, [project.workspaces, project.functions]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ExcelRibbon
        selectedTab={ribbonTab}
        onTabChange={setRibbonTab}
        onBlockClick={(blockType) =>
          workspaceApiRef.current?.insertBlock(blockType)
        }
        uiLang={uiLang}
        onUiLangChange={setUiLang}
        onWorkspaceApi={workspaceApiRef}
        // ★追加：View状態と操作を渡す
        focusOn={focusOn}
        pathOn={pathOn}
        onToggleFocus={onToggleFocus}
        onTogglePath={onTogglePath}
        // ★追加：名前付き関数タブへ渡す
        namedFns={namedFns}
        workspaces={workspaces}
        activeWorkspaceId={project.activeWorkspaceId}
        onCreateNamedFn={() => createNamedFunction("A", [])}
        onDuplicateNamedFn={(fnId) => duplicateNamedFunction(fnId)}
        onDeleteNamedFn={(fnId) => deleteNamedFunction(fnId)}
        onRenameNamedFn={(fnId, newName) => renameNamedFunction(fnId, newName)}
        activeWorkspaceTitle={activeWsTitle}
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          style={{ width: leftWidth }}
          className="border-r border-gray-300 bg-white"
        >
          <ExcelGrid
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
            onAddRefBlock={(refText) =>
              workspaceApiRef.current?.insertRefBlock(refText)
            }
            uiLang={uiLang}
          />
        </div>

        <div
          onMouseDown={startDrag}
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-300"
        />

        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 border-b border-gray-300">
            <BlocklyWorkspace
              category={selectedCategory}
              onFormulaChange={setFormula}
              selectedCell={selectedCell}
              onWorkspaceApi={(api) => (workspaceApiRef.current = api)}
              uiLang={uiLang}
            />
          </div>

          <div className="h-32 border-t border-gray-300">
            <FormulaDisplay formula={formula} uiLang={uiLang} />
          </div>
        </div>
      </div>
    </div>
  );
}
