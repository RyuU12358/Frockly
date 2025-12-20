import { useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly";
import { STR_ALL, tr } from "../i18n/strings";
import "blockly/blocks";
import { initFrockly } from "../blocks/initFrockly";
import { ExcelGen } from "../blocks/basic/generators";
import { blockFromFormula } from "../formula";
export function BlocklyWorkspace({
  category,
  onFormulaChange,
  selectedCell,
  onWorkspaceApi,
  uiLang,
}: any) {
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

    (async () => {
      try {
        await initFrockly(uiLang);
      } catch (e) {
        console.error("[DBG] initFrockly crashed", e);
      }
      if (disposed) return;

      const ws = Blockly.inject(hostEl, {
        toolbox: toolboxXml,
        trashcan: true,
        scrollbars: true,
      });

      wsRef.current = ws;

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
        const starts = ws
          .getAllBlocks(false)
          .filter((b) => b.type === "basic_start");
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
      };

      ws.addChangeListener(onBlocklyEvent);
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

  return <div ref={hostRef} className="w-full h-full overflow-hidden" />;
}
