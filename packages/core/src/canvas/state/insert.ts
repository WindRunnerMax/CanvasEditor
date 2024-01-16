import type { DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";
import { TSON } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import type { Canvas } from "../index";

export class Insert {
  constructor(private editor: Editor, private engine: Canvas) {
    this.editor.event.on(EDITOR_EVENT.DROP, this.onDrop);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.DROP, this.onDrop);
  }

  public onDrop = (e: DragEvent) => {
    const point = Point.from(e, this.editor);
    const payload = e.dataTransfer?.getData("data");
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
