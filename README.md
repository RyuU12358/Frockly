# Frockly (v0.5)

Frockly is a visual editor for understanding and refactoring complex Excel formulas.

Instead of reading long, deeply nested formulas as plain text,  
Frockly represents formulas as **blocks**, making their structure explicit and easier to inspect.

Frockly is **not an Excel replacement**.  
It focuses on helping you **read, analyze, and reason about formulas** before bringing them back into Excel.

---

## Demo

🔗 https://ryuu12358.github.io/Frockly/

- Desktop and mobile layouts are supported  
- Desktop is recommended for large formulas  
- Mobile view is optimized for inspection and navigation

---

## What Frockly does

- Build Excel formulas by assembling blocks
- Convert existing Excel formulas into block structures
- Inspect complex formulas using structural views  
  (collapse, focus, root)
- Define and reuse named formulas
- Import data and formulas from `.xlsx` files (experimental)
- Copy completed formulas back into Excel or spreadsheet tools

---

## What Frockly does NOT do

- Edit cell values
- Recalculate formulas
- Save or modify Excel files

Frockly is designed for **understanding and refactoring**, not execution.

---

## Example

### Same formula, different levels of visibility

Below is the same Excel formula shown in different representations.

#### 1. Original block structure (hard to inspect)
Deep nesting makes the logic difficult to follow at a glance.

![Nested blocks](Blocks.jpg)

#### 2. Structured view
Conditions are visually separated, making decision paths explicit.

![Structured blocks](Blocks.jpg)

#### 3. Focused / collapsed view
Irrelevant branches can be collapsed to focus on what matters.

![Collapsed view](Collapsed_And_Forcused.jpg)

#### 4. Original formula text
All structure is hidden in a single line.

```excel
=IFERROR(IF(D2=0,"",IF(D2>=80,"A",IF(D2>=60,"B","C"))),"")
```

---

## Why Frockly?

Excel formulas are often hard to understand not because they are complex,  
but because their **structure is hidden inside a single line of text**.

As formulas grow, we end up mentally reconstructing their structure every time we read them.

Frockly externalizes that structure,  
so you can **see how a formula is built**, instead of re-deriving it in your head.

---

## Status

Current version: **v0.5**

Most core ideas are implemented.  
The project is still experimental, but usable for real inspection and refactoring workflows.

---

## Updates

- **2025-12-25** – v0.5  
  File tab, `.xlsx` import, named function import/export
- **2025-12-22** – View tab for formula structure visualization
- **2025-12-20** – Function description panel
- **2025-12-19** – Formula → block conversion
- **2025-12-17** – Initial public release

---

## Roadmap (rough)

### Structural assistance
- Check tab (structural diagnostics, LET refactoring hints)

### Usability
- Improved named function navigation
- Further mobile interaction refinements

### Internationalization
- i18n infrastructure (UI strings, function descriptions)
- Multilingual function search
- Community-driven translations (planned)

---

## Notes

Frockly explores a different way of interacting with formulas.

It does not aim to automate thinking or generate logic for you,  
but to make **existing logic visible and easier to reason about**.
