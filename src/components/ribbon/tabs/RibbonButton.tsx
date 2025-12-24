import React from "react";

type RibbonButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export function RibbonButton({
  className = "",
  children,
  ...rest
}: RibbonButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={[
        // Excel寄り：角なし・影なし・薄エメラルド（必要ならここ調整）
        "border px-3 py-1 text-xs leading-none whitespace-nowrap",
        "border-emerald-300 bg-emerald-50 text-emerald-800",
        "hover:bg-emerald-100",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
