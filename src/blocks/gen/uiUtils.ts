import * as Blockly from "blockly";

export class ClickableLabel extends Blockly.FieldLabelSerializable {
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

export function setFieldVisible(
  block: Blockly.Block,
  name: string,
  visible: boolean
) {
  const f: any = block.getField(name);
  const svg = f?.getSvgRoot?.();
  if (svg) svg.style.display = visible ? "" : "none";
}

export function ensureHeaderInput(
  block: Blockly.Block,
  inputName = "FN_HEADER",
  labelText?: string
) {
  if (!block.getInput(inputName)) {
    const input = block.appendDummyInput(inputName);
    if (labelText) input.appendField(labelText);
  }
  return block.getInput(inputName)!;
}
