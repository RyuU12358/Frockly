// components/mobile/MobileApp.tsx
import { useMemo, useState } from "react";
import type { AppViewProps } from "../AppViewProps";

import { ExcelGrid } from "../excelGrid/ExcelGrid";
import { BlocklyWorkspace } from "../blockly/BlocklyWorkspace";
import { FormulaDisplay } from "../fomula/FormulaDisplay";

import { Wand2, Eye, FunctionSquare, FileSpreadsheet } from "lucide-react";

import type { RibbonTab } from "../ribbon/ExcelRibbon";
import { FileTab } from "../ribbon/tabs/FileTab";
import { BlockPalette } from "../ribbon/tabs/BlockPalette";
import { NamedFunctionsTab } from "../ribbon/tabs/NamedFunctionsTab";
import { RibbonButton } from "../ribbon/tabs/RibbonButton";
import { RibbonSeparator } from "../ribbon/tabs/RibbonSeparator";
import { MobileHeader } from "./MobileHeader";

import { STR, tr, type StrKey } from "../../i18n/strings";
import { ImportFromFormulaModal } from "../ImportFromFormulaModal";

type MobileMainTab = "ws" | "grid" | "formula";

export function MobileApp(props: AppViewProps) {
  const { ui, projectCtx, refs, grid, formula } = props;
  const t = tr(ui.uiLang);
  const [openImport, setOpenImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [mainTab, setMainTab] = useState<MobileMainTab>("ws");
  const onImportFromFormula = () => {
    setImportText("");
    setOpenImport(true);
  };
  const ribbonTab: RibbonTab = ui.ribbonTab;
  const setRibbonTab = ui.setRibbonTab;

  const [search, setSearch] = useState("");

  const tabs = useMemo(
    () =>
      [
        { id: "file", labelKey: "TAB_FILE", icon: FileSpreadsheet },
        { id: "functions", labelKey: "TAB_FUNCTIONS", icon: Wand2 },
        { id: "named", labelKey: "TAB_NAMED_FUNCTIONS", icon: FunctionSquare },
        { id: "view", labelKey: "VIEW", icon: Eye },
      ] as const satisfies readonly {
        id: RibbonTab;
        labelKey: StrKey;
        icon: any;
      }[],
    []
  );

  const canNamed =
    (projectCtx.namedFns?.length ?? 0) > 0 ||
    !!projectCtx.onCreateNamedFn ||
    !!refs.workspaceApiRef.current?.insertFnCall;

  const visibleTabs = useMemo(() => {
    if (canNamed) return tabs;
    return tabs.filter((x) => x.id !== "named");
  }, [tabs, canNamed]);

  const api = refs.workspaceApiRef.current;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ===== 上：ヘッダ + リボン ===== */}
      <div className="shrink-0 border-b bg-white">
        <MobileHeader
          title="Frockly"
          subtitle={projectCtx.activeWorkspaceTitle}
          uiLang={ui.uiLang}
          onChangeLang={ui.setUiLang}
          search={search}
          onChangeSearch={setSearch}
          placeholderKey="SEARCH"
          onImportFromFormula={onImportFromFormula}
        />

        {/* リボンタブ */}
        <div className="px-2 pb-2 bg-emerald-600">
          <div className="flex items-center gap-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const on = ribbonTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRibbonTab(tab.id)}
                  className={[
                    "h-9 px-2 rounded-md border flex items-center gap-1",
                    "text-[12px] select-none",
                    on
                      ? "bg-white text-emerald-800 border-emerald-200"
                      : "bg-emerald-500 text-white border-emerald-700",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  <span className="leading-none">{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* サブリボン */}
        <div className="border-t bg-white">
          {ribbonTab === "file" ? (
            <FileTab
              onImportXlsx={projectCtx.onImportXlsx}
              onImportNamedFns={projectCtx.onImportNamedFns}
              onExportNamedFns={projectCtx.onExportNamedFns}
              sheets={projectCtx.sheets}
              activeSheet={projectCtx.activeSheet}
              onChangeSheet={projectCtx.onChangeSheet}
            />
          ) : ribbonTab === "functions" ? (
            <BlockPalette
              search={search}
              uiLang={ui.uiLang}
              onBlockClick={(blockType) => api?.insertBlock?.(blockType)}
            />
          ) : ribbonTab === "named" ? (
            <NamedFunctionsTab
              uiLang={ui.uiLang}
              search={search}
              fns={projectCtx.namedFns}
              workspaces={projectCtx.workspaces}
              activeWorkspaceId={projectCtx.project?.activeWorkspaceId}
              onUpdateFnMeta={projectCtx.onUpdateNamedFnMeta}
              onCreateFn={() => projectCtx.onCreateNamedFn()} // ★ CreateFnResult を返す
              onDuplicateFn={(fnId) => projectCtx.onDuplicateNamedFn(fnId)}
              onDeleteFn={(fnId) => projectCtx.onDeleteNamedFn(fnId)}
              onRenameFn={(fnId, name) =>
                projectCtx.onRenameNamedFn(fnId, name)
              }
              onSwitchWorkspace={(wsId) => api?.switchWorkspace?.(wsId)}
              onInsertCurrent={(fnId) => api?.insertFnCall?.(fnId)}
              onInsertToMain={(fnId) => api?.insertFnToMain?.(fnId)}
              onInsertCurrentParam={() => api?.insertBlock?.("fn_param")}
            />
          ) : (
            <MobileViewSubRibbon
              uiLang={ui.uiLang}
              focusOn={ui.focusOn}
              pathOn={ui.pathOn}
              onToggleFocus={ui.onToggleFocus}
              onTogglePath={ui.onTogglePath}
              api={api}
            />
          )}
        </div>
      </div>

      {/* ===== 中段：メイン切替 ===== */}
      <div className="flex-1 overflow-hidden">
        {mainTab === "ws" && (
          <div className="h-full bg-white">
            <BlocklyWorkspace
              category="math"
              onFormulaChange={formula.setFormula}
              selectedCell={grid.selectedCell}
              onWorkspaceApi={(a) => {
                refs.workspaceApiRef.current = a;
                if (props.onWorkspaceCreated) props.onWorkspaceCreated(a);
              }}
              uiLang={ui.uiLang}
              namedFns={projectCtx.namedFns}
              onHighlightRange={grid.setHighlightRange}
            />
          </div>
        )}

        {mainTab === "grid" && (
          <div className="h-full bg-white">
            <ExcelGrid
              selectedCell={grid.selectedCell}
              onCellSelect={grid.setSelectedCell}
              cells={grid.cells}
              onCellsChange={grid.onCellsChange}
              uiLang={ui.uiLang}
              highlightRange={grid.highlightRange}
            />
          </div>
        )}

        {mainTab === "formula" && (
          <div className="h-full bg-white">
            <FormulaDisplay formula={formula.formula} uiLang={ui.uiLang} />
          </div>
        )}
      </div>

      {/* ===== 下段：メインタブ ===== */}
      <div className="h-14 shrink-0 border-t bg-white flex">
        <MainTabBtn active={mainTab === "ws"} onClick={() => setMainTab("ws")}>
          {t("MOBILE_TAB_WORKSPACE")}
        </MainTabBtn>
        <MainTabBtn
          active={mainTab === "grid"}
          onClick={() => setMainTab("grid")}
        >
          {t("MOBILE_TAB_CELLS")}
        </MainTabBtn>
        <MainTabBtn
          active={mainTab === "formula"}
          onClick={() => setMainTab("formula")}
        >
          {t("MOBILE_TAB_FORMULA")}
        </MainTabBtn>
      </div>
      <ImportFromFormulaModal
        open={openImport}
        uiLang={ui.uiLang}
        text={importText}
        setText={setImportText}
        onClose={() => setOpenImport(false)}
        onSubmit={(text) => {
          const fn = refs.workspaceApiRef.current?.insertFromFormula;
          if (!fn) {
            alert(tr(ui.uiLang)(STR.IMPORT_API_NOT_READY));
            return;
          }
          try {
            fn(text);
            setOpenImport(false);
          } catch (e) {
            console.error("[IMPORT] insertFromFormula crashed", e);
            alert(tr(ui.uiLang)(STR.IMPORT_FAILED));
          }
        }}
      />
    </div>
  );
}

function MainTabBtn(props: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={[
        "flex-1 text-[13px] select-none",
        props.active ? "font-semibold bg-gray-50" : "bg-white",
      ].join(" ")}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function MobileViewSubRibbon(props: {
  uiLang: "en" | "ja" | "fr";
  focusOn: boolean;
  pathOn: boolean;
  onToggleFocus: () => void;
  onTogglePath: () => void;
  api: any;
}) {
  const t = tr(props.uiLang);

  return (
    <div className="py-1">
      <div className="h-[36px] flex items-stretch px-2 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
          <RibbonButton onClick={() => props.api?.view?.collapseAll?.()}>
            {t("COLLAPSE_ALL")}
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.expandAll?.()}>
            {t("EXPAND_ALL")}
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.expandStep?.(-1)}>
            ▲
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.expandStep?.(+1)}>
            ▼
          </RibbonButton>

          <RibbonSeparator />

          <RibbonButton
            className={
              props.focusOn
                ? "bg-emerald-500 text-white border-emerald-600"
                : ""
            }
            onClick={props.onToggleFocus}
          >
            {t("FOCUS")}: {props.focusOn ? t("ON") : t("OFF")}
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.focusStep?.(-1)}>
            ▲
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.focusStep?.(+1)}>
            ▼
          </RibbonButton>

          <RibbonSeparator />

          <RibbonButton
            className={
              props.pathOn ? "bg-emerald-500 text-white border-emerald-600" : ""
            }
            onClick={props.onTogglePath}
          >
            {t("PATH")}: {props.pathOn ? t("ON") : t("OFF")}
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.pathStep?.(-1)}>
            ▲
          </RibbonButton>
          <RibbonButton onClick={() => props.api?.view?.pathStep?.(+1)}>
            ▼
          </RibbonButton>
        </div>
      </div>
    </div>
  );
}
