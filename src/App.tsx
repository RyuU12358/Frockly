import { useMemo, useRef, useState } from "react";
import { ExcelRibbon,type RibbonTab } from "./components/ribbon/ExcelRibbon";
import { ExcelGrid } from "./components/excelGrid/ExcelGrid";
import { BlocklyWorkspace } from "./components/blockly/BlocklyWorkspace";
import { FormulaDisplay } from "./components/fomula/FormulaDisplay";
import { findWorkspace } from "./state/project/workspaceOps";
import { getProjectState, useProject } from "./state/project/projectStore";
import {
  ensureProjectInitialized,
  createNamedFunction,
  duplicateNamedFunction,
  deleteNamedFunction,
  renameNamedFunction,
} from "./state/project/workspaceOps";
import { updateNamedFunctionMeta } from "./state/project/workspaceOps";
import type { CellMap, CellRange } from "./components/excelGrid/types";
import { importXlsxBook } from "./components/excelGrid/importXlsxBook";
import { exportNamedFunctions, importNamedFunctions } from "./io/namedFnJson";
import { importNamedFunctionLibrary } from "./state/project/workspaceOps"; // もし無ければ作る
import type { WorkspaceApi } from "./components/blockly/types";
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
  const [ribbonTab, setRibbonTab] = useState<RibbonTab>(
    "functions"
  );

  // ★追加：ON/OFF表示用のstate（同時ON可能）
  const [focusOn, setFocusOn] = useState(false);
  const [pathOn, setPathOn] = useState(false);

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
      description: f.description ?? "", // ★追加
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
  const [bookSheets, setBookSheets] = useState<
    { name: string; cells: CellMap }[]
  >([{ name: "Sheet1", cells: {} }]);

  const [activeSheet, setActiveSheet] = useState(0);

  const activeCells = bookSheets[activeSheet].cells;
  const onImportXlsx = async (file: File) => {
    const buf = await file.arrayBuffer();
    const book = importXlsxBook(buf);

    setBookSheets(book.sheets);
    setActiveSheet(0);
  };
  const onImportNamedFns = async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);

    const imported = importNamedFunctions(json);
    // imported: { fn: NamedFnItem, workspaceXml }[] みたいな形なら

    importNamedFunctionLibrary(
      imported.map((x) => ({
        name: x.fn.name,
        params: x.fn.params,
        description: x.fn.description,
        workspaceXml: x.workspaceXml,
      })),
      { activateFirst: true }
    );
  };
  const onExportNamedFns = () => {
    const project = getProjectState();
    const data = exportNamedFunctions(project);

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "frockly_named_functions.json";
    a.click();

    URL.revokeObjectURL(url);
  };
  const [highlightRange, setHighlightRange] = useState<CellRange | null>(null);
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ExcelRibbon
        onExportNamedFns={onExportNamedFns}
        onImportNamedFns={onImportNamedFns}
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
        onUpdateNamedFnMeta={(fnId, patch) =>
          updateNamedFunctionMeta(fnId, patch)
        }
        onImportXlsx={onImportXlsx}
        sheets={bookSheets.map((s) => s.name)}
        activeSheet={activeSheet}
        onChangeSheet={setActiveSheet}
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          style={{ width: leftWidth }}
          className="border-r border-gray-300 bg-white"
        >
          <ExcelGrid
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
            cells={activeCells}
            onCellsChange={(updater) => {
              setBookSheets((prev) => {
                const next = [...prev];
                next[activeSheet] = {
                  ...next[activeSheet],
                  cells: updater(next[activeSheet].cells),
                };
                return next;
              });
            }}
            uiLang={uiLang}
            highlightRange={highlightRange}
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
              namedFns={namedFns}
              onHighlightRange={setHighlightRange}
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
