# How to Add a New Function

This guide explains how to add support for a new Excel function in Frockly.

## 1. Register the Function

Add the function definition to `src/blocks/data/fn_list.txt`.
The format is:
`(NAME, MIN_ARGS, IS_VARIADIC, STEP, MAX_ARGS)`

- **NAME**: The canonical English name of the function (e.g., `SUM`).
- **MIN_ARGS**: Minimum number of arguments required.
- **IS_VARIADIC**: `1` if the function accepts variable number of arguments, `0` otherwise.
- **STEP** (variadic only): Number of arguments added per step (usually `1`).
- **MAX_ARGS** (variadic only): Maximum args (`0` for unlimited).

**Example:**

```
(NEWFUNC,2,1,1,0)
```

_Assuming `NEWFUNC` takes at least 2 arguments, is variadic, adds 1 arg at a time, and has no limit._

## 2. Add Description (Optional)

To show a tooltip description, add semantic metadata.

### English

Edit `public/meta/en/fn_text_en.txt`:

```
(NEWFUNC,"category","Description of what this function does.")
```

### Japanese (or other languages)

Edit `public/meta/jp/fn_text_jp.txt`:

```
(NEWFUNC,"カテゴリ","この関数の説明文。")
```

## 3. Add Localized Name (Optional)

If the function has a different name in other languages (e.g., `SUM` is `SOMME` in French), add it to the JSON map.

Create or edit `public/meta/{lang}/fn_names.json`:

```json
{
  "NEWFUNC": "NOUVEAUFUNC"
}
```

## 4. Search & Embeddings (Advanced)

The search functionality uses pre-computed embeddings located in `public/embed/ml/`.
Adding a function _without_ updating embeddings means it will:

- Be searchable by its **exact name** (e.g., "NEWFUNC").
- **NOT** be searchable by semantic meaning (e.g., "add numbers" won't find `SUM` if `SUM` isn't in the embedding).

To fully support semantic search for new functions, the embedding vectors (`fn_embed.f32`) and metadata (`fn_embed.meta.json`) need to be regenerated using the embedding script (not currently included in this client-side repo).
