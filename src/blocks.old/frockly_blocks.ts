import * as Blockly from "blockly";

// 四則演算
Blockly.defineBlocksWithJsonArray([
  {
    "type": "frockly_arith",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "input_value", "name": "A" },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "+"],
          ["-", "-"],
          ["×", "*"],
          ["÷", "/"]
        ]
      },
      { "type": "input_value", "name": "B" }
    ],
    "output": null,
    "colour": 200
  }
]);

// 比較
Blockly.defineBlocksWithJsonArray([
  {
    "type": "frockly_compare",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "input_value", "name": "A" },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["=", "="],
          ["<>", "<>"],
          [">", ">"],
          ["<", "<"],
          [">=", ">="],
          ["<=", "<="]
        ]
      },
      { "type": "input_value", "name": "B" }
    ],
    "output": null,
    "colour": 0
  }
]);

// 数字
Blockly.defineBlocksWithJsonArray([
  {
    "type": "frockly_number",
    "message0": "数値 %1",
    "args0": [
      { "type": "field_number", "name": "NUM", "value": 0 }
    ],
    "output": null,
    "colour": 65
  }
]);

// セル参照
Blockly.defineBlocksWithJsonArray([
  {
    "type": "frockly_ref",
    "message0": "セル %1",
    "args0": [
      {
        "type": "field_input",
        "name": "REF",
        "text": "A1"
      }
    ],
    "output": null,
    "colour": 20
  }
]);
Blockly.defineBlocksWithJsonArray([
  {
    "type": "frockly_frog_smash",
    "message0": "カエル %1",
    "args0": [
      {
        "type": "field_input",
        "name": "REF",
        "text": "SMASH"
      }
    ],
    "colour": 20
  }
]);