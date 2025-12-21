// src/components/blockly/view/path.ts
import type * as Blockly from "blockly";
import type { ViewDeps } from "./types";
import { getAll } from "./util";
import { setVisual, setPathOutline } from "./dom";

export const createPathController = (deps: ViewDeps) => {
  let pathOn = false;
  let pathIndex = 0;

  // 前回アウトライン付けたブロックを覚えて消す
  let outlinedIds = new Set<string>();

  const listBlocksStable = () =>
    getAll(deps).filter((b) => b.type !== "basic_start");

  const clear = () => {
    for (const b of getAll(deps)) {
      setVisual(b, "normal");
      // 枠も消す
      if (outlinedIds.has(b.id)) setPathOutline(b, false);
    }
    outlinedIds.clear();
  };

  const apply = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    clear();
    if (!pathOn) return;

    const blocks = listBlocksStable();
    if (blocks.length === 0) return;

    const leaves = blocks.filter(
      (b) => (b.getChildren?.(false) ?? []).length === 0
    );
    const arr = leaves.length ? leaves : blocks;

    pathIndex = ((pathIndex % arr.length) + arr.length) % arr.length;
    const leaf = arr[pathIndex];

    // まず全部薄く
    for (const b of blocks) setVisual(b, "dim");

    // leaf→親を辿って「通常表示 + 枠」
    let cur: Blockly.Block | null = leaf;
    while (cur) {
      if (cur.type !== "basic_start") {
        setVisual(cur, "normal");
        setPathOutline(cur, true);
        outlinedIds.add(cur.id);
      }
      cur = cur.getSurroundParent?.() ?? null;
    }
  };

  const togglePath = () => {
    pathOn = !pathOn;
    apply();
  };

  return {
    togglePath,
    pathStep: (dir: 1 | -1) => {
      pathIndex += dir;
      apply();
    },
    // ★追加
    isEnabled: () => pathOn,
    setEnabled: (v: boolean) => {
      pathOn = v;
      apply();
    },
  };
};
