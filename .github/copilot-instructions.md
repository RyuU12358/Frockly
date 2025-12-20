# Frockly: AI Coding Agent Instructions

## Project Overview

**Frockly** is a visual programming environment that converts Blockly diagrams into Excel-like formulas. It's a Vite-based TypeScript + Blockly application featuring a split-pane UI with draggable splitters.

**Core Goal:** Enable non-programmers to create spreadsheet formulas using visual block composition.

## Architecture

### Major Components

1. **Blockly Integration** (`src/blocks/`)
   - `frockly_blocks.ts`: Defines custom Blockly block types (IF, SUM, AVERAGE, arithmetic, comparison, number, cell reference)
   - `frockly_generators.ts`: Implements code generators that convert each block type into Excel formula syntax (e.g., `IF(condition, true, false)`)

2. **UI Layout** (`src/main.ts`)
   - 3-pane layout: Left (cell grid input), Right-top (block canvas), Right-bottom (formula output)
   - Dynamic resizing via draggable vertical/horizontal splitters
   - Flex-based layout with percentage-based sizing constraints (15–70% horizontal, 30–85% vertical)

3. **Styling** (`src/style.css`)
   - Full-viewport single-page application (100vh height)
   - CSS Grid/Flexbox for splitter layout

### Data Flow

```
User arranges blocks in Blockly canvas 
  → Clicks "式を生成" (Generate Formula) button
  → javascriptGenerator.workspaceToCode() processes block tree
  → Custom generators in frockly_generators.ts output Excel formula
  → Result prefixed with "=" and displayed in formula-output textarea
```

## Key Patterns & Conventions

### Block Definition Pattern
All blocks use `Blockly.defineBlocksWithJsonArray()` with JSON shape:
```typescript
{
  "type": "frockly_<functionName>",  // Prefix blocks with "frockly_"
  "message0": "LABEL %1 LABEL %2",   // UI text with %N placeholders for inputs
  "args0": [{ "type": "input_value", "name": "ARGNAME" }, ...],
  "output": null,  // null = no return value; precedence number for expression blocks
  "colour": <hue>  // 0–360 HSV hue
}
```

### Generator Pattern
For each block type, register in `frockly_generators.ts`:
```typescript
javascriptGenerator.forBlock["frockly_blockname"] = function(block) {
  const arg1 = javascriptGenerator.valueToCode(block, "ARGNAME", 0) || "";
  return [`FORMULA_FUNCTION(${arg1})`, 0];  // [code, precedence]
};
```
The returned formula string becomes part of the Excel expression.

### Layout & Splitter Logic
- Splitters are passive divs with `splitter-vert` / `splitter-horz` classes
- Dragging updates global `leftWidthPercent` and `topHeightPercent` variables
- `applySplitSizes()` syncs flex basis percentages and triggers `updateBlocklySize()`
- **Important:** Always call `updateBlocklySize()` after layout changes; Blockly doesn't auto-resize

## Build & Development

- **Framework:** Vite + TypeScript 5.9
- **Package Manager:** npm
- **Key Scripts:**
  - `npm run dev`: Start dev server (hot reload)
  - `npm run build`: Compile TypeScript, then bundle with Vite
  - `npm run preview`: Preview production build locally
- **Main Dependency:** blockly@^12.3.1

## Common Tasks

### Adding a New Function Block
1. Add block definition to `src/blocks/frockly_blocks.ts` using the JSON pattern above
2. Register generator in `src/blocks/frockly_generators.ts` to output the Excel formula
3. Test via dev server: arrange blocks, click "式を生成", verify formula output

### Debugging Layout Issues
- Check `updateBlocklySize()` is called after DOM changes
- Verify `applySplitSizes()` updates both `pane` flex basis AND calls `updateBlocklySize()`
- Use browser DevTools to inspect computed flex basis percentages

### Customizing Colors
Block hue values in `frockly_blocks.ts`:
- 0 (red): Comparison operators
- 120 (green): Aggregation (SUM, AVERAGE)
- 160 (cyan): Control flow (IF)
- 200 (blue): Arithmetic

## Important Notes

- **No Toolbar:** The workspace is injected with `toolbox: null`, so blocks must be programmatically added or the UI needs a custom block picker (currently placeholder "リボン" UI)
- **Placeholder Implementations:** Cell grid input and Excel ribbon are WIP; only block canvas and formula generation are functional
- **Formula Output Uses JavaScript Generator:** Currently outputs JavaScript-like syntax with Excel function names; a dedicated Excel formula generator should replace this for proper syntax compliance
- **No Persistence:** Blocks are not saved; refresh clears the workspace

## Testing Approach
No test suite yet. Manual testing workflow:
1. Run `npm run dev`
2. Build blocks in canvas
3. Click "式を生成" and inspect textarea output for expected formula structure
