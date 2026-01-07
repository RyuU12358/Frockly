import * as Blockly from "blockly";
import { javascriptGenerator, Order } from "blockly/javascript";

const G: any = javascriptGenerator;
export const ExcelGen = G;
export { Order as ExcelOrder };
function excelQuote(s: string) {
  return `"${(s ?? "").replace(/"/g, '""')}"`;
}

export function registerBasicGenerators() {
  // ★ここが無いなら、その時点で import/版の問題
  if (!G?.forBlock) {
    throw new Error(
      "javascriptGenerator.forBlock is missing (Blockly version/import mismatch)"
    );
  }

  G.forBlock["basic_start"] = function (block: Blockly.Block) {
    const expr = G.valueToCode(block, "EXPR", Order.NONE) || "";
    return `=${expr}\n`;
  };

  G.forBlock["basic_number"] = function (block: Blockly.Block) {
    const raw = String(block.getFieldValue("NUM") ?? "").trim();
    return [raw, Order.ATOMIC];
  };

  G.forBlock["basic_string"] = function (block: Blockly.Block) {
    const raw = String(block.getFieldValue("STR") ?? "");
    return [excelQuote(raw), Order.ATOMIC];
  };

  G.forBlock["basic_cell"] = function (block: Blockly.Block) {
    const raw = String(block.getFieldValue("CELL") ?? "").trim();
    return [raw, Order.ATOMIC];
  };

  G.forBlock["basic_range"] = function (block: Blockly.Block) {
    const raw = String(block.getFieldValue("RANGE") ?? "").trim();
    return [raw, Order.ATOMIC];
  };

  G.forBlock["basic_arith"] = function (block: Blockly.Block) {
    const op = String(block.getFieldValue("OP") ?? "+");
    const order =
      op === "*" || op === "/" ? Order.MULTIPLICATION : Order.ADDITION;
    const a = G.valueToCode(block, "A", order) || "";
    const b = G.valueToCode(block, "B", order) || "";
    return [`${a}${op}${b}`, order];
  };

  G.forBlock["basic_cmp"] = function (block: Blockly.Block) {
    const op = String(block.getFieldValue("OP") ?? "=");
    const a = G.valueToCode(block, "A", Order.RELATIONAL) || "";
    const b = G.valueToCode(block, "B", Order.RELATIONAL) || "";
    return [`${a}${op}${b}`, Order.RELATIONAL];
  };

  G.forBlock["basic_paren"] = function (block: Blockly.Block) {
    const inner = G.valueToCode(block, "INNER", Order.NONE) || "";
    return [`(${inner})`, Order.ATOMIC];
  };
  // ---- Name (identifier) ----
  // LET変数 / LAMBDA引数 / 名前付き関数の引数
  // ---- Name (identifier) ----
  // LET変数 / LAMBDA引数 / 名前付き関数の引数
  G.forBlock["basic_var"] = function (block: Blockly.Block) {
    const name = String(block.getFieldValue("VAR_NAME") ?? "").trim();
    // 識別子はそのまま出す（クオート不要）
    return [name, Order.ATOMIC];
  };
  G.forBlock["basic_raw"] = function (block: Blockly.Block) {
    const raw = String(block.getFieldValue("RAW") ?? "");
    // そのまま吐く（括弧が必要なら親が付ける運用）
    return [raw, Order.ATOMIC];
  };
  (G as any).forBlock["basic_raw_call"] = function (block: Blockly.Block) {
    const fn = (block.getFieldValue("FN") || "FOOBAR").trim();

    const args: string[] = [];
    for (let i = 0; i < 50; i++) {
      if (!block.getInput(`ARG${i}`)) break;
      args.push(G.valueToCode(block, `ARG${i}`, Order.NONE) || "");
    }
    while (args.length && args[args.length - 1] === "") args.pop();

    return [`${fn}(${args.join(",")})`, Order.FUNCTION_CALL];
  };
  function firstValueExpr(block: Blockly.Block): string {
    const VALUE =
      (Blockly as any).inputTypes?.VALUE ??
      (Blockly as any).inputs?.inputTypes?.VALUE; // 互換用（環境差あるため）

    const valueInputs = block.inputList
      .filter((i) => i.type === VALUE)
      .map((i) => i.name);

    for (const name of valueInputs) {
      const v = (G.valueToCode(block, name, Order.NONE) ?? "").trim();
      if (v) return v;
    }
    return "";
  }

  G.forBlock["fn_root"] = function (block: Blockly.Block) {
    const expr = firstValueExpr(block);
    // ★fn側は = を付けない
    return expr ? `${expr}\n` : "";
  };
}
