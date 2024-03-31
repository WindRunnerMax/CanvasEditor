import { Op, OP_TYPE } from "sketching-delta";

import { RESIZE_LEN } from "../../canvas/utils/constant";
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
    const ids = [...this.editor.selection.getActiveDeltaIds()];
    if (e.key === "Backspace") {
      ids.forEach(id => {
        const parentId = this.editor.state.getDeltaStateParentId(id);
        this.editor.state.apply(new Op(OP_TYPE.DELETE, { id, parentId }));
      });
      this.editor.selection.clearActiveDeltas();
    } else if (e.key === " ") {
      this.editor.canvas.grab.start();
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      this.editor.state.apply(new Op(OP_TYPE.MOVE, { ids, x: 0, y: -1 }));
      this.onSelectionMove(0, -1);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      this.editor.state.apply(new Op(OP_TYPE.MOVE, { ids, x: 0, y: 1 }));
      this.onSelectionMove(0, 1);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      this.editor.state.apply(new Op(OP_TYPE.MOVE, { ids, x: -1, y: 0 }));
      this.onSelectionMove(-1, 0);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      this.editor.state.apply(new Op(OP_TYPE.MOVE, { ids, x: 1, y: 0 }));
      this.onSelectionMove(1, 0);
      e.preventDefault();
    } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      e.shiftKey ? this.editor.history.redo() : this.editor.history.undo();
    } else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
      this.editor.selection.selectAll();
      e.preventDefault();
    }
  };

  onKeyup = (e: KeyboardEvent) => {
    if (e.key === " ") {
      this.editor.canvas.grab.close();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  onSelectionMove = (x: number, y: number) => {
    const selection = this.editor.selection.get();
    if (selection) {
      this.editor.selection.set(selection.move(x, y));
      const zoom = selection.zoom(RESIZE_LEN).zoom(1);
      this.editor.canvas.mask.drawingEffect(zoom, { immediately: true });
    }
  };
}
