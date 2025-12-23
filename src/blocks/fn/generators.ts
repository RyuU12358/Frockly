import * as Blockly from "blockly";
import { ExcelGen as G, ExcelOrder as Order } from "../basic/generators";

// fn で使う色とかは不要。generatorだけ。

export function registerFnGenerators() {
  // fn_root: LAMBDA(x,y, body)
  G.forBlock["fn_root"] = function (block: Blockly.Block) {
    const name = String(block.getFieldValue("NAME") ?? "").trim() || "A";

    // params: statement chain
    const params: string[] = [];
    let cur = block.getInputTargetBlock("PARAMS");
    while (cur) {
      if (cur.type === "fn_param") {
        const p = String(cur.getFieldValue("NAME") ?? "").trim();
        if (p) params.push(p);
      }
      cur = cur.getNextBlock();
    }

    const body = G.valueToCode(block, "BODY", Order.NONE) || "";

    // ExcelのLAMBDAは「値」を返す式やから、Orderは FUNCTION_CALL で十分
    // ※ name はここでは使わん（名前の定義は別レイヤ）
    const lambda = `LAMBDA(${[...params, body].join(",")})`;
    return [lambda, Order.FUNCTION_CALL];
  };

  // fn_param: statementなので出力は基本いらん（使われない）
  // ただし誤って valueToCode された時に落ちないように安全策
  G.forBlock["fn_param"] = function (_block: Blockly.Block) {
    return ["", Order.ATOMIC];
  };

  // fn_call: A(1,2) みたいに呼ぶ（引数は後で増やせる）
  G.forBlock["fn_call"] = function (block: Blockly.Block) {
    const fn = String(block.getFieldValue("FN") ?? "").trim() || "A";

    // まだ引数入力が無いなら0引数で呼ぶ
    const args: string[] = [];
    for (let i = 0; i < 50; i++) {
      if (!block.getInput(`ARG${i}`)) break;
      args.push(G.valueToCode(block, `ARG${i}`, Order.NONE) || "");
    }
    while (args.length && args[args.length - 1] === "") args.pop();

    return [`${fn}(${args.join(",")})`, Order.FUNCTION_CALL];
  };
}
