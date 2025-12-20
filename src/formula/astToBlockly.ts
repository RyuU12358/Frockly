import * as Blockly from "blockly";
import type { Ast } from "./ast";
import { ensureFnBlockDefined, getFnSpec } from "../blocks/gen/registry";
import { ensureArgs } from "../blocks/gen/ensureArgs";

type Build = { block: Blockly.BlockSvg; outConn: Blockly.Connection | null };

function isRangeRef(s: string) {
  return s.includes(":");
}

function finalize(b: Blockly.BlockSvg) {
  b.initSvg();
  (b as any).render?.();
  return b;
}

// RAWFN (unknown function) 用：必要な ARG 入力を揃える
function ensureInputs(block: Blockly.Block, argc: number) {
  for (let i = 0; i < argc; i++) {
    const name = `ARG${i}`;
    if (!block.getInput(name)) block.appendValueInput(name).setCheck(null);
  }
}

export function astToBlockly(workspace: Blockly.WorkspaceSvg, ast: Ast): Build {
  function build(node: Ast): Build {
    switch (node.kind) {
      case "Num": {
        const b = finalize(
          workspace.newBlock("basic_number") as Blockly.BlockSvg
        );
        b.setFieldValue(node.text, "NUM");
        return { block: b, outConn: b.outputConnection };
      }

      case "Str": {
        const b = finalize(
          workspace.newBlock("basic_string") as Blockly.BlockSvg
        );
        b.setFieldValue(node.text.replace(/^"|"$/g, ""), "STR");
        return { block: b, outConn: b.outputConnection };
      }

      case "Ref": {
        const type = isRangeRef(node.text) ? "basic_range" : "basic_cell";
        const field = type === "basic_range" ? "RANGE" : "CELL";
        const b = finalize(workspace.newBlock(type) as Blockly.BlockSvg);
        b.setFieldValue(node.text, field);
        return { block: b, outConn: b.outputConnection };
      }

      case "Raw": {
        const b = finalize(workspace.newBlock("basic_raw") as Blockly.BlockSvg);
        b.setFieldValue(node.text, "RAW");
        return { block: b, outConn: b.outputConnection };
      }

      case "Paren": {
        const b = finalize(
          workspace.newBlock("basic_paren") as Blockly.BlockSvg
        );
        const inner = build(node.inner);
        const conn = b.getInput("INNER")?.connection;
        if (conn && inner.outConn) conn.connect(inner.outConn);
        return { block: b, outConn: b.outputConnection };
      }

      case "Unary": {
        // v0: -a は 0 - a に落とす
        const zero: Ast = { kind: "Num", text: "0" };
        return build({ kind: "Binary", op: "-", left: zero, right: node.expr });
      }

      case "Binary": {
        const isCmp = ["=", "<>", "<", "<=", ">", ">="].includes(node.op);
        const b = finalize(
          workspace.newBlock(
            isCmp ? "basic_cmp" : "basic_arith"
          ) as Blockly.BlockSvg
        );
        b.setFieldValue(node.op, "OP");

        const L = build(node.left);
        const R = build(node.right);

        const inA = b.getInput("A")?.connection;
        const inB = b.getInput("B")?.connection;
        if (inA && L.outConn) inA.connect(L.outConn);
        if (inB && R.outConn) inB.connect(R.outConn);

        return { block: b, outConn: b.outputConnection };
      }

      case "Call": {
        const fn = node.name.toUpperCase();
        const type = `frockly_${fn}`;

        // 既知関数なら動的にブロック定義を生やす
        ensureFnBlockDefined(fn);

        if (Blockly.Blocks[type]) {
          // ★既知関数：ちゃんと frockly_FN を作る
          const b = finalize(workspace.newBlock(type) as Blockly.BlockSvg);

          // 引数inputを argc に揃える（既存の仕組みを使う）
          const spec = getFnSpec(fn);
          if (spec) ensureArgs(b, node.args.length, spec);

          for (let i = 0; i < node.args.length; i++) {
            const child = build(node.args[i]);
            const conn = b.getInput(`ARG${i}`)?.connection;
            if (conn && child.outConn) conn.connect(child.outConn);
          }
          return { block: b, outConn: b.outputConnection };
        }

        // ★未知関数：basic_raw_call を作る（mutator無し版）
        const rb = finalize(
          workspace.newBlock("basic_raw_call") as Blockly.BlockSvg
        );
        if (rb.getField("FN")) rb.setFieldValue(fn, "FN");

        ensureInputs(rb, node.args.length);

        for (let i = 0; i < node.args.length; i++) {
          const child = build(node.args[i]);
          const conn = rb.getInput(`ARG${i}`)?.connection;
          if (conn && child.outConn) conn.connect(child.outConn);
        }

        return { block: rb, outConn: rb.outputConnection };
      }
    }
  }

  return build(ast);
}
