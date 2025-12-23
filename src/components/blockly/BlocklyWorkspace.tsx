import { useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly";
import { STR_ALL, tr } from "../../i18n/strings";
import "blockly/blocks";
import { initFrockly } from "../../blockly/init/initFrockly";
import { ExcelGen } from "../../blocks/basic/generators";
import { blockFromFormula } from "../../formula";
import { createViewApi } from "../blockly/view/index.ts";
import { useProject } from "../../state/project/projectStore";
import {
  setActiveWorkspaceId,
  saveActiveWorkspaceXml,
} from "../../state/project/workspaceOps";

import { ensureGridPattern } from "./ui/workspaceDecor";

// もしくは project にメソッドが生えてるなら import 不要

export function BlocklyWorkspace({
  onFormulaChange,
  selectedCell,
  onWorkspaceApi,
  uiLang,
}: any) {
  const initReadyRef = useRef<Promise<void> | null>(null);

  const ensureBlocklyReady = async () => {
    if (!initReadyRef.current) {
      initReadyRef.current = initFrockly(uiLang);
    }
    await initReadyRef.current;

    // 念のためログ（安定したら消してOK）
    console.log("[WS] ready", {
      fn_root: !!Blockly.Blocks["fn_root"],
      fn_param: !!Blockly.Blocks["fn_param"],
      fn_call: !!Blockly.Blocks["fn_call"],
    });
  };
  useEffect(() => {
    initReadyRef.current = null; // 言語変わったら再init
  }, [uiLang]);

  const project = useProject();
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const hostRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // 最新 props を ref に退避（effect を回さないため）
  const onFormulaChangeRef = useRef(onFormulaChange);
  useEffect(() => {
    onFormulaChangeRef.current = onFormulaChange;
  }, [onFormulaChange]);

  const onWorkspaceApiRef = useRef(onWorkspaceApi);
  useEffect(() => {
    onWorkspaceApiRef.current = onWorkspaceApi;
  }, [onWorkspaceApi]);

  const selectedCellRef = useRef(selectedCell);
  useEffect(() => {
    selectedCellRef.current = selectedCell;
  }, [selectedCell]);

  const historyRef = useRef<string[]>([]);
  const HISTORY_MAX = 30;

  const toolboxXml = useMemo(() => {
    const t = tr(uiLang);
    return `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <category name="${t(STR_ALL.BASIC).replace(/&/g, "&amp;")}">
          <block type="basic_start"></block>

          <block type="basic_number"></block>
          <block type="basic_string"></block>

          <block type="basic_cell"></block>
          <block type="basic_range"></block>

          <block type="basic_arith"></block>
          <block type="basic_cmp"></block>

          <block type="basic_paren"></block>
          <!-- <block type="basic_bool"></block> -->
        </category>

        <category name="${t(STR_ALL.HISTORY).replace(
          /&/g,
          "&amp;"
        )}" custom="FROCKLY_HISTORY"></category>
      </xml>
    `;
  }, [uiLang]);
  // ★ここ！！（useEffect より前）
  const ensureFnRoot = (wsId: string) => {
    const ws = wsRef.current;
    if (!ws) return;

    const p = projectRef.current;
    const wsInfo = p.workspaces.find((w) => w.id === wsId);
    if (!wsInfo || wsInfo.kind !== "fn") return;

    // ブロック登録前に来たら何もできん
    if (!Blockly.Blocks["fn_root"]) return;

    const roots = ws.getAllBlocks(false).filter((b) => b.type === "fn_root");

    if (roots.length === 0) {
      const b = ws.newBlock("fn_root");
      b.initSvg();
      (b as any).render?.();
      b.moveBy(40, 40);
    } else {
      for (let i = 1; i < roots.length; i++) roots[i].dispose(true);
    }
  };

  const ensureFnParams = (wsId: string) => {
    const ws = wsRef.current;
    if (!ws) return;

    const p = projectRef.current;
    const wsInfo = p.workspaces.find((w) => w.id === wsId);
    if (!wsInfo || wsInfo.kind !== "fn") return;

    const roots = ws.getAllBlocks(false).filter((b) => b.type === "fn_root");
    if (roots.length !== 1) return;

    const root = roots[0];
    const params = ws.getAllBlocks(false).filter((b) => b.type === "fn_param");

    for (const b of params) {
      if (b.getParent() !== root) b.dispose(true);
    }
  };

  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl) return;

    let disposed = false;

    const onHostPointerDown = () => {
      const ws = wsRef.current;
      if (!ws) return;
      const tb = ws.getToolbox?.();
      tb?.clearSelection?.();
      (tb as any)?.getFlyout?.()?.hide?.();
      (Blockly as any).hideChaff?.(true);
      ws.resize();
    };

    const pushHistory = (type: string) => {
      if (!type) return;
      if (!Blockly.Blocks[type]) return;
      const arr = historyRef.current.filter((t) => t !== type);
      arr.unshift(type);
      historyRef.current = arr.slice(0, HISTORY_MAX);
      queueMicrotask(() => (wsRef.current as any)?.refreshToolboxSelection?.());
    };
    const saveXmlOfActive = () => {
      const w = wsRef.current;
      if (!w) return;
      try {
        const dom = Blockly.Xml.workspaceToDom(w);
        const xml = Blockly.utils.xml.domToText(dom); // ★ここ
        console.log("[WS] saved xml len=", xml.length);
        saveActiveWorkspaceXml(xml);
      } catch (e) {
        console.warn("[WS] save xml failed", e);
      }
    };

    const loadXml = async (wsId: string) => {
      const w = wsRef.current;
      if (!w) return;

      try {
        await ensureBlocklyReady();

        w.clear();

        const p = projectRef.current;
        const target = p.workspaces.find((x) => x.id === wsId);
        const xmlText = target?.xml ?? "";

        if (xmlText) {
          const dom = Blockly.utils.xml.textToDom(xmlText);
          Blockly.Xml.domToWorkspace(dom, w);
        }

        // ★ロード後に「無かったら入れる」を確実に
        ensureFnRoot(wsId);
        ensureFnParams(wsId);

        w.render();
        w.resize();
      } catch (e) {
        console.error("[WS] load xml failed", e);
      }
    };

    (async () => {
      try {
        await initFrockly(uiLang);
      } catch (e) {
        console.error("[DBG] initFrockly crashed", e);
      }
      if (disposed) return;
      const theme = Blockly.Theme.defineTheme("frockly", {
        name: "frockly",
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: "transparent",
        },
      });

      const ws = Blockly.inject(hostEl, {
        toolbox: toolboxXml,
        theme,
        trashcan: true,
        scrollbars: true,
        zoom: {
          controls: true, // + / - / reset のUIを出す
          wheel: true, // Ctrl+ホイール（またはホイール）で拡大縮小
          startScale: 1.0, // 初期倍率
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2, // 拡大縮小の刻み
        },
      });

      wsRef.current = ws;

      // ここで一拍置く（Blocklyの初回描画が終わってから上書き）
      requestAnimationFrame(() => {
        ensureGridPattern(ws);
      });

      // ★起動時：active workspace を復元
      void loadXml(project.activeWorkspaceId);

      hostEl.addEventListener("pointerdown", onHostPointerDown, true);

      ws.registerToolboxCategoryCallback("FROCKLY_HISTORY", () => {
        const types = historyRef.current;
        if (types.length === 0) {
          const label = Blockly.utils.xml.createElement("label");
          const t = tr(uiLang);
          label.setAttribute("text", t(STR_ALL.NO_HISTORY));
          return [label];
        }
        return types.map((t) => {
          const node = Blockly.utils.xml.createElement("block");
          node.setAttribute("type", t);
          return node;
        });
      });

      // 外部から block を挿入する API を登録（最新refで呼ぶ）
      onWorkspaceApiRef.current?.({
        insertBlock: (blockType: string) => {
          const w = wsRef.current;
          if (!w) return;

          if (!Blockly.Blocks[blockType]) return;

          const b = w.newBlock(blockType);
          b.initSvg();
          (b as any).render?.();
          b.moveBy(40, 40);

          pushHistory(blockType);
          onHostPointerDown();
        },

        // ★ これを追加
        insertRefBlock: (refText: string) => {
          const w = wsRef.current;
          if (!w) return;

          const isRange = refText.includes(":");
          const type = isRange ? "basic_range" : "basic_cell";
          const field = isRange ? "RANGE" : "CELL";

          if (!Blockly.Blocks[type]) {
            console.warn("Unknown ref block:", type);
            return;
          }

          const b = w.newBlock(type);
          b.initSvg();
          (b as any).render?.();

          b.setFieldValue(refText, field);

          b.moveBy(40, 40);

          pushHistory(type);
          onHostPointerDown();
        },
        // ★追加：数式→ブロック
        insertFromFormula: (formulaText: string) => {
          const w = wsRef.current;
          console.log("[WS] insertFromFormula", { hasWs: !!w, formulaText });

          if (!w) return;

          try {
            // 既存を消したいなら一旦OFFで（まず動作優先）
            // w.clear();

            const start = blockFromFormula(w, formulaText);
            console.log("[WS] blockFromFormula OK", { startId: start?.id });

            w.resize();
          } catch (e) {
            console.error("[WS] blockFromFormula crashed", e);
            alert("blockFromFormula が落ちた。console見て！");
          }
        },
        switchWorkspace: (wsId: string) => {
          saveXmlOfActive();
          setActiveWorkspaceId(wsId);
          loadXml(wsId);

          queueMicrotask(() => {
            ensureFnRoot(wsId);
            ensureFnParams(wsId);
          });
        },

        insertFnCall: (fnId: string) => {
          const w = wsRef.current;
          if (!w) return;

          if (!Blockly.Blocks["fn_call"]) {
            // 暫定：まだfn_call無いならテキストで落とす
            const b = w.newBlock("basic_string");
            b.initSvg();
            (b as any).render?.();
            b.setFieldValue(fnId, "TEXT");
            b.moveBy(40, 40);
            pushHistory("basic_string");
            onHostPointerDown();
            return;
          }

          const b = w.newBlock("fn_call");
          b.initSvg();
          (b as any).render?.();
          try {
            b.setFieldValue(fnId, "FN");
          } catch {
            (b as any).data = JSON.stringify({ fnId });
          }
          b.moveBy(40, 40);
          pushHistory("fn_call");
          onHostPointerDown();
        },

        insertFnToMain: (fnId: string) => {
          const main = project.workspaces.find((x: any) => x.kind === "main");
          if (!main) return;

          saveXmlOfActive();
          setActiveWorkspaceId(main.id);
          loadXml(main.id);

          // メインに挿入
          const w = wsRef.current;
          if (!w) return;

          if (!Blockly.Blocks["fn_call"]) {
            const b = w.newBlock("basic_string");
            b.initSvg();
            (b as any).render?.();
            b.setFieldValue(fnId, "TEXT");
            b.moveBy(60, 60);
            pushHistory("basic_string");
            onHostPointerDown();
            return;
          }

          const b = w.newBlock("fn_call");
          b.initSvg();
          (b as any).render?.();
          try {
            b.setFieldValue(fnId, "FN");
          } catch {
            (b as any).data = JSON.stringify({ fnId });
          }
          b.moveBy(60, 60);
          pushHistory("fn_call");
          onHostPointerDown();
        },

        // ★追加：表示タブ系 API
        view: createViewApi({ wsRef }),
      });

      const onBlocklyEvent = (e: Blockly.Events.Abstract) => {
        if (e.isUiEvent) return; // 余計なの除外（任意）
        // ★ドラッグ中・プレビュー系は無視（ここ重要）
        if (
          e.type === Blockly.Events.BLOCK_DRAG ||
          e.type === Blockly.Events.SELECTED ||
          e.type === Blockly.Events.TOOLBOX_ITEM_SELECT
        ) {
          return;
        }
        if (e.type === Blockly.Events.BLOCK_CREATE) {
          const ce = e as Blockly.Events.BlockCreate;
          for (const id of ce.ids ?? []) {
            const b = ws.getBlockById(id);
            if (b) pushHistory(b.type);
          }
        }

        // ★ここで start 起点に生成
        const wsInfo = project.workspaces.find(
          (w: any) => w.id === project.activeWorkspaceId
        );
        const isFn = wsInfo?.kind === "fn";

        const starts = ws
          .getAllBlocks(false)
          .filter((b) =>
            isFn ? b.type === "fn_root" : b.type === "basic_start"
          );

        if (starts.length === 0) {
          onFormulaChangeRef.current?.(""); // start無いなら空
          return;
        }

        const start = starts[0]; // 複数でもとりあえず先頭

        try {
          ExcelGen.init(ws); // ★ これが必要
          const out = ExcelGen.blockToCode(start);
          const code = Array.isArray(out)
            ? String(out[0] ?? "")
            : String(out ?? "");
          ExcelGen.finish(code); // ★ finish も一応呼ぶ（後片付け）
          onFormulaChangeRef.current?.(code.trim());
        } catch (err) {
          console.error("[GEN] blockToCode failed", err);
        }
        // 生成処理が終わった後くらいに
        // ★ fn_root の構造保証（名前付き関数WSのみ）
        if (
          e.type === Blockly.Events.BLOCK_DELETE ||
          e.type === Blockly.Events.BLOCK_CREATE ||
          e.type === Blockly.Events.BLOCK_MOVE
        ) {
        }
      };

      ws.addChangeListener(onBlocklyEvent);
      let lastSelectedId: string | null = null;

      const onSelectEvent = (e: Blockly.Events.Abstract) => {
        if (e.type !== Blockly.Events.SELECTED) return;

        const se = e as any;
        const newId = se.newElementId as string | null;

        // 以前の選択を解除
        if (lastSelectedId) {
          const prev = ws.getBlockById(lastSelectedId);
          prev?.getSvgRoot()?.classList.remove("frockly-focused");
        }

        // 新しい選択を付与
        if (newId) {
          const cur = ws.getBlockById(newId);
          cur?.getSvgRoot()?.classList.add("frockly-focused");
          lastSelectedId = newId;
        } else {
          lastSelectedId = null;
        }
      };

      ws.addChangeListener(onSelectEvent);
    })();

    return () => {
      disposed = true;
      hostEl.removeEventListener("pointerdown", onHostPointerDown, true);
      wsRef.current?.dispose();
      wsRef.current = null;
    };
  }, []); // ★ここが肝：workspace生成は一回だけ

  // uiLang が変わったら（ラベルやツールチップを再登録するために）initFrocklyを再実行
  useEffect(() => {
    (async () => {
      try {
        await initFrockly(uiLang);

        // 既存ワークスペースがあれば、ブロックの表示を再描画して文言を反映させる
        const ws = wsRef.current;
        if (ws) {
          try {
            // 各ブロックを再初期化/再描画
            ws.getAllBlocks(false).forEach((b) => {
              try {
                b.initSvg?.();
                (b as any).render?.();
              } catch (e) {
                /* ignore */
              }
            });

            // ツールボックス/フライアウトの再描画
            const tb = ws.getToolbox?.();
            tb?.clearSelection?.();
            (tb as any)?.getFlyout?.()?.reflow?.();

            // レイアウト更新
            (Blockly as any).hideChaff?.(true);
            ws.resize();
          } catch (e) {
            console.warn("Failed to refresh workspace after locale change", e);
          }
        }
      } catch (e) {
        console.error("initFrockly failed", e);
      }
    })();
  }, [uiLang]);
  const workspaceTitle = project.workspaces.find(
    (w: any) => w.id === project.activeWorkspaceId
  )?.title;
  return (
    <div className="relative w-full h-full">
      <div
        className="
            absolute top-3 right-4 z-[5]
            px-2 py-1 text-base font-bold
            text-slate-500
            pointer-events-none
            select-none
          "
      >
        {workspaceTitle}
      </div>
      <div
        ref={hostRef}
        className="
            w-full h-full overflow-hidden
            bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),
                linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)]
            bg-[size:24px_24px]
            bg-slate-50
          "
      />
    </div>
  );
}
