// gen/registry.ts
import * as Blockly from "blockly";
import { registerFnBlocks } from "./blockFactory"; // ←今貼ってくれたやつ
import { registerFnGenerator } from "./registerFnGenerator";
import type { FnSpec, FnSpecMap } from "./types";
export function ensureFnBlockDefined(name: string): boolean {
  const fn = name.toUpperCase();

  // ===== 構文ブロックは特別扱い =====
  if (fn === "LET") return true; // frockly_let は syntax.ts で定義済み
  if (fn === "LAMBDA") return true; // frockly_lambda も同様

  const type = `frockly_${fn}`;

  // すでにブロック定義があればOK
  if (Blockly.Blocks[type]) {
    registerFnGenerator(type, fn);
    return true;
  }

  const spec = getFnSpec(fn);
  if (!spec) return false;

  // 必要ならここで単体生成（今は多分使ってない）
  registerFnBlocks([spec]);
  registerFnGenerator(type, fn);
  return true;
}

const map: FnSpecMap = new Map();

export function setFnSpecs(specs: FnSpec[]) {
  map.clear();
  for (const s of specs) map.set(s.name, s);
}

export function getFnSpec(name: string): FnSpec | undefined {
  return map.get(name.toUpperCase());
}

export function getAllFnSpecs(): FnSpec[] {
  return [...map.values()];
}
