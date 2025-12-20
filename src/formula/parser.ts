import type { Ast } from "./ast";
import type { Tok } from "./tokenize";

function bpOf(tok: Tok): { lbp: number; rbp: number; op: string; isCmp: boolean } | null {
  if (tok.kind === "OP") {
    const op = tok.text;
    if (op === "^") return { lbp: 70, rbp: 69, op, isCmp: false }; // 右結合
    if (op === "*" || op === "/") return { lbp: 60, rbp: 60, op, isCmp: false };
    if (op === "+" || op === "-") return { lbp: 50, rbp: 50, op, isCmp: false };
    if (op === "&") return { lbp: 40, rbp: 40, op, isCmp: false };
  }
  if (tok.kind === "CMP") {
    return { lbp: 30, rbp: 30, op: tok.text, isCmp: true };
  }
  return null;
}

export function parseAst(src: string, toks: Tok[]): Ast {
  let p = 0;

  function peek() { return toks[p]; }
  function eat() { return toks[p++]; }

  function recoverRaw(stop: Set<string>): Ast {
    const start = peek().i0;
    let end = start;

    while (true) {
      const t = peek();
      if (t.kind === "EOF") break;
      if (stop.has(t.kind)) break;
      end = t.i1;
      eat();
    }

    const text = src.slice(start, end);
    return { kind: "Raw", text };
  }

  function parsePrimary(): Ast {
    const t = peek();

    // unary -
    if (t.kind === "OP" && t.text === "-") {
      eat();
      const expr = parseExpr(65);
      return { kind: "Unary", op: "-", expr };
    }

    if (t.kind === "NUMBER") { eat(); return { kind: "Num", text: t.text }; }
    if (t.kind === "STRING") { eat(); return { kind: "Str", text: t.text }; }
    if (t.kind === "REF") { eat(); return { kind: "Ref", text: t.text }; }

    // ( ... )
    if (t.kind === "LPAREN") {
      eat();
      const inner =
        (peek().kind === "RPAREN")
          ? ({ kind: "Raw", text: "" } as Ast)
          : parseExpr(0);

      if (peek().kind === "RPAREN") eat();
      return { kind: "Paren", inner };
    }

    // NAME or CALL
    if (t.kind === "NAME") {
      const name = t.text;
      eat();

      if (peek().kind === "LPAREN") {
        eat();

        const args: Ast[] = [];
        while (peek().kind !== "RPAREN" && peek().kind !== "EOF") {
          // 空引数 ",," とか ",)" を許容
          if (peek().kind === "COMMA") {
            args.push({ kind: "Raw", text: "" });
            eat();
            continue;
          }

          const beforeP = p;
          let arg: Ast;
          try {
            arg = parseExpr(0);
          } catch {
            p = beforeP;
            arg = recoverRaw(new Set(["COMMA", "RPAREN"]));
          }
          args.push(arg);

          if (peek().kind === "COMMA") eat();
          else break;
        }

        if (peek().kind === "RPAREN") eat();
        return { kind: "Call", name, args };
      }

      // NAME単体は v0 ではRAW寄り（未対応要素の可能性が高い）
      return { kind: "Raw", text: name };
    }

    // それ以外 → 次の区切りまでRAW回収
    return recoverRaw(new Set(["COMMA", "RPAREN"]));
  }

  function parseExpr(minBp: number): Ast {
    let left = parsePrimary();

    while (true) {
      const t = peek();
      const bp = bpOf(t);
      if (!bp) break;
      if (bp.lbp < minBp) break;

      eat();

      const beforeP = p;
      let right: Ast;
      try {
        right = parseExpr(bp.rbp);
      } catch {
        p = beforeP;
        right = recoverRaw(new Set(["COMMA", "RPAREN"]));
      }

      left = { kind: "Binary", op: bp.op, left, right };
    }

    return left;
  }

  const ast = parseExpr(0);
  return ast;
}
