import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { STR_ALL, tr } from '../i18n/strings';

interface FormulaDisplayProps {
  formula: string;
  uiLang?: "en" | "ja";
}

export function FormulaDisplay({ formula, uiLang = "en" }: FormulaDisplayProps) {
  const t = tr(uiLang);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (formula) {
      navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <h3 className="text-emerald-700">{t(STR_ALL.GENERATED_FORMULA)}</h3>
        <button
          onClick={handleCopy}
          disabled={!formula}
          className={`
            flex items-center gap-2 px-3 py-1 rounded text-sm
            ${formula 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            transition-colors
          `}
        >
              {copied ? (
            <>
              <Check className="w-4 h-4" />
                  {t(STR_ALL.COPY_DONE)}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
                  {t(STR_ALL.COPY)}
            </>
          )}
        </button>
      </div>

      {/* Formula Display */}
      <div className="flex-1 p-4">
        <div className="h-full bg-white border-2 border-gray-300 rounded-lg p-4 shadow-inner">
          {formula ? (
            <div className="flex items-center gap-3">
              <span className="text-emerald-600">fx</span>
              <code className="flex-1 bg-emerald-50 px-3 py-2 rounded border border-emerald-200 text-emerald-900">
                {formula}
              </code>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">
                  {t(STR_ALL.SELECT_BLOCK_PROMPT)}
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}