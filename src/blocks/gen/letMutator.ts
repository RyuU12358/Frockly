import * as Blockly from "blockly";

type LetBlock = Blockly.Block & { __pairs?: number };

let letMutatorRegistered = false;

export function registerLetDynpairsMutator() {
  if (letMutatorRegistered) return;
  letMutatorRegistered = true;

  Blockly.Extensions.registerMutator(
    "frockly_let_dynpairs",
    {
      mutationToDom(this: LetBlock) {
        const el = Blockly.utils.xml.createElement("mutation");
        el.setAttribute("pairs", String(this.__pairs ?? 1));
        return el;
      },
      domToMutation(this: LetBlock, xml: Element) {
        this.__pairs = Math.max(1, Number(xml.getAttribute("pairs") || 1));
        updateShape(this);
      },
    },
    function (this: LetBlock) {
      this.__pairs = 1;
      updateShape(this);
    }
  );
}

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

function ensureHeader(block: LetBlock) {
  if (!block.getInput("FN_HEADER")) {
    block.appendDummyInput("FN_HEADER").appendField("LET");
  }
  return block.getInput("FN_HEADER")!;
}

function updateHeaderUI(block: LetBlock) {

  const header = ensureHeader(block);

  if (block.getField("LET_MINUS")) return;

  header.appendField(
    new ClickableLabel("−", () => changePairs(block, -1)),
    "LET_MINUS"
  );
  header.appendField(
    new Blockly.FieldLabelSerializable(String(block.__pairs ?? 1)),
    "LET_COUNT"
  );
  header.appendField(
    new ClickableLabel("+", () => changePairs(block, +1)),
    "LET_PLUS"
  );
}

function updateCountLabel(block: LetBlock) {
  const f = block.getField(
    "LET_COUNT"
  ) as Blockly.FieldLabelSerializable | null;
  f?.setValue(String(block.__pairs ?? 1));
}

function changePairs(block: LetBlock, delta: number) {
  const cur = block.__pairs ?? 1;
  const next = Math.max(1, cur + delta);
  if (next === cur) return;

  Blockly.Events.setGroup(true);
  block.__pairs = next;
  updateShape(block);
  updateCountLabel(block);
  (block as any).render?.();
  Blockly.Events.setGroup(false);
}

function updateShape(block: LetBlock) {
  updateHeaderUI(block);

  // 既存ペア削除
  let i = 0;
  while (block.getInput(`VAR${i}`)) {
    block.removeInput(`VAR${i}`);
    block.removeInput(`VAL${i}`);
    i++;
  }

  const pairs = block.__pairs ?? 1;

  for (let i = 0; i < pairs; i++) {
    block.appendValueInput(`VAR${i}`).setCheck("VAR");
    block.appendValueInput(`VAL${i}`);
  }

  // RESULT
  if (block.getInput("RESULT")) {
    const conn = block.getInput("RESULT")!.connection?.targetConnection;
    block.removeInput("RESULT");
    const r = block.appendValueInput("RESULT");
    if (conn) r.connection?.connect(conn);
  } else {
    block.appendValueInput("RESULT");
  }

  // ★初回描画でも確実に出す
  (block as any).render?.();
}
