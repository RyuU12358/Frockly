// src/blocks/gen/mutatorFactory.ts
import * as Blockly from "blockly";
import { getFnSpec } from "./registry";
import { ensureArgs } from "./ensureArgs";

const MUT_NAME = "frockly_fn_dynargs";

type DynBlock = Blockly.Block & { __argc?: number };

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

function specFromBlock(block: Blockly.Block) {
  const name = block.type.replace(/^frockly_/, "");
  return getFnSpec(name) ?? { name, min: 1, variadic: false, max: 0, step: 1 };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function minOf(spec: any) { return Math.max(0, Number(spec?.min ?? 0)); }
function maxOf(spec: any) {
  const m = Number(spec?.max ?? 0);
  return m > 0 ? m : 50; // unlimitedは適当上限
}
function stepOf(spec: any) {
  const s = Number(spec?.step ?? 1);
  return Number.isFinite(s) && s > 0 ? s : 1;
}

function ensureCtrlRow(block: DynBlock, spec: any) {
  if (!spec.variadic) {
    if (block.getInput("DYNCTRL")) block.removeInput("DYNCTRL", true);
    return;
  }
  if (block.getInput("DYNCTRL")) return;

  const row = block.appendDummyInput("DYNCTRL");
  row.setAlign(Blockly.inputs.Align.RIGHT);

  // 余計なスペースは極力入れない（幅を増やさない）
  row.appendField(new ClickableLabel("−", () => bump(block, spec, -1)), "BTN_MINUS");
  row.appendField(new Blockly.FieldLabelSerializable(""), "ARGC_LABEL");
  row.appendField(new ClickableLabel("+", () => bump(block, spec, +1)), "BTN_PLUS");
}

function updateLabel(block: DynBlock, spec: any) {
  if (!spec.variadic) return;
  const min = minOf(spec);
  const cur = block.__argc ?? min;
  const f = block.getField("ARGC_LABEL") as Blockly.FieldLabelSerializable | null;
  f?.setValue(String(cur));
}

function bump(block: DynBlock, spec: any, dir: -1 | 1) {
  const min = minOf(spec);
  const max = maxOf(spec);
  const step = stepOf(spec);

  const cur = block.__argc ?? min;
  const next = clamp(cur + dir * step, min, max);
  if (next === cur) return;

  Blockly.Events.setGroup(true);
  block.__argc = next;
  ensureArgs(block, next, spec);
  updateLabel(block, spec);
  (block as any).render?.();
  Blockly.Events.setGroup(false);
}

function applyShape(block: DynBlock, spec: any, argc: number) {
  const min = minOf(spec);
  const max = maxOf(spec);

  let a = argc;
  if (!spec.variadic) a = min;
  else a = clamp(a, min, max);

  block.__argc = a;

  ensureCtrlRow(block, spec);     // variadicだけ右寄せ行を作る
  ensureArgs(block, a, spec);     // 入力を揃える（※カンマ表示は ensureArgs 側で消す）
  updateLabel(block, spec);

  (block as any).render?.();
}

export function registerFnDynargsMutator() {
  const extAny = Blockly.Extensions as any;
  if (extAny?.mutators_?.[MUT_NAME]) return;
  if (extAny?.extensions_?.[MUT_NAME]) return;

  try {
    Blockly.Extensions.registerMutator(
      MUT_NAME,
      {
        saveExtraState(this: DynBlock) {
          const spec = specFromBlock(this);
          const min = minOf(spec);
          return { argc: this.__argc ?? min };
        },
        loadExtraState(this: DynBlock, state: any) {
          const spec = specFromBlock(this);
          const min = minOf(spec);
          const argc = Number.isFinite(Number(state?.argc)) ? Number(state.argc) : min;
          applyShape(this, spec, argc);
        },
      },
      function (this: DynBlock) {
        const spec = specFromBlock(this);
        applyShape(this, spec, minOf(spec));
      }
    );
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes("already registered")) return;
    throw e;
  }
}
