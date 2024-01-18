import type { DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";
import { TSON } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import type { Canvas } from "../index";
import { DRAG_KEY } from "../utils/constant";

export class Insert {
  private _on: boolean;
  constructor(private editor: Editor, private engine: Canvas) {
    this._on = false;
    this.editor.event.on(EDITOR_EVENT.DROP, this.onDrop);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.DROP, this.onDrop);
  }

  public get on() {
    return this._on;
  }

  public start() {
    if (this._on) return void 0;
    this._on = true;
    this.engine.mask.clear();
    this.engine.mask.setCursorState(null);
    this.editor.selection.clearActiveDeltas();
  }

  public close() {
    if (!this._on) return void 0;
    this._on = false;
    this.engine.mask.setCursorState(null);
    this.editor.event.trigger(EDITOR_EVENT.INSERT_STATE, { done: true });
  }

  public onDrop = (e: DragEvent) => {
    const point = Point.from(e, this.editor);
    const payload = e.dataTransfer && e.dataTransfer.getData(DRAG_KEY);
    if (!payload) return void 0;
    const data = TSON.decode<DeltaLike>(payload);
    if (!data) return void 0;
    const deltaLike: DeltaLike = {
      ...data,
      x: point.x,
      y: point.y,
    };
    const delta = DeltaSet.create(deltaLike);
    delta && this.editor.state.apply(Op.from(OP_TYPE.INSERT, { delta }));
  };
}
