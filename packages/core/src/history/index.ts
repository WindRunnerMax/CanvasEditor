import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import type { ContentChangeEvent } from "../event/bus/types";
import type { FlatOp } from "../state/utils/types";

export class History {
  private undoStack: FlatOp[][];
  private redoStack: FlatOp[][];
  constructor(private editor: Editor) {
    this.redoStack = [];
    this.undoStack = [];
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }

  private onContentChange = (e: ContentChangeEvent) => {
    if (!e.options.undoable) return void 0;
  };
}
