import { useRef } from "react";

type Props = {
  onImportXlsx?: (file: File) => void;

  sheets?: string[];
  activeSheet?: number;
  onChangeSheet?: (idx: number) => void;
};

export function FileTab({
  onImportXlsx,
  sheets,
  activeSheet,
  onChangeSheet,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = () => fileRef.current?.click();

  const onPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onImportXlsx?.(f);
    e.currentTarget.value = "";
  };

  return (
    <div className="flex items-center gap-4 px-3 py-2">
      {/* Import */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx"
        onChange={onPicked}
        className="hidden"
      />

      <button
        onClick={pickFile}
        className="px-3 py-1 border border-gray-300 bg-white"
      >
        Import .xlsx
      </button>

      {/* Sheet selector */}
      {sheets && sheets.length > 0 && (
        <select
          value={activeSheet ?? 0}
          onChange={(e) => onChangeSheet?.(Number(e.target.value))}
          className="border border-gray-300 px-2 py-1"
        >
          {sheets.map((name, i) => (
            <option key={name + i} value={i}>
              {name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
