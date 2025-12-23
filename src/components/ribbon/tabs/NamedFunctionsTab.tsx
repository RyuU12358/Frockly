// components/ribbon/tabs/NamedFunctionsTab.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createNamedFunction } from "../../../state/project/workspaceOps";

export type NamedFnItem = {
  id: string;
  name: string;
  params: string[];
  workspaceId: string; // 関数WS
};

export type WorkspaceItem = {
  id: string;
  title: string;
  kind: "main" | "fn";
  fnId?: string; // kind==="fn" のときに紐づく（あれば）
};
type CreateFnResult = { fnId: string; wsId: string };

type Props = {
  // 表示用
  fns: NamedFnItem[];

  // 現在WSに挿入（リボンのボタン）
  onInsertCurrent: (fnId: string) => void;

  // 管理モーダル用：WS一覧
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;

  // WS切替
  onSwitchWorkspace: (wsId: string) => void;

  // 新規/複製/削除/リネーム（fnIdベース）
  onCreateFn: () => CreateFnResult;
  onDuplicateFn: (fnId: string) => void;
  onDeleteFn: (fnId: string) => void;
  onRenameFn?: (fnId: string, newName: string) => void;

  // メインへ自動切替して挿入（確定仕様）
  onInsertToMain: (fnId: string) => void;
  onInsertCurrentParam: () => void;
};

export function NamedFunctionsTab(props: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredFns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return props.fns;
    return props.fns.filter((f) => f.name.toLowerCase().includes(q));
  }, [props.fns, query]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <div className="text-sm opacity-80">名前付き関数</div>

        <button
          className="ml-auto rounded border px-3 py-1 text-sm hover:bg-black/5"
          onClick={() => setOpen(true)}
        >
          ワークスペースを管理
        </button>
      </div>
      <button
        className="rounded border px-3 py-1 text-sm hover:bg-black/5"
        onClick={() => props.onInsertCurrentParam()}
        title="param ブロックを挿入"
      >
        ＋ param
      </button>

      <div className="flex items-center gap-2">
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          placeholder="関数名で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded border px-3 py-1 text-sm hover:bg-black/5"
          onClick={() => props.onCreateFn()}
          title="新しい名前付き関数を作成"
        >
          ＋新規
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredFns.map((fn) => (
          <button
            key={fn.id}
            className="rounded border px-3 py-1 text-sm hover:bg-black/5"
            onClick={() => props.onInsertCurrent(fn.id)}
            title={`${fn.name}(${fn.params.join(", ")}) を現在のWSに挿入`}
          >
            {fn.name}
          </button>
        ))}
        {filteredFns.length === 0 && (
          <div className="text-sm opacity-60">該当する関数がありません</div>
        )}
      </div>

      {open && (
        <WorkspaceManageModal
          workspaces={props.workspaces}
          activeWorkspaceId={props.activeWorkspaceId}
          fns={props.fns}
          onClose={() => setOpen(false)}
          onSwitchWorkspace={(wsId) => {
            props.onSwitchWorkspace(wsId);
            setOpen(false); // “開く”は閉じる
          }}
          onCreateFn={() => {
            const { fnId, wsId } = createNamedFunction("A", []);
            return { fnId, wsId };
          }}
          onDuplicateFn={props.onDuplicateFn}
          onDeleteFn={props.onDeleteFn}
          onRenameFn={props.onRenameFn}
          onInsertToMain={(fnId) => {
            props.onInsertToMain(fnId);
            setOpen(false); // 挿入したら閉じる
          }}
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
}) {
  const [rename, setRename] = useState<{ fnId: string; name: string } | null>(
    null
  );

  const main = props.workspaces.find((w) => w.kind === "main");
  const fnWorkspaces = props.workspaces.filter((w) => w.kind === "fn");

  // Escで閉じる
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);

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
  }, [fnWorkspaces, props.activeWorkspaceId]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 p-4 z-[10000]"
      onMouseDown={(e) => {
        // 背景クリックで閉じる
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white shadow-lg"
        onMouseDown={(e) => {
          // ★中身クリックは背景へ伝播させない（閉じ事故防止）
          e.stopPropagation();
        }}
      >
        <div className="flex items-center border-b p-3">
          <div className="text-base font-semibold">ワークスペース管理</div>
          <button
            className="ml-auto rounded border px-3 py-1 text-sm hover:bg-black/5"
            onClick={props.onClose}
          >
            閉じる
          </button>
        </div>

        <div className="p-3">
          {/* メイン */}
          <div className="mb-4">
            <div className="mb-2 text-sm font-semibold opacity-80">
              メインワークスペース
            </div>

            {main ? (
              <WsRow
                title={main.title}
                active={props.activeWorkspaceId === main.id}
                onOpen={() => props.onSwitchWorkspace(main.id)}
                right={null}
              />
            ) : (
              <div className="text-sm opacity-60">
                メインワークスペースが見つかりません（異常）
              </div>
            )}
          </div>

          {/* 名前付き関数 */}
          <div>
            <div className="mb-2 flex items-center">
              <div className="text-sm font-semibold opacity-80">
                名前付き関数
              </div>
              <button
                className="ml-auto rounded border px-3 py-1 text-sm hover:bg-black/5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const created = props.onCreateFn();
                  setRename({ fnId: created.fnId, name: "" });

                  // ★ここでは props.onClose() しない（閉じない）
                }}
              >
                ＋ 新規作成
              </button>
            </div>

            <div className="flex flex-col gap-2 ">
              {fnWorkspaces.map((ws) => {
                const fn = fnByWsId.get(ws.id);
                const fnId = fn?.id ?? ws.fnId ?? "";
                const fnName = fn?.name ?? ws.title ?? "???";

                const canOperate = Boolean(fnId);

                return (
                  <WsRow
                    key={ws.id}
                    title={fnName}
                    sub={
                      fn?.params?.length
                        ? `(${fn.params.join(", ")})`
                        : "(引数なし)"
                    }
                    active={props.activeWorkspaceId === ws.id}
                    onOpen={() => props.onSwitchWorkspace(ws.id)}
                    right={
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                          disabled={!canOperate}
                          onClick={() => props.onInsertToMain(fnId)}
                          title="メインへ切り替えて挿入"
                        >
                          メインに挿入
                        </button>

                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                          disabled={!canOperate}
                          onClick={() =>
                            setRename({ fnId, name: fnName || "" })
                          }
                        >
                          名前変更
                        </button>

                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                          disabled={!canOperate}
                          onClick={() => props.onDuplicateFn(fnId)}
                        >
                          複製
                        </button>

                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                          disabled={!canOperate}
                          onClick={() => {
                            const ok = window.confirm(
                              `「${fnName}」を削除しますか？\n呼び出しブロックは未定義状態になります。`
                            );
                            if (!ok) return;
                            props.onDeleteFn(fnId);
                          }}
                        >
                          削除
                        </button>
                      </div>
                    }
                  />
                );
              })}

              {fnWorkspaces.length === 0 && (
                <div className="text-sm opacity-60">
                  まだ名前付き関数がありません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* rename modal-in-modal (簡易) */}
        {rename && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setRename(null);
            }}
          >
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
              <div className="flex items-center border-b p-3">
                <div className="text-base font-semibold">名前変更</div>
                <button
                  className="ml-auto rounded border px-3 py-1 text-sm hover:bg-black/5"
                  onClick={() => setRename(null)}
                >
                  閉じる
                </button>
              </div>

              <div className="p-3">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={rename.name}
                  onChange={(e) =>
                    setRename((r) => (r ? { ...r, name: e.target.value } : r))
                  }
                  placeholder="関数名"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded border px-3 py-1 text-sm hover:bg-black/5"
                    onClick={() => setRename(null)}
                  >
                    キャンセル
                  </button>
                  <button
                    className="rounded border px-3 py-1 text-sm hover:bg-black/5 disabled:opacity-40"
                    disabled={!props.onRenameFn || !rename.name.trim()}
                    onClick={() => {
                      if (!props.onRenameFn) return;
                      props.onRenameFn(rename.fnId, rename.name.trim());
                      setRename(null);
                    }}
                  >
                    保存
                  </button>
                </div>

                {!props.onRenameFn && (
                  <div className="mt-2 text-xs opacity-60">
                    ※ onRenameFn が未接続のため、現状は保存できません
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WsRow(props: {
  title: string;
  sub?: string | null;
  active: boolean;
  onOpen: () => void;
  right: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded border p-2 ${
        props.active ? "bg-black/5" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {props.title}{" "}
          {props.sub ? <span className="opacity-60">{props.sub}</span> : null}
        </div>
        <div className="text-xs opacity-60">
          {props.active ? "現在開いています" : ""}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded border px-2 py-1 text-xs hover:bg-black/5"
          onClick={props.onOpen}
        >
          開く
        </button>
        {props.right}
      </div>
    </div>
  );
}
