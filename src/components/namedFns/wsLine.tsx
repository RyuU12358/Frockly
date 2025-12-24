import React from "react";

export function WsLine(props: {
  selected: boolean;
  active: boolean;
  title: string;
  subtitle: string;

  onClick: () => void;

  onOpen: (() => void) | null;
  onInsert: (() => void) | null;
  onEdit: (() => void) | null;
  onDuplicate: (() => void) | null;
  onDelete: (() => void) | null;
}) {
  const border = props.selected ? "border-slate-500" : "border-slate-200";
  const bg = props.selected ? "bg-slate-50" : "bg-white";
  const activeMark = props.active ? "●" : " ";

  return (
    <div
      className={`flex items-center gap-2 border ${border} ${bg} px-2 py-2`}
      onClick={props.onClick}
    >
      <div
        className="w-[12px] text-[10px] text-slate-500"
        title="開いているワークスペース"
      >
        {activeMark}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">
          {props.title}
        </div>
        {props.subtitle ? (
          <div className="truncate text-[11px] text-slate-500">
            {props.subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MiniBtn disabled={!props.onOpen} onClick={props.onOpen} title="開く">
          開く
        </MiniBtn>
        <MiniBtn
          disabled={!props.onInsert}
          onClick={props.onInsert}
          title="メインに挿入"
        >
          挿入
        </MiniBtn>
        <MiniBtn disabled={!props.onEdit} onClick={props.onEdit} title="編集">
          編集
        </MiniBtn>
        <MiniBtn
          disabled={!props.onDuplicate}
          onClick={props.onDuplicate}
          title="複製"
        >
          複製
        </MiniBtn>
        <MiniBtn
          disabled={!props.onDelete}
          onClick={props.onDelete}
          title="削除"
        >
          削除
        </MiniBtn>
      </div>
    </div>
  );
}

function MiniBtn(props: {
  disabled?: boolean;
  onClick: (() => void) | null | undefined;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      className="h-[24px] border border-slate-300 bg-white px-2 text-[11px] hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
      disabled={props.disabled || !props.onClick}
      title={props.title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // 行クリック（選択）と分離
        props.onClick?.();
      }}
    >
      {props.children}
    </button>
  );
}
