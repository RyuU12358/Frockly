// components/workspaceSwitcher/WsFlyoutUI.ts
import * as Blockly from "blockly";

export function xmlLabel(text: string): Element {
  const label = Blockly.utils.xml.createElement("label");
  label.setAttribute("text", text);
  return label;
}

export function xmlSep(gap = 8): Element {
  const sep = Blockly.utils.xml.createElement("sep");
  sep.setAttribute("gap", String(gap));
  return sep;
}

export function xmlButton(text: string, callbackKey: string): Element {
  const btn = Blockly.utils.xml.createElement("button");
  btn.setAttribute("text", text);
  btn.setAttribute("callbackKey", callbackKey);
  return btn;
}

/** flyout に置く「項目ボタン」風のlabel（クリック処理は button でやるのが安全） */
export function xmlTextLine(text: string): Element {
  const l = Blockly.utils.xml.createElement("label");
  l.setAttribute("text", text);
  return l;
}
