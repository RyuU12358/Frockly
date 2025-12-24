import * as Blockly from "blockly";
import { registerSyntaxUiExtension } from "./syntaxUi";

export function registerSyntaxBlocks() {
  registerSyntaxUiExtension();
  if (Blockly.Blocks["frockly_LET"]) return;
  Blockly.defineBlocksWithJsonArray([
    {
      type: "frockly_LAMBDA",
      message0: "LAMBDA", // とりあえず。ヘッダいじるなら fn_ui 拡張に寄せる
      args0: [],
      output: null,
      colour: 200,
      mutator: "frockly_fn_dynargs",
      extensions: ["frockly_syntax_ui"], // 折りたたみ要約（さっきのやつ）
    },
  ] as any);

  Blockly.defineBlocksWithJsonArray([
    {
      type: "frockly_LET",
      message0: "", // 表示はmutator側でFN_HEADERを作る
      args0: [],
      output: null,
      colour: 200,
      mutator: "frockly_let_dynpairs",
      extensions: ["frockly_syntax_ui"],
    },
  ] as any);
}
