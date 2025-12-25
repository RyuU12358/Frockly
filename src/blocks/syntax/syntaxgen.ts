import * as Blockly from "blockly";
import { javascriptGenerator, Order } from "blockly/javascript";

const G: any = javascriptGenerator;

export function registerSyntaxGenerators() {
  registerLetGenerator();
  registerLambdaGenerator();
}

/* ================================
 * LET
 * ================================ */
function registerLetGenerator() {
  G.forBlock["frockly_LET"] = function (block: Blockly.Block) {
    const parts: string[] = [];

    let i = 0;
    while (block.getInput(`VAR${i}`)) {
      const v = G.valueToCode(block, `VAR${i}`, Order.NONE) || "";
      const val = G.valueToCode(block, `VAL${i}`, Order.NONE) || "";

      // 空ペアは無視
      if (v || val) {
        parts.push(v, val);
      }
      i++;
    }

    const result = G.valueToCode(block, "RESULT", Order.NONE) || "";

    return [`LET(${[...parts, result].join(",")})`, Order.FUNCTION_CALL];
  };
}

/* ================================
 * LAMBDA
 * ================================ */
function registerLambdaGenerator() {
  G.forBlock["frockly_LAMBDA"] = function (block: Blockly.Block) {
    const args: string[] = [];

    // まず ARG0.. を全部集める
    let i = 0;
    while (block.getInput(`ARG${i}`)) {
      const a = (G.valueToCode(block, `ARG${i}`, Order.NONE) || "").trim();
      if (a) args.push(a);
      i++;
    }

    // ★ BODY が存在するなら読む（無いなら読まない＝落ちない）
    let body = "";
    if (block.getInput("BODY")) {
      body = (G.valueToCode(block, "BODY", Order.NONE) || "").trim();
    }

    // BODY が無い場合：最後の ARG を body 扱いにする（最も自然）
    if (!body && args.length > 0) {
      body = args.pop()!; // 最後を body
    }

    // まだ body 無いなら空
    if (!body) return ["", Order.ATOMIC];

    return [`LAMBDA(${[...args, body].join(",")})`, Order.FUNCTION_CALL];
  };
}
