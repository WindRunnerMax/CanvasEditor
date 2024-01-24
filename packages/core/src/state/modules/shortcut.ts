import { Op, OP_TYPE } from "sketching-delta";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";

export class Shortcut {
  constructor(private editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  onKeydown = (e: KeyboardEvent) => {
    if (!this.editor.canvas.isActive()) return void 0;
    if (e.key === "Backspace") {
      const ids = this.editor.selection.getActiveDeltaIds();
      ids.forEach(id => {
        this.editor.state.apply(new Op(OP_TYPE.DELETE, { id }));
      });
      this.editor.selection.clearActiveDeltas();
    }
  };
}
