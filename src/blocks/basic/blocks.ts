import * as Blockly from "blockly";
import { STR, tr } from "../../i18n/strings";
import type { UiLang } from "../../i18n/strings";
// 色カテゴリ（v0：読めるのが最優先）
const C_START = 270; // 入口（紫）
const C_REF = 210; // 参照（青）
const C_LIT = 60; // リテラル（黄）
const C_OP = 30; // 演算（オレンジ）
const C_CMP = 0; // 比較（赤）
const C_PAREN = 180; // 括弧（青緑）
const C_RAW = 120; // 未解析（灰っぽくしたいなら後で調整）
const C_BOOL = 100; // 真偽（緑寄り）

class ClickableLabel extends Blockly.FieldLabelSerializable {
  private onClick: () => void;

  constructor(text: string, onClick: () => void) {
    super(text);
    this.onClick = onClick;
  }
  override onMouseDown_(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.onClick();
  }
}

// Sheet名付きも一応ケア（Sheet1!A1）
function splitSheetPrefix(ref: string): { prefix: string; core: string } {
  const i = ref.lastIndexOf("!");
  if (i >= 0) return { prefix: ref.slice(0, i + 1), core: ref.slice(i + 1) };
  return { prefix: "", core: ref };
}

function parseAbsCellCore(
  core: string
): { colAbs: boolean; col: string; rowAbs: boolean; row: string } | null {
  // $A$1 / A$1 / $A1 / A1
  const m = core.trim().match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);
  if (!m) return null;
  return { colAbs: !!m[1], col: m[2], rowAbs: !!m[3], row: m[4] };
}

function formatAbsCellCore(p: {
  colAbs: boolean;
  col: string;
  rowAbs: boolean;
  row: string;
}) {
  return `${p.colAbs ? "$" : ""}${p.col}${p.rowAbs ? "$" : ""}${p.row}`;
}

// レンジは左右それぞれに適用（A1:B2）
function toggleAbsCell(ref: string, axis: "col" | "row"): string {
  const { prefix, core } = splitSheetPrefix(ref);

  // RANGE対応（A1:B2）
  if (core.includes(":")) {
    const [a, b] = core.split(":");
    return `${prefix}${toggleAbsCell(a, axis).replace(
      /^.*!/,
      ""
    )}:${toggleAbsCell(b, axis).replace(/^.*!/, "")}`;
  }

  const p = parseAbsCellCore(core);
  if (!p) return ref; // パースできん形式は触らない

  if (axis === "col") p.colAbs = !p.colAbs;
  else p.rowAbs = !p.rowAbs;

  return `${prefix}${formatAbsCellCore(p)}`;
}

function getAbsState(ref: string): { col: boolean; row: boolean } {
  const { core } = splitSheetPrefix(ref);
  if (core.includes(":")) {
    // レンジは左側だけ見せとく（好みで両方一致チェックしてもええ）
    const [a] = core.split(":");
    const p = parseAbsCellCore(a);
    return { col: !!p?.colAbs, row: !!p?.rowAbs };
  }
  const p = parseAbsCellCore(core);
  return { col: !!p?.colAbs, row: !!p?.rowAbs };
}

function updateAbsButtons(block: Blockly.Block, fieldName: "CELL" | "RANGE") {
  const v = String(block.getFieldValue(fieldName) ?? "");
  const s = getAbsState(v);

  const colF = block.getField(
    "ABS_COL"
  ) as Blockly.FieldLabelSerializable | null;
  const rowF = block.getField(
    "ABS_ROW"
  ) as Blockly.FieldLabelSerializable | null;

  colF?.setValue(`↔️${s.col ? "🔒" : "□"}`);
  rowF?.setValue(`↕️${s.row ? "🔒" : "□"}`);
}

export function registerBasicBlocks(lang: UiLang) {
  const t = tr(lang);
  // ---- Start (=) ----
  Blockly.Blocks["basic_start"] = {
    init: function () {
      this.appendValueInput("EXPR").setCheck(null).appendField("=");

      this.setInputsInline(true);
      this.setColour(C_START);

      // トップ専用（prev/next無し、output無し）
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setOutput(false);

      // もし hat が効く環境なら効かせる（無視されても害なし）
      // @ts-ignore
      if (typeof this.setHat === "function") this.setHat("cap");

      this.setTooltip(t(STR.TOOLTIP_START));
    },
  };

  // ---- Number literal ----
  Blockly.Blocks["basic_number"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t(STR.NUMBER))
        .appendField(new Blockly.FieldTextInput("1"), "NUM");

      this.setOutput(true, null);
      this.setColour(C_LIT);

      this.setTooltip(t(STR.TOOLTIP_NUMBER));
    },
  };

  // ---- String literal ----
  Blockly.Blocks["basic_string"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t(STR.TEXT))
        .appendField(new Blockly.FieldTextInput("text"), "STR");

      this.setOutput(true, null);
      this.setColour(C_LIT);

      this.setTooltip(t(STR.TOOLTIP_STRING));
    },
  };

  // ---- Cell reference ----
  Blockly.Blocks["basic_cell"] = {
    init: function () {
      const text = new Blockly.FieldTextInput("A1", (newVal) => {
        // 手入力でも表示が追従するように
        queueMicrotask(() => updateAbsButtons(this, "CELL"));
        return newVal;
      });

      this.appendDummyInput()
        .appendField(t(STR.CELL))
        .appendField(text, "CELL");

      // ★ 右寄せで小さく置く（横幅を増やしにくい）
      this.appendDummyInput("ABS_CTRL")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new ClickableLabel("↔️☓", () => {
            const v = String(this.getFieldValue("CELL") ?? "");
            const next = toggleAbsCell(v, "col");
            this.setFieldValue(next, "CELL");
            updateAbsButtons(this, "CELL");
          }),
          "ABS_COL"
        )
        .appendField(
          new ClickableLabel("↕️☓", () => {
            const v = String(this.getFieldValue("CELL") ?? "");
            const next = toggleAbsCell(v, "row");
            this.setFieldValue(next, "CELL");
            updateAbsButtons(this, "CELL");
          }),
          "ABS_ROW"
        );

      this.setOutput(true, null);
      this.setColour(C_REF);

      this.setTooltip(t(STR.TOOLTIP_CELL));

      // 初期反映
      updateAbsButtons(this, "CELL");
    },
  };

  // ---- Range reference ----
  Blockly.Blocks["basic_range"] = {
    init: function () {
      const text = new Blockly.FieldTextInput("A1:B2", (newVal) => {
        queueMicrotask(() => updateAbsButtons(this, "RANGE"));
        return newVal;
      });

      this.appendDummyInput()
        .appendField(t(STR.RANGE))
        .appendField(text, "RANGE");

      this.appendDummyInput("ABS_CTRL")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new ClickableLabel("↔️☓", () => {
            const v = String(this.getFieldValue("RANGE") ?? "");
            const next = toggleAbsCell(v, "col");
            this.setFieldValue(next, "RANGE");
            updateAbsButtons(this, "RANGE");
          }),
          "ABS_COL"
        )
        .appendField(
          new ClickableLabel("↕️☓", () => {
            const v = String(this.getFieldValue("RANGE") ?? "");
            const next = toggleAbsCell(v, "row");
            this.setFieldValue(next, "RANGE");
            updateAbsButtons(this, "RANGE");
          }),
          "ABS_ROW"
        );

      this.setOutput(true, null);
      this.setColour(C_REF);

      this.setTooltip(t(STR.TOOLTIP_RANGE));

      updateAbsButtons(this, "RANGE");
    },
  };

  // ---- Arithmetic (+ - * /) ----
  Blockly.Blocks["basic_arith"] = {
    init: function () {
      this.appendValueInput("A").setCheck(null);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ["+", "+"],
          ["-", "-"],
          ["*", "*"],
          ["/", "/"],
          ["^", "^"], // ★ついでに（仕様にある）
          ["&", "&"], // ★これが本命
        ]),
        "OP"
      );
      this.appendValueInput("B").setCheck(null);

      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(C_OP);

      this.setTooltip(t(STR.TOOLTIP_ARITH));
    },
  };

  // ---- Compare (= <> < <= > >=) ----
  Blockly.Blocks["basic_cmp"] = {
    init: function () {
      this.appendValueInput("A").setCheck(null);
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ["=", "="],
          ["<>", "<>"],
          ["<", "<"],
          ["<=", "<="],
          [">", ">"],
          [">=", ">="],
        ]),
        "OP"
      );
      this.appendValueInput("B").setCheck(null);

      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(C_CMP);

      this.setTooltip(t(STR.TOOLTIP_CMP));
    },
  };

  // ---- Parentheses ----
  Blockly.Blocks["basic_paren"] = {
    init: function () {
      this.appendValueInput("INNER").setCheck(null).appendField("(");
      this.appendDummyInput().appendField(")");

      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(C_PAREN);

      this.setTooltip(t(STR.TOOLTIP_PAREN));
    },
  };
  // ---- RAW (unparsed) ----
  Blockly.Blocks["basic_raw"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("RAW")
        .appendField(new Blockly.FieldTextInput(""), "RAW");

      this.setOutput(true, null);
      this.setColour(C_RAW);

      this.setTooltip("未解析の塊（そのまま出力）");
    },
  };
  // ---- RAW CALL (unknown function, NO mutator) ----
  Blockly.Blocks["basic_raw_call"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("RAWFN")
        .appendField(new Blockly.FieldTextInput("FOOBAR"), "FN");

      // 最低1個は用意
      this.appendValueInput("ARG0").setCheck(null);

      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(C_RAW);

      this.setTooltip(
        "未登録関数（引数は接続できる。出力時はそのまま関数呼び出し）"
      );
    },
  };

  // ---- Boolean ----（要らんかったら消してOK）
  Blockly.Blocks["basic_bool"] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ["TRUE", "TRUE"],
          ["FALSE", "FALSE"],
        ]),
        "BOOL"
      );

      this.setOutput(true, null);
      this.setColour(C_BOOL);

      this.setTooltip("TRUE / FALSE");
    },
  };
}
