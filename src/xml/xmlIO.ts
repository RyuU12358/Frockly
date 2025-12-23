// src/blockly/xml/xmlIO.ts
import * as Blockly from "blockly";

export function saveWorkspaceXml(ws: Blockly.WorkspaceSvg): string {
  const dom = Blockly.Xml.workspaceToDom(ws);
  return Blockly.utils.xml.domToText(dom);
}

export function loadWorkspaceXml(ws: Blockly.WorkspaceSvg, xmlText: string) {
  ws.clear();

  if (!xmlText) {
    ws.render();
    ws.resize();
    return;
  }

  const dom = Blockly.utils.xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(dom, ws);

  ws.render();
  ws.resize();
}
