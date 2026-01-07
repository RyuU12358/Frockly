import { tokenizeFormula } from "../../formula/tokenize";
import { getFnSpec, getFnSpecByLocalizedName } from "../gen/registry";

let _currentLang = "en";

export function setLocalizerLang(lang: string) {
  _currentLang = lang;
}

export function getCurrentLang() {
  return _currentLang;
}

export function getSeparator(lang: string = _currentLang) {
  if (lang === "en" || lang === "ja") return ",";
  if (lang === "fr") return ";";
  return ";";
}

export function localizeFormula(
  formula: string,
  lang: string = _currentLang
): string {
  const sep = getSeparator(lang);

  const { src, toks } = tokenizeFormula(formula);
  let out = "";
  let last = 0;

  for (const t of toks) {
    // Append non-token parts (whitespace)
    out += src.slice(last, t.i0);

    if (t.kind === "NAME") {
      const spec = getFnSpec(t.text);
      // Replace with localized name if available
      out += spec?.localizedName ?? t.text;
    } else if (t.kind === "COMMA") {
      out += sep;
    } else if (t.kind === "EOF") {
      // nothing
    } else {
      out += t.text;
    }
    last = t.i1;
  }
  return out;
}

export function delocalizeFormula(
  formula: string,
  lang: string = _currentLang
): string {
  const sep = getSeparator(lang);

  // Pre-normalize separator to comma if needed
  let input = formula;
  if (sep !== ",") {
    input = replaceSeparator(formula, sep, ",");
  }

  const { src, toks } = tokenizeFormula(input);
  let out = "";
  let last = 0;

  for (const t of toks) {
    out += src.slice(last, t.i0);

    if (t.kind === "NAME") {
      // Input is localized name, convert to canonical
      const spec = getFnSpecByLocalizedName(t.text); // reverse lookup
      out += spec?.name ?? t.text;
    } else {
      out += t.text;
    }
    last = t.i1;
  }
  return out;
}

function replaceSeparator(src: string, fromSep: string, toSep: string): string {
  if (fromSep === toSep) return src;

  let out = "";
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"') {
      // String skip
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === '"') {
          if (src[j + 1] === '"') {
            j += 2;
            continue;
          }
          j++;
          break;
        }
        j++;
      }
      out += src.slice(i, j);
      i = j;
    } else if (ch === fromSep) {
      out += toSep;
      i++;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}
