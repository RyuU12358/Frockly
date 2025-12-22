import * as Blockly from "blockly";
import { ExcelGen } from "../basic/generators";

function getTempCollapsedField(block: Blockly.Block) {
  // Blocklyが折りたたみ時に作る一時フィールド
  return block.getField("_TEMP_COLLAPSED_FIELD") as any;
}

function setHeaderUiMode(block: Blockly.Block, collapsed: boolean) {
  // 折りたたみ中：関数名＆mutatorを消す、プレビューを出す
  setFieldVisible(block, "FN_NAME", !collapsed);

  setFieldVisible(block, "SP_DYN", !collapsed);
  setFieldVisible(block, "BTN_MINUS", !collapsed);
  setFieldVisible(block, "ARGC_LABEL", !collapsed);
  setFieldVisible(block, "BTN_PLUS", !collapsed);

  setFieldVisible(block, "PREVIEW_TEXT", collapsed);
}

function fnNameOf(block: Blockly.Block) {
  return block.type.startsWith("frockly_")
    ? block.type.slice("frockly_".length)
    : block.type;
}

function oneLine(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}
function clamp(s: string, n = 90) {
  const t = oneLine(s);
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function computePreview(block: Blockly.Block) {
  const out = (ExcelGen as any).blockToCode(block);
  const code = Array.isArray(out) ? out[0] : out;
  return String(code ?? "");
}

function setArgInputsVisible(block: Blockly.Block, visible: boolean) {
  for (let i = 0; i < 512; i++) {
    const input = block.getInput(`ARG${i}`);
    if (!input) break;
    input.setVisible(visible);
  }
}

function setFieldVisible(
  block: Blockly.Block,
  fieldName: string,
  visible: boolean
) {
  const f: any = block.getField(fieldName);
  const svg = f?.getSvgRoot?.();
  if (svg) svg.style.display = visible ? "" : "none";
}

export function registerFnUiExtension() {
  const extAny = Blockly.Extensions as any;
  if (extAny?.extensions_?.["frockly_fn_ui"]) return;

  Blockly.Extensions.register("frockly_fn_ui", function (this: Blockly.Block) {
    // ★ヘッダ input は「無ければ作る、あれば使う」
    const header =
      this.getInput("FN_HEADER") ?? this.appendDummyInput("FN_HEADER");

    // ★関数名は「FN_NAMEが無ければ追加」
    if (!this.getField("FN_NAME")) {
      header.insertFieldAt(0, fnNameOf(this), "FN_NAME"); // 左に固定したいなら insert
    }

    // ★プレビューも「PREVIEW_TEXTが無ければ追加」
    if (!this.getField("PREVIEW_TEXT")) {
      header.appendField(
        new Blockly.FieldLabelSerializable("", "preview"),
        "PREVIEW_TEXT"
      );
      setFieldVisible(this, "PREVIEW_TEXT", false);
      setHeaderUiMode(this, false);
    }

    const update = (reason: string) => {
      const ws = this.workspace;
      if (!ws) return;

      const isCollapsed =
        (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;
      if (isCollapsed) {
        // ※折りたたみ時は Blockly が input 自体を隠すから
        // setArgInputsVisible(this,false) は正直どっちでもいい（残してもOK）

        let text = "";
        try {
          text = computePreview(this);
        } catch {
          text = "(preview error)";
        }
        const preview = "=" + clamp(text);

        // ★ここが本命：TEMPフィールドに入れる
        const temp = getTempCollapsedField(this);
        if (temp?.setValue) {
          temp.setValue(preview);
        } else {
          // TEMPがまだ作られてない瞬間があるので、次tickで再試行
          setTimeout(() => {
            const t2 = getTempCollapsedField(this);
            t2?.setValue?.(preview);
            (this as any).render?.();
            this.workspace?.resize();
          }, 0);
        }

        // FN_HEADER 側のフィールド操作は、折りたたみ中は表示されへんから不要
      } else {
        // 展開時はいつも通り
        setArgInputsVisible(this, true);

        // 念のため（展開時はFN_HEADERが見える）
        this.getField("PREVIEW_TEXT")?.setValue("");
        setFieldVisible(this, "PREVIEW_TEXT", false);
      }

      (this as any).render?.();
      ws.resize();
      // 変更後スナップ

      // ★少し遅延させて “戻されてないか” チェック
    };

    function tryWriteTemp(block: Blockly.Block, label: string) {
      const f: any = block.getField("_TEMP_COLLAPSED_FIELD");
      console.log(
        "[TEMP] field =",
        f,
        "text=",
        f?.getText?.(),
        "value=",
        f?.getValue?.()
      );

      if (!f) return false;

      const s = label;

      // setValue
      if (typeof f.setValue === "function") {
        try {
          f.setValue(s);
          console.log("[TEMP] setValue ok");
        } catch (e) {
          console.log("[TEMP] setValue fail", e);
        }
      }

      // setText
      if (typeof f.setText === "function") {
        try {
          f.setText(s);
          console.log("[TEMP] setText ok");
        } catch (e) {
          console.log("[TEMP] setText fail", e);
        }
      }

      console.log(
        "[TEMP] after text=",
        f?.getText?.(),
        "value=",
        f?.getValue?.()
      );
      return true;
    }
    function id6(b: Blockly.Block) {
      return b.id.slice(0, 6);
    }
    function dbg(block: Blockly.Block, tag: string, data?: any) {
      console.log(`[FNUI ${id6(block)}] ${tag}`, data ?? "");
    }

    function readTemp(block: Blockly.Block) {
      const f: any = block.getField("_TEMP_COLLAPSED_FIELD");
      return {
        has: !!f,
        text: f?.getText?.(),
        value: f?.getValue?.(),
        display: f?.getSvgRoot?.()?.style?.display ?? "(no-svg)",
      };
    }
    type AnyBlock = Blockly.Block & { __frocklyCollapsedText?: string };

    function writeTempQuiet(block: Blockly.Block, s: string) {
      const f: any = block.getField("_TEMP_COLLAPSED_FIELD");
      if (!f?.setValue) return false;

      // ★イベント止めて書く（field-change を発生させない）
      Blockly.Events.disable();
      try {
        f.setValue(s);
      } finally {
        Blockly.Events.enable();
      }
      return true;
    }
    function computeCollapsedText(block: Blockly.Block) {
      let code = "";
      try {
        code = computePreview(block);
      } catch {
        code = "(preview error)";
      }
      return "=" + clamp(code);
    }
    function ensureRenderHook(ws: any) {
      if (!ws || ws.__frocklyRenderHooked) return;
      ws.__frocklyRenderHooked = true;

      const orig = ws.render?.bind(ws);
      if (!orig) return;

      ws.render = () => {
        orig();

        // renderが終わった後に、折りたたみブロックのTEMPを上書き
        const blocks: Blockly.Block[] = ws.getAllBlocks?.(false) ?? [];
        for (const b of blocks) {
          const collapsed =
            (b as any).isCollapsed?.() ?? (b as any).collapsed ?? false;
          const txt = (b as any).__frocklyCollapsedText;
          if (!collapsed || !txt) continue;

          writeTempQuiet(b, txt);
        }
      };
    }

    this.setOnChange((e: any) => {
      type AnyBlock = Blockly.Block & { __frocklyCollapsedText?: string };

      function updateCollapsedCache(block: AnyBlock) {
        let code = "";
        try {
          code = computePreview(block);
        } catch {
          code = "(preview error)";
        }
        block.__frocklyCollapsedText = "=" + clamp(code);
      }

      if (!e) return;
      if (e.blockId !== this.id) return;

      ensureRenderHook(this.workspace as any);

      // 折りたたみ切替
      if (e.type === Blockly.Events.BLOCK_CHANGE && e.element === "collapsed") {
        const collapsed =
          (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;

        if (collapsed) {
          (this as AnyBlock).__frocklyCollapsedText =
            computeCollapsedText(this);
          // ここで即renderしてもいいし、次のレンダーに任せてもOK
          setTimeout(() => (this.workspace as any)?.render?.(), 0);
        } else {
          (this as AnyBlock).__frocklyCollapsedText = undefined;
        }
        return;
      }

      // 折りたたみ中に構造が変わったら、文字だけ更新して render 後フックで勝つ
      const structural =
        e.type === Blockly.Events.BLOCK_MOVE ||
        e.type === Blockly.Events.BLOCK_CREATE ||
        e.type === Blockly.Events.BLOCK_DELETE ||
        (e.type === Blockly.Events.BLOCK_CHANGE && e.element !== "field");

      if (structural) {
        const collapsed =
          (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;
        if (collapsed) {
          updateCollapsedCache(this as any);
          // Blocklyが要約を生成するので、renderさえ走れば勝手にTEMPに入る
          setTimeout(() => (this.workspace as any)?.render?.(), 0);
        } else {
          (this as any).__frocklyCollapsedText = undefined;
        }
      }
    });

    update("init");
  });
}
