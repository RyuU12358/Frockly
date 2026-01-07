# How to Add a New Language

This guide explains how to add a new UI language (e.g., French `fr`) to Frockly.

## 1. UI Translations

1.  Create **`src/i18n/locales/fr.ts`**.
    - Copy content from `src/i18n/locales/en.ts`.
    - Translate the string values.
2.  Update **`src/i18n/strings.ts`**:
    - Add `"fr"` to the `UiLang` type definition:
      ```typescript
      export type UiLang = "en" | "ja" | "fr";
      ```
    - Import `FR` from `./locales/fr`.
    - Merge it in the `export const STR_...` sections:
      ```typescript
      export const STR_COMMON = merge(
        EN.STR_COMMON,
        JA.STR_COMMON,
        FR.STR_COMMON
      );
      // ... repeat for all sections
      ```
      _(Note: You may need to update the `merge` function to accept 3 arguments or chain them)._

## 2. Metadata (Function Descriptions & Names)

1.  Create directory **`public/meta/fr/`**.
2.  Create **`public/meta/fr/fn_names.json`**:
    - Map English function names to localized names.
    - Example: `{"SUM": "SOMME", "AVERAGE": "MOYENNE"}`.
3.  Create **`public/meta/fr/fn_text_fr.txt`**:
    - Copy format from `public/meta/en/fn_text_en.txt`.
    - Translate descriptions.

## 3. Code Updates

### Function Text Loader

- Update **`src/blocks/gen/fnTextLoader.ts`**:
  - Update `loadFnText` to handle the new language path:
    ```typescript
    const path = lang === "en" ? ... : lang === "ja" ? ... : `${base}meta/fr/fn_text_fr.txt`;
    ```

### Formula Localizer (Separators)

- Update **`src/blocks/formula/localizer.ts`**:
  - Update `getSeparator(lang)` if the new language uses a different list separator (e.g., `;` for French/German).
    ```typescript
    if (lang === "fr") return ";";
    ```

### UI Selection

- Update **`src/components/ribbon/ExcelRibbon.tsx`**:
  - Add the option to the language selector:
    ```tsx
    <option value="fr">FR</option>
    ```

## 4. Verify

- Reload the app.
- Select "FR" from the dropdown.
- Verify UI strings are translated.
- Verify function names in the palette and on blocks are localized (e.g., `SOMME`).
- Verify generated formulas use the correct separator (e.g., `;`).
