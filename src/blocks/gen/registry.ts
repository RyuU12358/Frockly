// gen/registry.ts
import * as Blockly from "blockly";
import { registerFnBlocks } from "./blockFactory"; // ←今貼ってくれたやつ
import { registerFnGenerator } from "./registerFnGenerator";
import type { FnSpec, FnSpecMap } from "./types";
export function ensureFnBlockDefined(name: string): boolean {
  const fn = name.toUpperCase();
  const type = `frockly_${fn}`;

  // すでにブロック定義があればOK
  if (Blockly.Blocks[type]) {
    registerFnGenerator(type, fn); // generatorだけ念のため
    return true;
  }

  const spec = getFnSpec(fn);
  if (!spec) return false;

  // ★ここが肝：1関数だけブロック定義
  registerFnBlocks([spec]);

  // generator 登録
  registerFnGenerator(type, fn);

  return !!Blockly.Blocks[type];
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
