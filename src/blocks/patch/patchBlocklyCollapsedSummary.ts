// src/blocks/patch/patchBlocklyCollapsedSummary.ts
import * as Blockly from "blockly";

type AnySvg = any;

export function patchBlocklyCollapsedSummary() {
  const proto: AnySvg = (Blockly as any).BlockSvg?.prototype;
  if (!proto) {
    console.warn("[Frockly] BlockSvg prototype not found");
    return;
  }
  if (proto.__frocklyPatchedCollapsedSummary) return;
  proto.__frocklyPatchedCollapsedSummary = true;

  const candidates = [
    "getCollapsedText",
    "getCollapsedText_",
    "getSummaryText",
    "getSummaryText_",
  ];

  const found = candidates.filter((k) => typeof proto[k] === "function");
  console.log("[Frockly] collapsed-summary candidates:", found);

  for (const key of found) {
    const orig = proto[key];
    proto[key] = function (...args: any[]) {
      const want = (this as AnySvg).__frocklyCollapsedText;
      if (typeof want === "string" && want.length) return want;
      return orig.apply(this, args);
    };
    console.log("[Frockly] patched:", key);
  }
}
