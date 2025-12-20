export type TokKind =
  | "NAME" | "NUMBER" | "STRING" | "REF"
  | "OP" | "CMP"
  | "LPAREN" | "RPAREN" | "COMMA"
  | "EOF";

export type Tok = {
  kind: TokKind;
  text: string;
  i0: number; // start index in source
  i1: number; // end index in source
};

function isSpace(ch: string) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

const RE_REF_A1 = /^\$?[A-Za-z]{1,3}\$?\d{1,7}$/;      // A1, $A$1
const RE_REF_COL = /^\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}$/; // A:A
const RE_REF_ROW = /^\$?\d{1,7}:\$?\d{1,7}$/;          // 1:1
const RE_REF_RANGE = /^\$?[A-Za-z]{1,3}\$?\d{1,7}:\$?[A-Za-z]{1,3}\$?\d{1,7}$/; // A1:B9

function tryReadRef(src: string, i: number): Tok | null {
  // 参照は “最長一致” で拾う（A1:B9 を A1 と誤認しない）
  // 候補文字をざっくり伸ばして、最後に正規表現で判定する。
  let j = i;
  while (j < src.length) {
    const ch = src[j];
    if (/[A-Za-z0-9:$]/.test(ch)) j++;
    else break;
  }
  const chunk = src.slice(i, j);
  // 最長から短い方へ落として判定
  for (let k = chunk.length; k >= 1; k--) {
    const s = chunk.slice(0, k);
    const up = s.toUpperCase();
    if (RE_REF_RANGE.test(up) || RE_REF_COL.test(up) || RE_REF_ROW.test(up) || RE_REF_A1.test(up)) {
      return { kind: "REF", text: up, i0: i, i1: i + k };
    }
  }
  return null;
}

export function tokenizeFormula(src0: string): { src: string; toks: Tok[] } {
  // 先頭の '=' は剥がす（basic_start が '=' を表現する前提）
  const src = src0.startsWith("=") ? src0.slice(1) : src0;

  const toks: Tok[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (isSpace(ch)) { i++; continue; }

    // 文字列
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === '"') {
          if (src[j + 1] === '"') { j += 2; continue; } // "" エスケープ
          j++; break;
        }
        j++;
      }
      const text = src.slice(i, j);
      toks.push({ kind: "STRING", text, i0: i, i1: j });
      i = j;
      continue;
    }

    // 区切り/括弧
    if (ch === "(") { toks.push({ kind: "LPAREN", text: ch, i0: i, i1: i + 1 }); i++; continue; }
    if (ch === ")") { toks.push({ kind: "RPAREN", text: ch, i0: i, i1: i + 1 }); i++; continue; }
    if (ch === ",") { toks.push({ kind: "COMMA", text: ch, i0: i, i1: i + 1 }); i++; continue; }

    // 比較（2文字優先）
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") {
      toks.push({ kind: "CMP", text: two, i0: i, i1: i + 2 }); i += 2; continue;
    }
    if (ch === "<" || ch === ">" || ch === "=") {
      toks.push({ kind: "CMP", text: ch, i0: i, i1: i + 1 }); i++; continue;
    }

    // 演算子
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "^" || ch === "&") {
      toks.push({ kind: "OP", text: ch, i0: i, i1: i + 1 }); i++; continue;
    }

    // 参照（先に拾う）
    const ref = tryReadRef(src, i);
    if (ref) { toks.push(ref); i = ref.i1; continue; }

    // 数値
    if (/\d/.test(ch) || (ch === "." && /\d/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      toks.push({ kind: "NUMBER", text, i0: i, i1: j });
      i = j;
      continue;
    }

    // NAME
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j])) j++;
      const text = src.slice(i, j).toUpperCase();
      toks.push({ kind: "NAME", text, i0: i, i1: j });
      i = j;
      continue;
    }

    // それ以外は1文字RAW扱い（parser側でまとめて回収）
    toks.push({ kind: "OP", text: ch, i0: i, i1: i + 1 });
    i++;
  }

  toks.push({ kind: "EOF", text: "", i0: src.length, i1: src.length });
  return { src, toks };
}
