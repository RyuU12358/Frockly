// src/components/blockly/view/focus.ts
import type * as Blockly from "blockly";
import type { ViewDeps } from "./types";
import { getAll, getStart } from "./util";
import { setVisual } from "./dom";

/**
 * Focus = 「層」単位で剥がしていく
 * - Down 1回目: root(=start直下) を消す（= 1が消えるイメージ）
 * - Down 2回目: 直近に消えた層(root) に “直接つながってる子” を全部同時に消す（= 1に繋がってた2が全部消える）
 * - Down 3回目: 直近に消えた層(2たち) に繋がってる子(3たち) を全部同時に消す
 * - Up: 逆順に層ごと復活（4→3→2→1）
 *
 * 重要:
 * - 「繋がってる」= Blockly的には getChildren(false) の“直接の子”
 * - 枝を消す(Path)とは別。Focusは枝選別しない。
 */
export const createFocusController = (deps: ViewDeps) => {
  let focusOn = false;

  // history[i] = i段目で “まとめて消した” ブロックID配列（復活はpop）
  const history: string[][] = [];

  // frontier = 直近に消えた “層”（次の層を作る起点）
  let frontier = new Set<string>();

  // 見た目順（上→左）で子を並べる
  const listVisualChildren = (b: Blockly.Block) => {
    const kids = b.getChildren?.(false) ?? [];
    if (kids.length === 0) return kids;

    const withPos = kids.map((k) => {
      const xy = (k as any).getRelativeToSurfaceXY?.() ?? { x: 0, y: 0 };
      return { k, x: xy.x ?? 0, y: xy.y ?? 0 };
    });

    withPos.sort((a, c) => a.y - c.y || a.x - c.x);
    return withPos.map((o) => o.k);
  };

  // 初回に消す対象（=の直下が基本）
  const getRoot = () => {
    const ws = deps.wsRef.current;
    if (!ws) return null;

    const start = getStart(deps);
    if (!start) return null;

    const kids = listVisualChildren(start);
    // start直下があるならそれ（= を残したい設計に合う）
    return kids[0] ?? start;
  };

  const clearAll = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;
    for (const b of getAll(deps)) setVisual(b, "normal");
  };

  const apply = () => {
    const ws = deps.wsRef.current;
    if (!ws) return;

    clearAll();

    if (!focusOn) {
      ws.render();
      ws.resize();
      return;
    }

    // すでに消した層は全部 hide（薄くしたいなら dim に）
    for (const group of history) {
      for (const id of group) {
        const b = ws.getBlockById(id);
        if (b) setVisual(b, "hide"); // ← "dim" にすると薄く残る
      }
    }

    // 次に潜る（=次に消える）層を軽く強調したいなら dim
    // 「強調いらん」ならこのforは消してOK
    for (const id of frontier) {
      const b = ws.getBlockById(id);
      if (b) setVisual(b, "dim");
    }

    ws.render();
    ws.resize();
  };

  const reset = () => {
    history.length = 0;
    frontier = new Set<string>();
  };

  const toggleFocus = () => {
    focusOn = !focusOn;
    reset();
    apply();
  };

  // Down: 層を1段進める（「直近に消えた層」に繋がるブロックを全部同時に消す）
  const focusDown = () => {
    if (!focusOn) return;
    const ws = deps.wsRef.current;
    if (!ws) return;

    // 初回：rootを1個だけ消す（= 1が消える）
    if (history.length === 0) {
      const root = getRoot();
      if (!root) return;

      const group = [root.id];
      history.push(group);
      frontier = new Set(group);

      apply();
      return;
    }

    // 次層：frontier（直近に消えた層）の“直接の子”を全部集めて消す
    const next = new Set<string>();

    for (const id of frontier) {
      const b = ws.getBlockById(id);
      if (!b) continue;

      for (const kid of listVisualChildren(b)) {
        // 「basic_start は層に入れたくない」なら除外してOK
        if (kid.type === "basic_start") continue;
        next.add(kid.id);
      }
    }

    // もう進めない（葉）
    if (next.size === 0) return;

    const group = Array.from(next);
    history.push(group);
    frontier = next;

    apply();
  };

  // Up: 層を1段戻す（逆順に復活）
  const focusUp = () => {
    if (!focusOn) return;

    if (history.length === 0) return;

    history.pop();

    // frontier を「ひとつ前に消えた層」に戻す
    const prev = history.length ? history[history.length - 1] : [];
    frontier = new Set(prev);

    apply();
  };
  return {
    toggleFocus,
    focusStep: (dir: 1 | -1) => (dir === 1 ? focusDown() : focusUp()),
    focusDown,
    focusUp,

    // ★追加
    isEnabled: () => focusOn,
    setEnabled: (v: boolean) => {
      focusOn = v;
      apply();
    },
  };
};
