// src/components/blockly/view/dom.ts
import type * as Blockly from "blockly";

export type VisualMode = "normal" | "dim" | "hide";

function isOwnedByRoot(el: Element, root: SVGGElement) {
  const owner = el.closest("g[data-id]");
  return owner === root;
}

/** pathObject から取りうるパスを全部拾う（影/ハイライト含む） */
function getPathObjectPaths(b: Blockly.Block): SVGPathElement[] {
  const po: any = (b as any).pathObject ?? null;
  if (!po) return [];
  const out: SVGPathElement[] = [];
  const push = (p: any) => {
    if (p && p instanceof SVGPathElement) out.push(p);
  };
  push(po.svgPath);
  push(po.svgPathDark);
  push(po.svgPathLight);
  return out;
}

function getOwnRoot(b: Blockly.Block): SVGGElement | null {
  return ((b as any).getSvgRoot?.() as SVGGElement | null) ?? null;
}

function getOwnPaths(b: Blockly.Block): SVGPathElement[] {
  const r = getOwnRoot(b);
  if (!r) return [];

  // 1) まず pathObject 由来（最優先）
  const poPaths = getPathObjectPaths(b);
  if (poPaths.length) return poPaths;

  // 2) フォールバック：root配下の path を列挙して owned だけ通す
  let paths = Array.from(
    r.querySelectorAll("path.blocklyPath")
  ) as SVGPathElement[];
  paths = paths.filter((p) => isOwnedByRoot(p, r));
  return paths;
}

function getOwnTexts(b: Blockly.Block): SVGTextElement[] {
  const r = getOwnRoot(b);
  if (!r) return [];
  let texts = Array.from(
    r.querySelectorAll("text.blocklyText")
  ) as SVGTextElement[];
  texts = texts.filter((t) => isOwnedByRoot(t, r));
  return texts;
}

function getOwnIcons(b: Blockly.Block): SVGGElement[] {
  const r = getOwnRoot(b);
  if (!r) return [];
  let icons = Array.from(
    r.querySelectorAll("g.blocklyIconGroup")
  ) as SVGGElement[];
  icons = icons.filter((g) => isOwnedByRoot(g, r));
  return icons;
}

/**
 * filter を “上書き” すると Outline の drop-shadow と喧嘩するので、
 * Visual用 filter を dataset に保持して合成する。
 */
function setVisualFilter(el: HTMLElement | SVGElement, visualFilter: string) {
  const anyEl = el as any;
  const prev = (anyEl.dataset?.frocklyExtraFilter as string | undefined) ?? "";
  const vf = visualFilter || "";
  const merged = (prev ? prev + " " : "") + vf;
  (el as any).style.filter = merged.trim();
}

function clearVisualFilter(el: HTMLElement | SVGElement) {
  const anyEl = el as any;
  // Visualが触った分だけ消す
  (el as any).style.filter = (
    (anyEl.dataset?.frocklyExtraFilter as string | undefined) ?? ""
  ).trim();
}

/** 経路強調用：枠(アウトライン)だけ付ける */
export function setPathOutline(b: Blockly.Block, on: boolean) {
  const paths = getOwnPaths(b);

  for (const p of paths) {
    const anyP = p as any;

    if (on) {
      p.style.stroke = "var(--frockly-path-stroke, rgba(255,255,255,0.95))";
      p.style.strokeWidth = "3";
      (p.style as any).paintOrder = "stroke fill";

      // drop-shadow は Outline 側が管理する
      // 既存 filter に追記したいので dataset に入れる
      const ds = anyP.dataset ?? (anyP.dataset = {});
      ds.frocklyExtraFilter = "drop-shadow(0 0 1px rgba(0,0,0,0.35))";

      // VisualFilter 合成（Visual側が上書きしないようにする）
      // ここでは visualFilter は空（setVisualが呼ばれると合成される）
      setVisualFilter(p, "");
    } else {
      p.style.stroke = "";
      p.style.strokeWidth = "";
      (p.style as any).paintOrder = "";

      // Outline が触った分だけ戻す
      if (anyP.dataset) anyP.dataset.frocklyExtraFilter = "";
      setVisualFilter(p, "");
    }
  }
}

export const setVisual = (b: Blockly.Block, mode: VisualMode) => {
  const r = getOwnRoot(b);
  if (!r) return;

  const paths = getOwnPaths(b);
  const texts = getOwnTexts(b);
  const icons = getOwnIcons(b);

  // ★重要：fillOpacity が効かんテーマがあるので、最終的に opacity で確実に落とす
  const apply = (op: string, visualFilter: string) => {
    for (const p of paths) {
      // “薄さ”は opacity で確実に効かす
      p.style.opacity = op;

      // もし stroke/fill を別で持ってるテーマでも、opacity一本で落ちる
      // 明度も落としたい場合は filter（ownedだけ）に付与
      setVisualFilter(p, visualFilter);
    }

    for (const t of texts) {
      t.style.opacity = op;
      setVisualFilter(t, visualFilter);
    }

    for (const g of icons) {
      (g as any).style.opacity = op;
      setVisualFilter(g, visualFilter);
    }
  };

  const reset = () => {
    for (const p of paths) {
      p.style.opacity = "";
      clearVisualFilter(p);
    }
    for (const t of texts) {
      t.style.opacity = "";
      clearVisualFilter(t);
    }
    for (const g of icons) {
      (g as any).style.opacity = "";
      clearVisualFilter(g);
    }
    (r as any).style.pointerEvents = "";
  };

  if (mode === "normal") {
    reset();
    return;
  }

  if (mode === "dim") {
    // ★「暗く沈む」系：薄すぎると “消えた” になるので 0.35〜0.5 推奨
    apply("0.38", "brightness(0.75) contrast(0.95)");
    (r as any).style.pointerEvents = "none";
    return;
  }

  // hide
  apply("0.0", "brightness(0.5) contrast(0.9)");
  (r as any).style.pointerEvents = "none";
};
