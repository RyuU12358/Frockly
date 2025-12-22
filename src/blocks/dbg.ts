import * as Blockly from "blockly";

export function debugTraceTempWritesOnce() {
  const proto: any = (Blockly as any).FieldLabel?.prototype;
  if (!proto || proto.__frocklyTraced) return;
  proto.__frocklyTraced = true;

  const orig = proto.setValue;
  if (typeof orig !== "function") return;
  let __frocklyInternalWrite = false;

  function writeTempFromFrockly(block: Blockly.Block, s: string) {
    const f: any = block.getField("_TEMP_COLLAPSED_FIELD");
    if (!f?.setValue) return false;
    __frocklyInternalWrite = true;
    try {
      f.setValue(s);
    } finally {
      __frocklyInternalWrite = false;
    }
    return true;
  }

  proto.setValue = function (v: any) {
    // name が _TEMP_COLLAPSED_FIELD のときだけ追う
    if (this?.name === "_TEMP_COLLAPSED_FIELD" && !__frocklyInternalWrite) {
      console.groupCollapsed("[TRACE] TEMP setValue:", v);
      console.trace();
      console.groupEnd();
    }

    return orig.call(this, v);
  };

  console.log(
    "[Frockly] tracing _TEMP_COLLAPSED_FIELD writes via FieldLabel#setValue"
  );
}

type AnySvg = any;

export function patchBlocklyCollapsedSummary() {
  const proto: AnySvg = (Blockly as any).BlockSvg?.prototype;
  if (!proto || proto.__frocklyPatchedCollapsedSummary) return;
  proto.__frocklyPatchedCollapsedSummary = true;

  const candidates = [
    "getCollapsedText",
    "getCollapsedText_",
    "getSummaryText",
    "getSummaryText_",
    "toString", // 最後の保険（強いけど影響大）
  ];

  const found = candidates.filter((k) => typeof proto[k] === "function");
  console.log("[Frockly] collapsed-summary candidates:", found);

  for (const key of found) {
    const orig = proto[key];
    proto[key] = function (...args: any[]) {
      // BlockSvgインスタンス（＝ this ）に付けた値を優先
      const want = (this as AnySvg).__frocklyCollapsedText;
      if (want) return want;
      return orig.apply(this, args);
    };
    console.log("[Frockly] patched:", key);
  }
}
