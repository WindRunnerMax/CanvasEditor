import type { DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import type { Canvas } from "../index";

const DEFAULT_RECT = { width: 200, height: 100 } as const;

export class Insert {
  constructor(private editor: Editor, private engine: Canvas) {
    this.editor.event.on(EDITOR_EVENT.DROP, this.onDrop);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.DROP, this.onDrop);
  }

  public onDrop = (e: DragEvent) => {
    const point = Point.from(e, this.editor);
    const key = e.dataTransfer?.getData("key");
    if (!key) return void 0;
    const deltaLike: DeltaLike = {
      key,
      x: point.x,
      y: point.y,
      width: DEFAULT_RECT.width,
      height: DEFAULT_RECT.height,
    };
    const delta = DeltaSet.create(deltaLike);
    delta && this.editor.state.apply(Op.from(OP_TYPE.INSERT, { delta }));
  };
}
