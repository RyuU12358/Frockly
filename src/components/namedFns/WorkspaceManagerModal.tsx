import { useEffect, useMemo, useState } from "react";
import type { FnMeta, WorkspaceManagerModalProps } from "./types";
import { clampOneLine, joinSig } from "./text";
import { WsLine } from "./wsLine";

type EditDraft = {
  fnId: string;
  name: string;
  description: string;
  params: string; // comma-separated
};

export function WorkspaceManagerModal(props: WorkspaceManagerModalProps) {
  const { main, fnWorkspaces } = props;

  const [selectedWsId, setSelectedWsId] = useState<string>(
    props.activeWorkspaceId
  );

  const [editingFnId, setEditingFnId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  const selectedFn = useMemo(() => {
    const ws = fnWorkspaces.find((w) => w.id === selectedWsId);
    if (!ws) return undefined;
    return props.fnByWsId.get(ws.id);
  }, [fnWorkspaces, props.fnByWsId, selectedWsId]);

  const selectedIsMain = selectedWsId === (main?.id ?? "");

  const startEdit = (fn: FnMeta | undefined) => {
    if (!fn) return;
    setEditingFnId(fn.id);
    setDraft({
      fnId: fn.id,
      name: fn.name ?? "",
      description: fn.description ?? "",
      params: (fn.params ?? []).join(", "),
    });
    setDirty(false);
  };

  const cancelEdit = () => {
    setEditingFnId(null);
    setDraft(null);
    setDirty(false);
  };

  const saveEdit = () => {
    if (!draft) return;
    const name = draft.name.trim();
    const description = draft.description.trim();

    const params = draft.params
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name) return;

    props.onUpdateFnMeta?.(draft.fnId, {
      name,
      description: description || undefined,
      params: params.length ? params : [],
    });

    props.onRenameFn?.(draft.fnId, name);

    setDirty(false);
    console.log("[NAMED] save meta", draft.fnId, { name, description, params });
  };

  const createAndEdit = () => {
    const created = props.onCreateFn();
    setSelectedWsId(created.wsId);
    setEditingFnId(created.fnId);
    setDraft({ fnId: created.fnId, name: "", description: "", params: "" });
    setDirty(false);
  };

  const canSave = !!draft?.name.trim() && !!props.onUpdateFnMeta;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        className="w-full max-w-5xl border border-slate-300 bg-white"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-[40px] items-center border-b border-emerald-700 bg-emerald-600 px-3">
          <div className="text-sm font-semibold text-white">
            ワークスペース管理
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="h-[28px] border border-emerald-200 bg-emerald-50 px-3 text-xs text-emerald-900 hover:bg-white active:bg-emerald-100"
              onClick={props.onClose}
            >
              閉じる
            </button>
          </div>
        </div>

        {/* Body: 2 columns */}
        <div className="grid grid-cols-12 gap-0">
          {/* Left list */}
          <div className="col-span-7 border-r border-slate-200">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="text-xs font-semibold text-slate-600">
                ワークスペース一覧
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="h-[28px] border border-slate-300 bg-white px-3 text-xs hover:bg-slate-100 active:bg-slate-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createAndEdit();
                  }}
                  title="新しい名前付き関数を作成"
                >
                  ＋ 新規作成
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-2 pb-2">
              {/* Main */}
              <div className="mb-2">
                <div className="px-1 py-1 text-[11px] font-semibold text-slate-500">
                  メイン
                </div>
                {main ? (
                  <WsLine
                    selected={selectedWsId === main.id}
                    active={props.activeWorkspaceId === main.id}
                    title={main.title ?? "メインワークスペース"}
                    subtitle=""
                    onClick={() => setSelectedWsId(main.id)}
                    onOpen={() => props.onSwitchWorkspace(main.id)}
                    onInsert={null}
                    onEdit={null}
                    onDuplicate={null}
                    onDelete={null}
                  />
                ) : (
                  <div className="px-2 py-2 text-xs text-slate-500">
                    メインワークスペースが見つかりません（異常）
                  </div>
                )}
              </div>

              {/* Named */}
              <div>
                <div className="px-1 py-1 text-[11px] font-semibold text-slate-500">
                  名前付き関数
                </div>

                {fnWorkspaces.length === 0 && (
                  <div className="px-2 py-2 text-xs text-slate-500">
                    まだ名前付き関数がありません
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {fnWorkspaces.map((ws) => {
                    const fn = props.fnByWsId.get(ws.id);
                    const fnId = fn?.id ?? ws.fnId ?? "";
                    const canOperate = Boolean(fnId);

                    const sig = joinSig(fn?.params);
                    const desc = clampOneLine(fn?.description ?? "", 80);
                    const subtitle = desc ? `${sig} — ${desc}` : sig;

                    return (
                      <WsLine
                        key={ws.id}
                        selected={selectedWsId === ws.id}
                        active={props.activeWorkspaceId === ws.id}
                        title={fn?.name ?? ws.title ?? "???"}
                        subtitle={subtitle}
                        onClick={() => setSelectedWsId(ws.id)}
                        onOpen={() => props.onSwitchWorkspace(ws.id)}
                        onInsert={
                          canOperate ? () => props.onInsertToMain(fnId) : null
                        }
                        onEdit={canOperate ? () => startEdit(fn) : null}
                        onDuplicate={
                          canOperate ? () => props.onDuplicateFn(fnId) : null
                        }
                        onDelete={
                          canOperate
                            ? () => {
                                const ok = window.confirm(
                                  `「${
                                    fn?.name ?? ws.title ?? "???"
                                  }」を削除しますか？\n呼び出しブロックは未定義状態になります。`
                                );
                                if (!ok) return;
                                props.onDeleteFn(fnId);
                                if (editingFnId === fnId) cancelEdit();
                              }
                            : null
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right editor */}
          <div className="col-span-5">
            <div className="flex items-center border-b border-slate-200 bg-white px-3 py-2">
              <div className="text-xs font-semibold text-slate-600">編集</div>
              <div className="ml-auto">
                {dirty && (
                  <div className="text-[11px] text-slate-500">未保存</div>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              {selectedIsMain ? (
                <div className="text-sm text-slate-700">
                  <div className="mb-2 font-semibold">メインワークスペース</div>
                  <div className="text-xs text-slate-500">
                    メインはここでは編集しません。「開く」で切り替えて編集してください。
                  </div>
                </div>
              ) : editingFnId && draft ? (
                <>
                  <div className="mb-3">
                    <div className="mb-1 text-[11px] font-semibold text-slate-600">
                      関数名
                    </div>
                    <input
                      autoFocus
                      className="w-full border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-slate-500"
                      value={draft.name}
                      onChange={(e) => {
                        setDraft((d) =>
                          d ? { ...d, name: e.target.value } : d
                        );
                        setDirty(true);
                      }}
                      placeholder="関数名"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 text-[11px] font-semibold text-slate-600">
                      説明
                    </div>
                    <textarea
                      className="w-full border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-slate-500"
                      rows={5}
                      value={draft.description}
                      onChange={(e) => {
                        setDraft((d) =>
                          d ? { ...d, description: e.target.value } : d
                        );
                        setDirty(true);
                      }}
                      placeholder="説明（検索・ホバーで表示されます）"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="h-[30px] border border-slate-300 bg-white px-3 text-xs hover:bg-slate-100 active:bg-slate-200"
                      onClick={cancelEdit}
                    >
                      キャンセル
                    </button>

                    <button
                      className="h-[30px] border border-slate-300 bg-white px-3 text-xs hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
                      disabled={!canSave}
                      onClick={saveEdit}
                      title={
                        !props.onUpdateFnMeta
                          ? "onUpdateFnMeta が未接続です"
                          : ""
                      }
                    >
                      保存
                    </button>
                  </div>

                  {!props.onUpdateFnMeta && (
                    <div className="mt-2 text-xs text-slate-500">
                      ※ onUpdateFnMeta が未接続のため、現状は保存できません
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-700">
                  <div className="mb-2 font-semibold">編集の使い方</div>
                  <div className="text-xs text-slate-500">
                    左の一覧で関数を選んで「編集」を押すと、ここに編集フォームが出ます。
                  </div>

                  {selectedFn && (
                    <div className="mt-4 border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                      <div className="font-semibold">{selectedFn.name}</div>
                      <div className="mt-1">{joinSig(selectedFn.params)}</div>
                      {selectedFn.description && (
                        <div className="mt-1">
                          {clampOneLine(selectedFn.description, 200)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
