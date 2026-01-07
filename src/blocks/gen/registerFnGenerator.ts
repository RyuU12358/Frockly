import * as Blockly from "blockly";
import { javascriptGenerator as G, Order } from "blockly/javascript";
import { getSeparator, getCurrentLang } from "../formula/localizer";
import { getFnSpec } from "./registry";

// ...

export function registerFnGenerator(type: string, fnName: string) {
  if ((G as any).forBlock[type]) return; // 二重登録防止

  (G as any).forBlock[type] = function (block: Blockly.Block) {
    const args: string[] = [];
    for (let i = 0; i < 50; i++) {
      if (!block.getInput(`ARG${i}`)) break;
      args.push(G.valueToCode(block, `ARG${i}`, Order.NONE) || "");
    }
    while (args.length && args[args.length - 1] === "") args.pop();

    const sep = getSeparator();

    // 現在の言語に応じて関数名をローカライズ
    let codeName = fnName;
    const lang = getCurrentLang();
    if (lang !== "en") {
      const spec = getFnSpec(fnName);
      if (spec?.localizedName) {
        codeName = spec.localizedName;
      }
    }

    return [`${codeName}(${args.join(sep)})`, Order.FUNCTION_CALL];
  };
}
