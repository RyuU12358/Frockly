import { useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly";
import { STR, tr } from "../../i18n/strings";
import "blockly/blocks";
import { initFrockly } from "../../blockly/init/initFrockly";
import { ExcelGen } from "../../blocks/basic/generators";
import { createViewApi } from "../blockly/view/index.ts";
import { useProject } from "../../state/project/projectStore";
import {
  setActiveWorkspaceId,
  saveActiveWorkspaceXml,
  updateNamedFunctionParams,
} from "../../state/project/workspaceOps";

import { ensureGridPattern } from "./ui/workspaceDecor";
import { setCallFnMeta } from "../../blocks/fn/fn_call.ts";
import { getFnSpec } from "../../blocks/gen/registry.ts";
import { getBasicBlockLabel } from "../../blocks/basic/blocks.ts";
import type { CellRange } from "../excelGrid/types";
// components/blockly/BlocklyWorkspace.tsx
import type { WorkspaceApi } from "./types";
import { blockFromFormula } from "../../formula/index.ts";

export type BlocklyWorkspaceProps = {
  category: string;

  uiLang: "en" | "ja";

  selectedCell: string;
  onFormulaChange: (formula: string) => void;

  // App で setHighlightRange してるやつ
  onHighlightRange?: (range: CellRange | null) => void;

  // 名前付き関数（App が渡してる形に合わせる）
  namedFns: {
    id: string;
    name: string;
    params: string[];
    workspaceId: string;
    description?: string;
  }[];

  // ★これが肝：api の型を確定させる
  onWorkspaceApi?: (api: WorkspaceApi) => void;
};

// もしくは project にメソッドが生えてるなら import 不要

export function BlocklyWorkspace({
  onFormulaChange,
  selectedCell,
  onWorkspaceApi,
  uiLang,
  namedFns,
  onHighlightRange,
}: BlocklyWorkspaceProps) {
  const initReadyRef = useRef<Promise<void> | null>(null);
  const namedFnsRef = useRef<any[]>(namedFns ?? []);
  useEffect(() => {
    namedFnsRef.current = namedFns ?? [];
  }, [namedFns]);

  const ensureBlocklyReady = async () => {
    if (!initReadyRef.current) {
      initReadyRef.current = initFrockly(uiLang);
    }
    await initReadyRef.current;
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
        <category name="${t(STR.BASIC).replace(/&/g, "&amp;")}">
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

        <category name="${t(STR.HISTORY).replace(
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

  const ensureFnParamsCount = (wsId: string) => {
    const ws = wsRef.current;
    if (!ws) return;

    const p = projectRef.current;
    const wsInfo = p.workspaces.find((w) => w.id === wsId);
    if (!wsInfo || wsInfo.kind !== "fn") return;

    const fnId = wsInfo.fnId;
    if (!fnId) return;

    const fn = p.functions.find((f) => f.id === fnId);
    const want = fn?.params?.length ?? 0;

    const roots = ws.getAllBlocks(false).filter((b) => b.type === "fn_root");
    if (roots.length !== 1) return;
    const root = roots[0];

    // ★ fn_root の statement input 名は "PARAMS"（あなたの定義通り）
    const stackConn = root.getInput("PARAMS")?.connection;
    if (!stackConn) return;

    // いま繋がってる param チェーンを辿る
    const chain: Blockly.Block[] = [];
    let cur = stackConn.targetBlock();
    while (cur && cur.type === "fn_param") {
      chain.push(cur);
      cur = cur.getNextBlock();
    }

    // 多い分は末尾から消す
    while (chain.length > want) {
      chain.pop()!.dispose(true);
    }

    // 末尾に繋ぐ補助
    const connectTail = (b: Blockly.Block) => {
      if (chain.length === 0) {
        stackConn.connect((b as any).previousConnection);
      } else {
        const tail = chain[chain.length - 1];
        (tail as any).nextConnection.connect((b as any).previousConnection);
      }
    };

    // 足りない分は追加して繋ぐ
    while (chain.length < want) {
      const b = ws.newBlock("fn_param");
      b.initSvg();
      (b as any).render?.();
      connectTail(b);
      chain.push(b);
    }

    // 名前反映（params配列をUIに出す）
    for (let i = 0; i < chain.length; i++) {
      chain[i].setFieldValue(fn?.params?.[i] ?? `p${i + 1}`, "NAME");
    }

    ws.render();
  };
  const readFnParamsFromWorkspace = (wsId: string): string[] => {
    const ws = wsRef.current;
    if (!ws) return [];

    const p = projectRef.current;
    const wsInfo = p.workspaces.find((w) => w.id === wsId);
    if (!wsInfo || wsInfo.kind !== "fn") return [];

    const root = ws.getAllBlocks(false).find((b) => b.type === "fn_root");
    if (!root) return [];

    const conn = root.getInput("PARAMS")?.connection;
    if (!conn) return [];

    const FIELD = "NAME";

    const out: string[] = [];
    let cur = conn.targetBlock(); // 先頭の fn_param
    while (cur && cur.type === "fn_param") {
      const name = String((cur as any).getFieldValue?.(FIELD) ?? "").trim();
      if (name) out.push(name);
      cur = cur.getNextBlock(); // ★次の param へ
    }
    return out;
  };
  const parseRefToRange = (refText: string): CellRange | null => {
    // Sheet名を捨てる
    const t = refText.includes("!") ? refText.split("!").pop()! : refText;

    // ★ $ と # を除去（スピルは今は無視）
    const s = t.replace(/[$#]/g, "").trim();

    // A1 or A1:B2
    const m = s.match(/^([A-Z]+[0-9]+)(?::([A-Z]+[0-9]+))?$/i);
    if (!m) return null;

    const a = m[1].toUpperCase();
    const b = (m[2] ?? m[1]).toUpperCase();
    return { a, b };
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
        ensureFnParamsCount(wsId);

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
          label.setAttribute("text", t(STR.NO_HISTORY));
          return [label];
        }
        return types.map((t) => {
          const node = Blockly.utils.xml.createElement("block");
          node.setAttribute("type", t);
          return node;
        });
      });
      // ★ project から名前付き関数一覧っぽいものを引く（暫定：型はanyでOK）
      const findNamedFn = (fnId: string) => {
        const p: any = projectRef.current;

        // ここは実プロパティ名が確定したら整理する
        const candidates =
          p?.fns ??
          p?.namedFns ??
          p?.namedFunctions ??
          p?.namedFnItems ??
          p?.functions ??
          [];

        if (Array.isArray(candidates)) {
          return candidates.find((x: any) => x?.id === fnId) ?? null;
        }

        // map/object 形式の可能性
        if (candidates && typeof candidates === "object") {
          return candidates[fnId] ?? null;
        }
        return null;
      };

      // 外部から block を挿入する API を登録（最新refで呼ぶ）
      onWorkspaceApiRef.current?.({
        insertBlock: (blockType: string) => {
          const w = wsRef.current;
          if (!w) return;
          if (!Blockly.Blocks[blockType]) return;

          const p = projectRef.current;
          const wsInfo = p.workspaces.find((x) => x.id === p.activeWorkspaceId);
          const isFn = wsInfo?.kind === "fn";

          // ★ fn_param は「fnワークスペースなら root.PARAMS の末尾へ接続」
          if (isFn && blockType === "fn_param") {
            const root = w
              .getAllBlocks(false)
              .find((b) => b.type === "fn_root");
            const stackConn = root?.getInput("PARAMS")?.connection;

            if (root && stackConn) {
              // 末尾（next chain の最後）を探す
              let tail = stackConn.targetBlock();
              while (tail && tail.getNextBlock()) tail = tail.getNextBlock();

              const b = w.newBlock("fn_param");
              b.initSvg();
              (b as any).render?.();

              if (!tail) {
                // PARAMS が空なら root に直結
                stackConn.connect((b as any).previousConnection);
              } else {
                // 末尾の next に繋ぐ
                (tail as any).nextConnection.connect(
                  (b as any).previousConnection
                );
              }

              pushHistory("fn_param");
              onHostPointerDown();
              w.render();
              w.resize();
              return;
            }
            // rootが無い等ならフォールバックで通常挿入
          }

          // 通常ブロックは今まで通り
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
            ensureFnParamsCount(wsId);
          });
        },

        insertFnCall: (fnId: string) => {
          const w = wsRef.current;
          if (!w) return;

          const b = w.newBlock("fn_call");

          b.initSvg();

          const fn = namedFnsRef.current.find((x) => x.id === fnId) ?? null;
          setCallFnMeta(
            b as any,
            fn ? { id: fn.id, name: fn.name, params: fn.params } : null
          );

          setCallFnMeta(b as any, fn);

          // ★最後にrender
          (b as any).render?.();
          w.render();
          w.resize();

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
            const fn = findNamedFn(fnId);
            setCallFnMeta(
              b as any,
              fn ? { id: fn.id, name: fn.name, params: fn.params } : null
            );

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
        if (e.isUiEvent) return;

        // 重要：UI系は除外
        if (
          e.type === Blockly.Events.BLOCK_DRAG ||
          e.type === Blockly.Events.SELECTED ||
          e.type === Blockly.Events.TOOLBOX_ITEM_SELECT
        ) {
          return;
        }

        // ★最新stateを必ずrefから取る
        const p = projectRef.current;
        const wsId = p.activeWorkspaceId;
        const wsInfo = p.workspaces.find((w: any) => w.id === wsId);
        const isFn = wsInfo?.kind === "fn";

        if (e.type === Blockly.Events.BLOCK_CREATE) {
          const ce = e as Blockly.Events.BlockCreate;
          for (const id of ce.ids ?? []) {
            const b = ws.getBlockById(id);
            if (b) pushHistory(b.type);
          }
        }

        // ===== 生成（start/root起点） =====
        const starts = ws
          .getAllBlocks(false)
          .filter((b) =>
            isFn ? b.type === "fn_root" : b.type === "basic_start"
          );

        if (starts.length === 0) {
          onFormulaChangeRef.current?.("");
        } else {
          const start = starts[0];
          try {
            ExcelGen.init(ws);
            const out = ExcelGen.blockToCode(start);
            const code = Array.isArray(out)
              ? String(out[0] ?? "")
              : String(out ?? "");
            ExcelGen.finish(code);
            onFormulaChangeRef.current?.(code.trim());
          } catch (err) {
            console.error("[GEN] blockToCode failed", err);
          }
        }

        // ===== 名前付き関数WSなら params 同期 =====
        if (!isFn) return;

        // DELETE/CREATE/MOVE の時だけ同期（連打軽減）
        const shouldSync =
          e.type === Blockly.Events.BLOCK_DELETE ||
          e.type === Blockly.Events.BLOCK_CREATE ||
          e.type === Blockly.Events.BLOCK_MOVE ||
          e.type === Blockly.Events.BLOCK_CHANGE; // paramのフィールド編集拾うならこれ要る

        if (!shouldSync) return;

        const params = readFnParamsFromWorkspace(wsId);

        const fnId = wsInfo?.fnId;
        if (fnId) updateNamedFunctionParams(fnId, params);
      };

      ws.addChangeListener(onBlocklyEvent);
      let lastSelectedId: string | null = null;

      const onSelectEvent = (e: Blockly.Events.Abstract) => {
        if (e.type !== Blockly.Events.SELECTED) return;

        const se = e as any;
        const newId = se.newElementId as string | null;

        // 以前の選択を解除（既存）
        if (lastSelectedId) {
          const prev = ws.getBlockById(lastSelectedId);
          prev?.getSvgRoot()?.classList.remove("frockly-focused");
        }

        // ★まず解除（何選んでも一旦消す：安全）
        onHighlightRange?.(null);

        if (newId) {
          const cur = ws.getBlockById(newId);
          cur?.getSvgRoot()?.classList.add("frockly-focused");
          lastSelectedId = newId;

          // ★参照ブロックなら範囲抽出
          if (cur) {
            let refText: string | null = null;

            if (cur.type === "basic_cell") {
              try {
                refText = String(cur.getFieldValue("CELL") ?? "");
              } catch {}
            } else if (cur.type === "basic_range") {
              try {
                refText = String(cur.getFieldValue("RANGE") ?? "");
              } catch {}
            }

            if (refText) {
              const r = parseRefToRange(refText);
              if (r) onHighlightRange?.(r);
            }
          }
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
              // ★名前付き関数ブロックなら、表示名を今の言語に合わせて更新する
              if (b.type.startsWith("frockly_")) {
                const fnName = b.type.slice("frockly_".length);
                const spec = getFnSpec(fnName);
                if (spec) {
                  // タイトル更新
                  const newLabel = spec.localizedName ?? spec.name;
                  b.setFieldValue(newLabel, "FN_NAME");
                }
              }

              // ★基本ブロック（basic_number等）
              if (b.type.startsWith("basic_")) {
                const newLabel = getBasicBlockLabel(b.type, uiLang);
                if (newLabel) {
                  b.setFieldValue(newLabel, "LABEL");
                }
              }

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
