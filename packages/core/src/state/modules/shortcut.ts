import { Op, OP_TYPE } from "sketching-delta";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";

export class Shortcut {
  constructor(private editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
    this.editor.event.on(EDITOR_EVENT.KEY_UP, this.onKeyup);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
    this.editor.event.off(EDITOR_EVENT.KEY_UP, this.onKeyup);
  }

  onKeydown = (e: KeyboardEvent) => {
    if (!this.editor.canvas.isActive()) return void 0;
    if (e.key === "Backspace") {
      const ids = this.editor.selection.getActiveDeltaIds();
      ids.forEach(id => {
        this.editor.state.apply(new Op(OP_TYPE.DELETE, { id }));
      });
      this.editor.selection.clearActiveDeltas();
    } else if (e.key === " ") {
      this.editor.canvas.grab.start();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  onKeyup = (e: KeyboardEvent) => {
    if (e.key === " ") {
      this.editor.canvas.grab.close();
      e.preventDefault();
      e.stopPropagation();
    }
  };
}
