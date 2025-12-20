// src/blocks/excel_dynargs.ts
import * as Blockly from "blockly";

// 何もしない Mutator（とりあえず存在だけ作る）
const MIXIN = {
  saveExtraState() {
    return {};
  },
  loadExtraState(_state: any) {
    // no-op
  },
};

const EXT = function (this: Blockly.Block) {
  // no-op（必要ならここで初期 input 追加とかする）
};

Blockly.Extensions.registerMutator(
  "frockly_excel_dynargs",
  MIXIN,
  EXT
);


