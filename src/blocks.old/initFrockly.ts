// src/blocks/initFrockly.ts
import * as Blockly from "blockly";
import "blockly/blocks";

let inited = false;

export async function initFrockly() {
  if (inited) return;
  inited = true;

  await import("./excel_dynargs");           // mutator/extension

  const excel = await import("./excel_blocks.gen");  // ★
  excel.registerExcelBlocks();                        // ★ これが要る

  await import("./frockly_blocks");          // 手作りブロック
  await import("./frockly_generators");      // 手作りgenerator（あるなら）


}
