// components/ribbon/tabs/FileTab.tsx
import { useMemo, useRef } from "react";
import { RibbonButton } from "./RibbonButton";
import { RibbonSeparator } from "./RibbonSeparator";
import { tr } from "../../../i18n/strings"; // パス調整して
import type { UiLang } from "../../../i18n/strings";

type Props = {
  uiLang?: UiLang; // ★追加：i18nのため
  onImportXlsx?: (file: File) => void;
  onImportNamedFns?: (file: File) => void;
  onExportNamedFns?: () => void;
  sheets?: string[];
  activeSheet?: number;
  onChangeSheet?: (idx: number) => void;
};

export function FileTab({
  uiLang = "en",
  onImportXlsx,
  sheets,
  activeSheet,
  onChangeSheet,
  onImportNamedFns,
  onExportNamedFns,
}: Props) {
  const t = useMemo(() => tr(uiLang), [uiLang]);

  const xlsxRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  return (
    <div className="py-1">
      <div className="h-[36px] flex items-stretch px-2 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
          <input
            ref={xlsxRef}
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              onImportXlsx?.(f);
              e.currentTarget.value = "";
            }}
            className="hidden"
          />
          <RibbonButton
            onClick={() => xlsxRef.current?.click()}
            title={t("TOOLTIP_IMPORT_XLSX")}
            className="shrink-0"
          >
            {t("IMPORT_XLSX")}
          </RibbonButton>

          {sheets && sheets.length > 0 && (
            <select
              value={activeSheet ?? 0}
              onChange={(e) => onChangeSheet?.(Number(e.target.value))}
              className="h-[28px] px-2 text-sm rounded border bg-white shrink-0"
              title={t("TOOLTIP_SHEET_SWITCH")}
            >
              {sheets.map((name, i) => (
                <option key={name + i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        <RibbonSeparator />

        <div className="flex items-center gap-2">
          <input
            ref={jsonRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              onImportNamedFns?.(f);
              e.currentTarget.value = "";
            }}
          />

          <RibbonButton
            onClick={() => jsonRef.current?.click()}
            disabled={!onImportNamedFns}
            title={t("TOOLTIP_IMPORT_NAMED_FNS")}
          >
            {t("IMPORT_NAMED_FNS")}
          </RibbonButton>

          <RibbonButton
            onClick={onExportNamedFns}
            disabled={!onExportNamedFns}
            title={t("TOOLTIP_EXPORT_NAMED_FNS")}
          >
            {t("EXPORT_NAMED_FNS")}
          </RibbonButton>
        </div>
      </div>
    </div>
  );
}
