import * as Blockly from "blockly";
import type { FnSpec } from "./types";

export function registerFnBlocks(specs: FnSpec[]) {
  const json = specs.map((s) => {
    return {
      type: `frockly_${s.name}`,
      message0: "", // ★メイン表示を空にする
      args0: [],
      output: null,
      colour: 200,
      mutator: "frockly_fn_dynargs",
      extensions: ["frockly_fn_ui"], // ★UIはextensionで組む
    };
  });

  Blockly.defineBlocksWithJsonArray(json as any);
}
