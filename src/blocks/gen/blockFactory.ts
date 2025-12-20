import * as Blockly from "blockly";
import type { FnSpec } from "./types";

export function registerFnBlocks(specs: FnSpec[]) {
  const json = specs.map((s) => {
    return {
      type: `frockly_${s.name}`,
      message0: s.name,
      args0: [],                 // ★ 初期構造は空
      output: null,
      colour: 200,
      mutator: "frockly_fn_dynargs", // ★ 共通 mutator
    };
  });

  Blockly.defineBlocksWithJsonArray(json as any);
}
