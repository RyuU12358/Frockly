// src/components/blockly/view/util.ts
import type * as Blockly from "blockly";
import type { ViewDeps } from "./types";

export const getAll = (deps: ViewDeps) =>
  deps.wsRef.current?.getAllBlocks(false) ?? [];

export const getStart = (deps: ViewDeps) => {
  const ws = deps.wsRef.current;
  if (!ws) return null;
  return ws.getAllBlocks(false).find((b) => b.type === "basic_start") ?? null;
};

export const firstChild = (b: Blockly.Block) =>
  (b.getChildren?.(false) ?? [])[0] ?? null;

export const depthOf = (b: Blockly.Block) => {
  let d = 0;
  let p: Blockly.Block | null = b.getSurroundParent?.() ?? null;
  while (p) {
    d++;
    p = p.getSurroundParent?.() ?? null;
  }
  return d;
};

export const buildChainToStart = (leaf: Blockly.Block) => {
  const chain: Blockly.Block[] = [];
  let cur: Blockly.Block | null = leaf;
  while (cur) {
    chain.push(cur);
    cur = cur.getSurroundParent?.() ?? null;
  }
  return chain; // leaf -> ... -> start
};

export const collectSubtree = (root: Blockly.Block) => {
  const set = new Set<Blockly.Block>();
  const stack: Blockly.Block[] = [root];
  while (stack.length) {
    const b = stack.pop()!;
    if (set.has(b)) continue;
    set.add(b);
    for (const k of b.getChildren?.(false) ?? []) stack.push(k);
  }
  return set;
};
