import * as Blockly from "blockly";
import type { FnSpec } from "./types";

const EXCLUDE = new Set(["LET", "LAMBDA"]);

export function registerFnBlocks(specs: FnSpec[]) {
  const json = specs
    .filter((s) => !EXCLUDE.has(s.name.toUpperCase()))
    .map((s) => ({
      type: `frockly_${s.name.toUpperCase()}`,
      message0: "",
      args0: [],
      output: null,
      colour: 200,
      mutator: "frockly_fn_dynargs",
      extensions: ["frockly_fn_ui"],
    }));

  Blockly.defineBlocksWithJsonArray(json as any);
}
