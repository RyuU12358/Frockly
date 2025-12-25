import { useRef } from "react";
import { RibbonButton } from "./RibbonButton";
import { RibbonSeparator } from "./RibbonSeparator";

type Props = {
  onImportXlsx?: (file: File) => void;
  onImportNamedFns?: (file: File) => void;
  onExportNamedFns?: () => void;
  sheets?: string[];
  activeSheet?: number;
  onChangeSheet?: (idx: number) => void;
};

export function FileTab({
  onImportXlsx,
  sheets,
  activeSheet,
  onChangeSheet,
  onImportNamedFns,
  onExportNamedFns,
}: Props) {
  const xlsxRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  return (
    <div className="py-1">
      {/* リボン本体：高さ固定（NamedFunctionsTabに合わせる） */}
      <div className="h-[36px] flex items-stretch px-2 overflow-hidden">
        {/* 左：インポート/シート */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
          {/* Import .xlsx */}
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
            title="Excel (.xlsx) を読み込む"
            className="shrink-0"
          >
            Import .xlsx
          </RibbonButton>

          {/* Sheet selector */}
          {sheets && sheets.length > 0 && (
            <select
              value={activeSheet ?? 0}
              onChange={(e) => onChangeSheet?.(Number(e.target.value))}
              className="h-[28px] px-2 text-sm rounded border bg-white shrink-0"
              title="シート切替"
            >
              {sheets.map((name, i) => (
                <option key={name + i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 区切り線（固定） */}
        <RibbonSeparator />

        {/* 右：NamedFns JSON */}
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
            title="名前付き関数 JSON を読み込む"
          >
            Import named functions
          </RibbonButton>

          <RibbonButton
            onClick={onExportNamedFns}
            disabled={!onExportNamedFns}
            title="名前付き関数 JSON を書き出す"
          >
            Export named functions
          </RibbonButton>
        </div>
      </div>
    </div>
  );
}
