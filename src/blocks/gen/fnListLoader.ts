import type { FnSpec } from "./types";
import fnListUrl from "../data/fn_list.txt?url";

export async function loadFnList(): Promise<FnSpec[]> {


  const res = await fetch(fnListUrl);


  const text = await res.text();


  const specs = parseFnList(text);

  return specs;
}

export function parseFnList(text: string): FnSpec[] {
  const out: FnSpec[] = [];

  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line) continue;

    // ★ BOM対策（これで 1行目が "﻿(ABS,1,0)" みたいなやつを救える）
    line = line.replace(/^\uFEFF/, "");

    if (!line.startsWith("(") || !line.endsWith(")")) continue;

    const body = line.slice(1, -1);
    const parts = body.split(",").map((s) => s.trim());
    if (parts.length < 3) continue;

    const name = parts[0].toUpperCase();
    const min = Number(parts[1]);
    const variadic = parts[2] === "1";

    if (!Number.isFinite(min)) continue;

    if (!variadic) {
      out.push({ name, min, variadic: false });
      continue;
    }

    const step = Number(parts[3] ?? "1");
    const max = Number(parts[4] ?? "0");
    out.push({
      name,
      min,
      variadic: true,
      step: Number.isFinite(step) ? step : 1,
      max: Number.isFinite(max) ? max : 0,
    });
  }

  return out;
}
