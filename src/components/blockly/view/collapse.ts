// src/components/blockly/view/collapse.ts
import type * as Blockly from "blockly";
import type { ViewDeps } from "./types";
import { getAll, getStart } from "./util";

// start直下（=式のroot）
function getRoot(deps: ViewDeps) {
  const ws = deps.wsRef.current;
  if (!ws) return null;

  const start = getStart(deps);
  if (!start) return null;

  const kids = start.getChildren?.(false) ?? [];
  return kids[0] ?? null;
}

// start(root) から BFS で層を作る（同一層＝同じ距離）
function buildLayers(deps: ViewDeps): string[][] {
  const ws = deps.wsRef.current;
  if (!ws) return [];

  const root = getRoot(deps);
  if (!root) return [];

  const layers: string[][] = [];
  const q: Array<{ id: string; d: number }> = [{ id: root.id, d: 0 }];
  const seen = new Set<string>();

  while (q.length) {
    const { id, d } = q.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    const b = ws.getBlockById(id);
    if (!b) continue;

    // basic_start は入れない（rootから始めてるので基本入らん）
    if (b.type !== "basic_start") {
      if (!layers[d]) layers[d] = [];
      layers[d].push(id);
    }

    const kids = b.getChildren?.(false) ?? [];
    for (const k of kids) {
      if (!k) continue;
      if (k.type === "basic_start") continue;
      q.push({ id: k.id, d: d + 1 });
    }
  }

  // 空穴があったら詰める
  return layers.filter((x) => x && x.length);
}

export const createCollapseController = (deps: ViewDeps) => {
  // layers は「最後に計算した層」
  let layers: string[][] = [];
  // 0=閉じてない、1=最下層を閉じた、2=下から2層…（閉じた層数）
  let closedCountFromBottom = 0;

  const rerender = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;
    ws.render();
    ws.resize();
  };

  const ensureLayers = () => {
    // ワークスペースが変化するたびに都度作り直すのが確実
    // 軽量化したいなら「イベントで dirty 管理」やな
    layers = buildLayers(deps);
    // closedCount が層数を越えたら丸め
    closedCountFromBottom = Math.min(closedCountFromBottom, layers.length);
  };

  const setCollapsedForLayerIndex = (
    layerIndex: number,
    collapsed: boolean
  ) => {
    const ws = deps.wsRef.current;
    if (!ws) return;
    const ids = layers[layerIndex] ?? [];
    for (const id of ids) {
      const b = ws.getBlockById(id);
      if (!b) continue;
      // startは対象外（念のため）
      if (b.type === "basic_start") continue;
      b.setCollapsed(collapsed);
    }
  };

  // Up: 最下層から順に閉じる
  const stepUp = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    ensureLayers();
    if (layers.length === 0) return;

    // もう全部閉じ済みなら何もしない
    if (closedCountFromBottom >= layers.length) return;

    const idx = layers.length - 1 - closedCountFromBottom; // 次に閉じる層
    setCollapsedForLayerIndex(idx, true);
    closedCountFromBottom += 1;

    rerender();
  };

  // Down: 直近に閉じた層から順に開く
  const stepDown = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    ensureLayers();
    if (layers.length === 0) return;

    if (closedCountFromBottom <= 0) return;

    // 直近に閉じた層を開く
    const idx = layers.length - closedCountFromBottom;
    setCollapsedForLayerIndex(idx, false);
    closedCountFromBottom -= 1;

    rerender();
  };

  const collapseAll = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    for (const b of getAll(deps)) {
      if (b.type === "basic_start") continue;
      b.setCollapsed(true);
    }

    ensureLayers();
    closedCountFromBottom = layers.length; // 全層閉じた扱い
    rerender();
  };

  const expandAll = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    for (const b of getAll(deps)) b.setCollapsed(false);

    ensureLayers();
    closedCountFromBottom = 0;
    rerender();
  };

  return {
    collapseAll,
    expandAll,
    // dir=+1 を「上」か「下」か、UIの意味に合わせてここで割り当て変えてOK
    // ここでは “dir=+1 で上(閉じる)” にしてる
    expandStep: (dir: 1 | -1) => (dir === 1 ? stepUp() : stepDown()),
  };
};
