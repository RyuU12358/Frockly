import * as Blockly from "blockly";

function getSvg(ws: Blockly.WorkspaceSvg): SVGSVGElement | null {
  // getParentSvg が無い/違う場合もあるので保険
  const anyWs = ws as any;
  return (
    (ws as any).getParentSvg?.() ?? anyWs.svgGroup_?.ownerSVGElement ?? null
  );
}

function findMainBg(svg: SVGSVGElement): SVGRectElement | null {
  // よくあるパターン
  const a = svg.querySelector(
    "rect.blocklyMainBackground"
  ) as SVGRectElement | null;
  if (a) return a;

  // まれに rect じゃなくて別構造っぽく見える時の保険
  const b = svg.querySelector(".blocklyMainBackground") as any;
  if (b?.tagName?.toLowerCase() === "rect") return b as SVGRectElement;

  // 最終保険：一番でかそうな rect を拾う（雑やけど出すため）
  const rects = Array.from(svg.querySelectorAll("rect")) as SVGRectElement[];
  return (
    rects.find((r) => (r.getAttribute("width") ?? "").includes("100%")) ??
    rects[0] ??
    null
  );
}

export function ensureGridPattern(ws: Blockly.WorkspaceSvg) {
  const svg = getSvg(ws);
  if (!svg) {
    console.warn("[grid] svg not found");
    return;
  }

  const anyWs = ws as any;
  if (anyWs.__frocklyGridDone) return;

  const NS = "http://www.w3.org/2000/svg";
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(NS, "defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  if (!svg.querySelector("#frocklyGrid")) {
    const pattern = document.createElementNS(NS, "pattern");
    pattern.setAttribute("id", "frocklyGrid");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "24");
    pattern.setAttribute("height", "24");

    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M 24 0 L 0 0 0 24");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(0,0,0,0.10)");
    path.setAttribute("stroke-width", "1");

    pattern.appendChild(path);
    defs.appendChild(pattern);
  }

  const bg = findMainBg(svg);
  if (!bg) {
    console.warn("[grid] main background rect not found");
    return;
  }

  bg.setAttribute("fill", "url(#frocklyGrid)");
  // Blocklyがstyleで上書きする場合があるので念押し
  (bg.style as any).fill = "url(#frocklyGrid)";

  anyWs.__frocklyGridDone = true;
}

export function setWorkspaceWatermark(ws: Blockly.WorkspaceSvg, title: string) {
  const anyWs = ws as any;

  // ★最優先：Blocklyが用意してる “一番上のSVGグループ” を狙う
  const topGroup: SVGGElement | null = anyWs.svgGroup_ ?? null;

  if (!topGroup) {
    console.warn("[wm] topGroup not found");
    return;
  }

  // 既存あれば使い回し
  let el: SVGTextElement | null = anyWs.__frocklyWmEl ?? null;

  if (!el) {
    el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", "16");
    el.setAttribute("y", "26");
    el.setAttribute("fill", "rgba(0,0,0,0.45)");
    el.setAttribute("pointer-events", "none");
    el.setAttribute("font-size", "14");
    el.setAttribute("font-weight", "600");

    // ★ここが肝：最後に入れる＝最前面
    topGroup.appendChild(el);

    anyWs.__frocklyWmEl = el;
  }

  el.textContent = title || "";
}
