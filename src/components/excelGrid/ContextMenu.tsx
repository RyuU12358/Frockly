import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { MenuAction } from "./contextMenuActions";

export function ContextMenu(props: {
  open: boolean;
  x: number;
  y: number;
  actions: MenuAction[];
  onClose: () => void;
  onAction: (id: MenuAction["id"]) => void;
}) {
  const { open, x, y, actions, onClose, onAction } = props;
  const menuRef = useRef<HTMLDivElement>(null);

  // 位置補正
  const pos = useMemo(() => {
    const w = 220;
    const h = Math.min(360, actions.length * 34 + 16);
    const vx = Math.min(x, window.innerWidth - w - 8);
    const vy = Math.min(y, window.innerHeight - h - 8);
    return { left: Math.max(8, vx), top: Math.max(8, vy), width: w };
  }, [x, y, actions.length]);

  useEffect(() => {
    if (!open) return;

    // 「開いた直後のイベント」で閉じるのを防ぐ
    let armed = false;
    const t = window.setTimeout(() => (armed = true), 0);

    const onPointerDown = (e: PointerEvent) => {
      if (!armed) return;
      const el = menuRef.current;
      if (el && el.contains(e.target as Node)) return;
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("pointerdown", onPointerDown, true); // capture
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
<div
  ref={menuRef}
  style={{
    position: "fixed",
    left: pos.left,
    top: pos.top,
    width: 260,
    minHeight: 120,
    zIndex: 99999,
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    padding: 8,
  }}
>


      {actions.map((a) => {
        const enabled = (a as any).enabled !== false;
        return (
          <button
            key={a.id}
            disabled={!enabled}
            onClick={() => {
              if (!enabled) return;
              onAction(a.id);
              onClose();
            }}
            className={[
              "w-full text-left px-3 py-2 text-sm",
              enabled ? "hover:bg-gray-100" : "text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            {a.label}
          </button>
        );
      })}
    </div>,
    document.body
  );
}
