// src/blocks/frockly_generators.ts
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// IF
javascriptGenerator.forBlock["frockly_if"] = function (block: Blockly.Block) {
  const cond = javascriptGenerator.valueToCode(block, "COND", 0) || "";
  const t    = javascriptGenerator.valueToCode(block, "TRUE", 0) || "";
  const f    = javascriptGenerator.valueToCode(block, "FALSE", 0) || "";
  return [`IF(${cond}, ${t}, ${f})`, 0];
};

// SUM
javascriptGenerator.forBlock["frockly_sum"] = function (block: Blockly.Block) {
  const r = javascriptGenerator.valueToCode(block, "RANGE", 0) || "";
  return [`SUM(${r})`, 0];
};

// AVERAGE
javascriptGenerator.forBlock["frockly_average"] = function (block: Blockly.Block) {
  const r = javascriptGenerator.valueToCode(block, "RANGE", 0) || "";
  return [`AVERAGE(${r})`, 0];
};

// 四則演算
javascriptGenerator.forBlock["frockly_arith"] = function (block: Blockly.Block) {
  const a  = javascriptGenerator.valueToCode(block, "A", 0) || "";
  const b  = javascriptGenerator.valueToCode(block, "B", 0) || "";
  const op = block.getFieldValue("OP");
  return [`(${a} ${op} ${b})`, 0];
};

// 比較
javascriptGenerator.forBlock["frockly_compare"] = function (block: Blockly.Block) {
  const a  = javascriptGenerator.valueToCode(block, "A", 0) || "";
  const b  = javascriptGenerator.valueToCode(block, "B", 0) || "";
  const op = block.getFieldValue("OP");
  return [`(${a} ${op} ${b})`, 0];
};

// 数値
javascriptGenerator.forBlock["frockly_number"] = function (block: Blockly.Block) {
  return [block.getFieldValue("NUM"), 0];
};

// セル参照
javascriptGenerator.forBlock["frockly_ref"] = function (block: Blockly.Block) {
  return [block.getFieldValue("REF"), 0];
};
