import { useState } from "react";
import { ExcelRibbon } from "./components/ExcelRibbon";
import { ExcelGrid } from "./components/excelGrid/ExcelGrid";
import { BlocklyWorkspace } from "./components/BlocklyWorkspace";
import { FormulaDisplay } from "./components/FormulaDisplay";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("math");
  const [uiLang, setUiLang] = useState<"en" | "ja">("en"); // ★追加

  const [formula, setFormula] = useState("");
  const [selectedCell, setSelectedCell] = useState("A1");

  type WorkspaceApi = {
    insertBlock: (t: string) => void;
    insertRefBlock: (refText: string) => void;
    insertFromFormula: (formulaText: string) => void; // ★追加
    hideChaff?: () => void; // 余裕あれば
  };

  const [workspaceApi, setWorkspaceApi] = useState<WorkspaceApi | null>(null);

  const [leftWidth, setLeftWidth] = useState(700);

  const startDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = startWidth + diff;
      if (newWidth > 200 && newWidth < 900) setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ExcelRibbon
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onBlockClick={(blockType) => workspaceApi?.insertBlock(blockType)}
        uiLang={uiLang}
        onUiLangChange={setUiLang}
        onWorkspaceApi={workspaceApi} // ★ここは state を渡す
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          style={{ width: leftWidth }}
          className="border-r border-gray-300 bg-white"
        >
          <ExcelGrid
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
            onAddRefBlock={(refText) => workspaceApi?.insertRefBlock(refText)}
            uiLang={uiLang}
          />
        </div>

        <div
          onMouseDown={startDrag}
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-300"
        />

        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 border-b border-gray-300">
            <BlocklyWorkspace
              category={selectedCategory}
              onFormulaChange={setFormula}
              selectedCell={selectedCell}
              onWorkspaceApi={setWorkspaceApi} // ★ref代入じゃなく setState
              uiLang={uiLang}
            />
          </div>

          <div className="h-32 border-t border-gray-300">
            <FormulaDisplay formula={formula} uiLang={uiLang} />
          </div>
        </div>
      </div>
    </div>
  );
}
