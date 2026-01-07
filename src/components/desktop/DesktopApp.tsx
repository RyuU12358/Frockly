import { ExcelRibbon } from "../ribbon/ExcelRibbon";
import { ExcelGrid } from "../excelGrid/ExcelGrid";
import { BlocklyWorkspace } from "../blockly/BlocklyWorkspace";
import { FormulaDisplay } from "../fomula/FormulaDisplay";
import type { AppViewProps } from "../AppViewProps";

export function DesktopApp(props: AppViewProps) {
  const { ui, projectCtx, refs, grid, formula, blockCategory = "math" } = props;
  return (
    <>
      <ExcelRibbon
        selectedTab={ui.ribbonTab}
        onTabChange={ui.setRibbonTab}
        uiLang={ui.uiLang}
        onUiLangChange={ui.setUiLang}
        onWorkspaceApi={refs.workspaceApiRef}
        onBlockClick={(blockType) =>
          refs.workspaceApiRef.current?.insertBlock(blockType)
        }
        focusOn={ui.focusOn}
        pathOn={ui.pathOn}
        onToggleFocus={ui.onToggleFocus}
        onTogglePath={ui.onTogglePath}
        namedFns={projectCtx.namedFns}
        workspaces={projectCtx.workspaces}
        activeWorkspaceId={projectCtx.project.activeWorkspaceId}
        activeWorkspaceTitle={projectCtx.activeWorkspaceTitle}
        onCreateNamedFn={projectCtx.onCreateNamedFn}
        onDuplicateNamedFn={projectCtx.onDuplicateNamedFn}
        onDeleteNamedFn={projectCtx.onDeleteNamedFn}
        onRenameNamedFn={projectCtx.onRenameNamedFn}
        onUpdateNamedFnMeta={projectCtx.onUpdateNamedFnMeta}
        onExportNamedFns={projectCtx.onExportNamedFns}
        onImportNamedFns={projectCtx.onImportNamedFns}
        onImportXlsx={projectCtx.onImportXlsx}
        sheets={projectCtx.sheets}
        activeSheet={projectCtx.activeSheet}
        onChangeSheet={projectCtx.onChangeSheet}
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          style={{ width: ui.leftWidth }}
          className="border-r border-gray-300 bg-white"
        >
          <ExcelGrid
            selectedCell={grid.selectedCell}
            onCellSelect={grid.setSelectedCell}
            cells={grid.cells}
            onCellsChange={grid.onCellsChange}
            uiLang={ui.uiLang}
            highlightRange={grid.highlightRange}
          />
        </div>

        <div
          onMouseDown={ui.onStartSplitDrag}
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-300"
        />

        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 border-b border-gray-300">
            <BlocklyWorkspace
              category={blockCategory}
              onFormulaChange={formula.setFormula}
              selectedCell={grid.selectedCell}
              onWorkspaceApi={(api) => {
                refs.workspaceApiRef.current = api;
                // Propsのcallbackも呼ぶ（URL初期数式ロード用）
                if (props.onWorkspaceCreated) props.onWorkspaceCreated(api);
              }}
              uiLang={ui.uiLang}
              namedFns={projectCtx.namedFns}
              onHighlightRange={grid.setHighlightRange}
            />
          </div>

          <div className="h-32 border-t border-gray-300">
            <FormulaDisplay formula={formula.formula} uiLang={ui.uiLang} />
          </div>
        </div>
      </div>
    </>
  );
}
