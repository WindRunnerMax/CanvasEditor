import type { OpSetType } from "sketching-delta";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import type { ContentChangeEvent } from "../event/bus/types";
import { APPLY_SOURCE } from "../state/utils/constant";

export class History {
  private readonly DELAY = 800;
  private readonly STACK_SIZE = 100;
  private temp: OpSetType[];
  private undoStack: OpSetType[][];
  private redoStack: OpSetType[][];
  private timer: ReturnType<typeof setTimeout> | null;

  constructor(private editor: Editor) {
    this.temp = [];
    this.timer = null;
    this.redoStack = [];
    this.undoStack = [];
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange, 10);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }

  public clear() {
    this.temp = [];
    this.undoStack = [];
    this.redoStack = [];
    this.timer && clearTimeout(this.timer);
    this.timer = null;
  }

  public canUndo() {
    return this.undoStack.length > 0 || this.temp.length > 0;
  }

  public canRedo() {
    return this.redoStack.length > 0;
  }

  private collectImmediately = () => {
    if (!this.temp.length) return void 0;
    this.undoStack.push(this.temp);
    this.temp = [];
    this.redoStack = [];
    this.timer && clearTimeout(this.timer);
    this.timer = null;
    if (this.undoStack.length > this.STACK_SIZE) {
      this.undoStack.shift();
    }
  };

  private onContentChange = (e: ContentChangeEvent) => {
    if (!e.options.undoable) return void 0;
    this.redoStack = [];
    const { previous, changes } = e;
    const invert = changes.invert(previous);
    if (!invert) return void 0;
    this.temp.push(invert);
    if (!this.timer) {
      this.timer = setTimeout(this.collectImmediately, this.DELAY);
    }
  };

  public undo() {
    this.collectImmediately();
    if (!this.undoStack.length) return void 0;
    const ops = this.undoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.redoStack.push(
      ops.map(op => op.invert(this.editor.deltaSet)).filter(Boolean) as OpSetType[]
    );
    this.editor.logger.debug("UNDO", ops);
    ops.forEach(op =>
      this.editor.state.apply(op, { source: APPLY_SOURCE.HISTORY, undoable: false })
    );
  }

  public redo() {
    if (!this.redoStack.length) return void 0;
    const ops = this.redoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.undoStack.push(
      ops.map(op => op.invert(this.editor.deltaSet)).filter(Boolean) as OpSetType[]
    );
    this.editor.logger.debug("REDO", ops);
    ops.forEach(op =>
      this.editor.state.apply(op, { source: APPLY_SOURCE.HISTORY, undoable: false })
    );
  }
}
