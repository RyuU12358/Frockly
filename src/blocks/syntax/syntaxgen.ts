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

    let i = 0;
    while (block.getInput(`ARG${i}`)) {
      const a = G.valueToCode(block, `ARG${i}`, Order.NONE) || "";
      if (a) args.push(a);
      i++;
    }

    const body = G.valueToCode(block, "BODY", Order.NONE) || "";

    return [`LAMBDA(${[...args, body].join(",")})`, Order.FUNCTION_CALL];
  };
}
