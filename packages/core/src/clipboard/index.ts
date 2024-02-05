import type { DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";
import { getUniqueId, ROOT_DELTA, TSON } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "../selection/modules/range";

export class Clipboard {
  public static KEY = "SKETCHING_CLIPBOARD_KEY";

  constructor(private editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.COPY, this.onCopy);
    this.editor.event.on(EDITOR_EVENT.CUT, this.onCut);
    this.editor.event.on(EDITOR_EVENT.PASTE, this.onPaste);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.COPY, this.onCopy);
    this.editor.event.off(EDITOR_EVENT.CUT, this.onCut);
    this.editor.event.off(EDITOR_EVENT.PASTE, this.onPaste);
  }

  private copyFromCanvas = (e: ClipboardEvent, isCut = false) => {
    const clipboardData = e.clipboardData;
    if (clipboardData) {
      const ids = this.editor.selection.getActiveDeltaIds();
      if (ids.size === 0) return void 0;
      const data: Record<string, DeltaLike> = {};
      for (const id of ids) {
        const delta = this.editor.deltaSet.get(id);
        if (!delta) return void 0;
        data[id] = delta.toJSON();
        if (isCut) {
          const parentId = this.editor.state.getDeltaStateParentId(id);
          this.editor.state.apply(new Op(OP_TYPE.DELETE, { id, parentId }));
        }
      }
      const str = TSON.stringify(data);
      str && clipboardData.setData(Clipboard.KEY, str);
      clipboardData.setData("text/plain", "请在编辑器中粘贴");
      isCut && this.editor.canvas.mask.clearWithOp();
      e.stopPropagation();
      e.preventDefault();
    }
  };

  private onCopy = (e: ClipboardEvent) => {
    if (!this.editor.canvas.isActive()) return void 0;
    this.copyFromCanvas(e);
  };

  private onCut = (e: ClipboardEvent) => {
    if (!this.editor.canvas.isActive()) return void 0;
    this.copyFromCanvas(e, true);
  };

  private onPaste = (e: ClipboardEvent) => {
    if (!this.editor.canvas.isActive()) return void 0;
    const clipboardData = e.clipboardData;
    if (clipboardData) {
      const str = clipboardData.getData(Clipboard.KEY);
      const data = str && TSON.parse<Record<string, DeltaLike>>(str);
      if (data) {
        let range: Range | null = null;
        Object.values(data).forEach(deltaLike => {
          const { x, y, width, height } = deltaLike;
          const current = Range.fromRect(x, y, width, height);
          range = range ? range.compose(current) : current;
        });
        const compose = range as unknown as Range;
        if (compose) {
          const center = compose.center();
          const cursor = this.editor.canvas.root.cursor;
          const { x, y } = center.diff(cursor);
          Object.values(data).forEach(deltaLike => {
            const id = getUniqueId();
            deltaLike.id = id;
            deltaLike.x = deltaLike.x + x;
            deltaLike.y = deltaLike.y + y;
            const delta = DeltaSet.create(deltaLike);
            delta &&
              this.editor.state.apply(new Op(OP_TYPE.INSERT, { delta, parentId: ROOT_DELTA }));
          });
        }
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };
}
