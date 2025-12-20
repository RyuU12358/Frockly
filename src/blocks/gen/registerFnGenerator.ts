// gen/registerFnGenerator.ts
import * as Blockly from "blockly";
import { javascriptGenerator as G, Order } from "blockly/javascript";

export function registerFnGenerator(type: string, fnName: string) {
  if ((G as any).forBlock[type]) return; // 二重登録防止

  (G as any).forBlock[type] = function (block: Blockly.Block) {
    const args: string[] = [];
    for (let i = 0; i < 50; i++) {
      if (!block.getInput(`ARG${i}`)) break;
      args.push(G.valueToCode(block, `ARG${i}`, Order.NONE) || "");
    }
    while (args.length && args[args.length - 1] === "") args.pop();

    return [`${fnName}(${args.join(",")})`, Order.FUNCTION_CALL];
  };
}
