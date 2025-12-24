// components/ribbon/tabs/NamedFunctionsTab.tsx
import { useEffect, useMemo, useRef, useState } from "react";

import { RibbonButton } from "./RibbonButton";
import { RibbonSeparator } from "./RibbonSeparator";
import { WorkspaceManagerModal } from "../../namedFns/WorkspaceManagerModal";

export type NamedFnItem = {
  id: string;
  name: string;
  params: string[];
  workspaceId: string; // 関数WS
  description?: string; // ★追加
};

export type WorkspaceItem = {
  id: string;
  title: string;
  kind: "main" | "fn";
  fnId?: string;
};
type CreateFnResult = { fnId: string; wsId: string };

type Props = {
  search?: string;
  fns: NamedFnItem[];
  onInsertCurrentParam?: () => void;
  // 管理モーダル用
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (wsId: string) => void;
  onInsertCurrent: (fnId: string) => void;
  onCreateFn: () => CreateFnResult;
  onDuplicateFn: (fnId: string) => void;
  onDeleteFn: (fnId: string) => void;
  onRenameFn?: (fnId: string, newName: string) => void;
  onUpdateFnMeta?: (
    fnId: string,
    patch: { name?: string; description?: string }
  ) => void;
  onHoverNamed?: (key: string | null) => void; // "named:<id>"
  // ★メインへ自動切替して挿入（確定仕様）
  onInsertToMain: (fnId: string) => void;
};
function scoreNamed(fn: NamedFnItem, q: string) {
  const name = (fn.name ?? "").toLowerCase();
  const desc = (fn.description ?? "").toLowerCase();
  if (name === q) return 400;
  if (name.startsWith(q)) return 300;
  if (name.includes(q)) return 200;
  if (desc.includes(q)) return 100;
  return 0;
}

export function NamedFunctionsTab(props: Props) {
  const q = (props.search ?? "").trim().toLowerCase();
  const visibleFns = useMemo(() => {
    if (!q) return props.fns;

    return props.fns
      .map((fn) => ({ fn, s: scoreNamed(fn, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.fn.name.localeCompare(b.fn.name))
      .map((x) => x.fn);
  }, [props.fns, q]);
  const [open, setOpen] = useState(false);

  return (
    <div className="py-1">
      {/* リボン本体：高さ固定 */}
      <div className="h-[36px] flex items-stretch px-2 overflow-hidden">
        {/* 左：名前付き関数（横スクロールのみ） */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
          {visibleFns.map((fn) => (
            <RibbonButton
              key={fn.id}
              title={[
                `${fn.name}(${fn.params.join(", ")}) を現在のWSに挿入`,
                fn.description ? `\n${fn.description}` : "",
              ].join("")}
              onClick={() => props.onInsertCurrent(fn.id)}
              className="shrink-0"
              onMouseEnter={() => props.onHoverNamed?.(`named:${fn.id}`)}
              onMouseLeave={() => props.onHoverNamed?.(null)}
              onFocus={() => props.onHoverNamed?.(`named:${fn.id}`)}
              onBlur={() => props.onHoverNamed?.(null)}
            >
              <span className="max-w-[160px] truncate inline-block align-bottom">
                {fn.name}
              </span>
            </RibbonButton>
          ))}

          {visibleFns.length === 0 && (
            <div className="text-xs opacity-60 py-1">検索結果なし</div>
          )}
        </div>

        {/* 区切り線（固定） */}
        <RibbonSeparator />

        {/* 右端：管理ボタン固定 */}
        <div className="flex items-center gap-2">
          {props.onInsertCurrentParam && (
            <RibbonButton
              title="param ブロックを現在のWSに挿入"
              onClick={() => props.onInsertCurrentParam?.()}
            >
              ＋param
            </RibbonButton>
          )}
          <RibbonButton onClick={() => setOpen(true)}>管理…</RibbonButton>
        </div>
      </div>

      {open && (
        <WorkspaceManageModal
          workspaces={props.workspaces}
          activeWorkspaceId={props.activeWorkspaceId}
          fns={props.fns}
          onClose={() => setOpen(false)}
          onSwitchWorkspace={(wsId) => {
            props.onSwitchWorkspace(wsId);
          }}
          onCreateFn={() => props.onCreateFn()}
          onDuplicateFn={props.onDuplicateFn}
          onDeleteFn={props.onDeleteFn}
          onRenameFn={props.onRenameFn}
          onInsertToMain={(fnId) => {
            props.onInsertToMain(fnId);
            setOpen(false);
          }}
          onUpdateFnMeta={props.onUpdateFnMeta}
        />
      )}
    </div>
  );
}

function WorkspaceManageModal(props: {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  fns: NamedFnItem[];
  onClose: () => void;
  onSwitchWorkspace: (wsId: string) => void;
  onCreateFn: () => CreateFnResult;
  onDuplicateFn: (fnId: string) => void;
  onDeleteFn: (fnId: string) => void;
  onRenameFn?: (fnId: string, newName: string) => void;
  onInsertToMain: (fnId: string) => void;
  onUpdateFnMeta?: (
    fnId: string,
    patch: { name?: string; description?: string }
  ) => void;
}) {
  const main = props.workspaces.find((w) => w.kind === "main");
  const fnWorkspaces = props.workspaces.filter((w) => w.kind === "fn");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.onClose]);

  const fnByWsId = useMemo(() => {
    const m = new Map<string, NamedFnItem>();
    for (const f of props.fns) m.set(f.workspaceId, f);
    return m;
  }, [props.fns]);

  const pendingOpenFnIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fnId = pendingOpenFnIdRef.current;
    if (!fnId) return;

    const ws = fnWorkspaces.find((w) => w.fnId === fnId);
    if (!ws) return;

    props.onSwitchWorkspace(ws.id);
    pendingOpenFnIdRef.current = null;
  }, [fnWorkspaces, props.activeWorkspaceId, props.onSwitchWorkspace]);

  return (
    <WorkspaceManagerModal
      onClose={props.onClose}
      main={main ? { id: main.id, title: main.title, fnId: main.fnId } : null}
      fnWorkspaces={fnWorkspaces.map((w) => ({
        id: w.id,
        title: w.title,
        fnId: w.fnId,
      }))}
      activeWorkspaceId={props.activeWorkspaceId}
      fnByWsId={fnByWsId as any} // ←ここは下でちゃんと型を合わせる案も出す
      onSwitchWorkspace={props.onSwitchWorkspace}
      onInsertToMain={props.onInsertToMain}
      onDuplicateFn={props.onDuplicateFn}
      onDeleteFn={props.onDeleteFn}
      onCreateFn={props.onCreateFn}
      onUpdateFnMeta={props.onUpdateFnMeta}
      onRenameFn={props.onRenameFn}
    />
  );
}
